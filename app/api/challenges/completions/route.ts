import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  ensureChallengeStatusRows,
  getChallengeLeaderboard,
  getChallengeBonusXp,
  getChallengeStatuses,
  setChallengeStatus,
  saveEnglishChallengeCompletion,
  getEnglishUserProgress,
  type ChallengeStatus,
} from "@/lib/db";
import { ALL_CHALLENGES, calculateSpeedBonusXp } from "@/lib/challengesData";
import { ALL_ENGLISH_CHALLENGES } from "@/lib/englishChallengesData";

const challengeIds = new Set(ALL_CHALLENGES.map((challenge) => challenge.id));
const englishChallengeMap = new Map(ALL_ENGLISH_CHALLENGES.map((c) => [c.id, c]));

const isChallengeStatus = (value: unknown): value is ChallengeStatus =>
  value === "resuelto" || value === "erroneo" || value === "faltante";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Inicia sesión para cargar tus retos completados." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "dev";

    if (mode === "english") {
      const progress = await getEnglishUserProgress(session.userId);
      return NextResponse.json({
        mode: "english",
        progress,
        completed: progress.completedChallengeIds,
      });
    }

    await ensureChallengeStatusRows(session.userId, ALL_CHALLENGES.map((challenge) => challenge.id));
    const [statuses, bonusXP] = await Promise.all([
      getChallengeStatuses(session.userId),
      getChallengeBonusXp(session.userId),
    ]);
    return NextResponse.json({
      mode: "dev",
      statuses,
      bonusXP,
      completed: Object.entries(statuses)
        .filter(([, status]) => status === "resuelto")
        .map(([challengeId]) => challengeId),
    });
  } catch (error) {
    console.error("Error al cargar retos completados:", error);
    return NextResponse.json({ error: "No se pudieron cargar los retos completados." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Inicia sesión para guardar la finalización de retos." }, { status: 401 });
    }

    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "El reto indicado no es válido." }, { status: 400 });
    }

    // Check if mode is English
    if ("mode" in body && body.mode === "english" && "challengeId" in body && typeof body.challengeId === "string") {
      const challengeId = body.challengeId;
      const challenge = englishChallengeMap.get(challengeId);
      const isSuccess = "isSuccess" in body ? Boolean(body.isSuccess) : true;
      const elapsedMs = "elapsedMs" in body && typeof body.elapsedMs === "number" ? body.elapsedMs : 0;
      const basePoints = challenge?.xp || 50;

      await saveEnglishChallengeCompletion(
        session.userId,
        challengeId,
        isSuccess ? "resuelto" : "erroneo",
        isSuccess ? basePoints : 0,
        elapsedMs,
      );

      const progress = await getEnglishUserProgress(session.userId);
      return NextResponse.json({ success: true, mode: "english", progress });
    }

    const challengeIdsToSave =
      "challengeIds" in body && Array.isArray(body.challengeIds)
        ? body.challengeIds
        : "challengeId" in body
        ? [body.challengeId]
        : [];
    if ("status" in body && !isChallengeStatus(body.status)) {
      return NextResponse.json({ error: "El estado del reto no es válido." }, { status: 400 });
    }
    const status: ChallengeStatus = "status" in body && isChallengeStatus(body.status)
      ? body.status
      : "resuelto";
    const elapsedMs =
      "elapsedMs" in body && typeof body.elapsedMs === "number" && Number.isFinite(body.elapsedMs)
        ? body.elapsedMs
        : 0;
    if ("elapsedMs" in body && typeof body.elapsedMs !== "number") {
      return NextResponse.json({ error: "El tiempo del reto no es válido." }, { status: 400 });
    }
    if (elapsedMs < 0 || elapsedMs > 365 * 24 * 60 * 60 * 1000) {
      return NextResponse.json({ error: "El tiempo del reto no es válido." }, { status: 400 });
    }

    const validIds = challengeIdsToSave.filter(
      (challengeId): challengeId is string =>
        typeof challengeId === "string" && challengeIds.has(challengeId)
    );
    if (
      challengeIdsToSave.length > ALL_CHALLENGES.length ||
      validIds.length !== challengeIdsToSave.length
    ) {
      return NextResponse.json({ error: "La lista de retos indicada no es válida." }, { status: 400 });
    }

    for (const challengeId of new Set(validIds)) {
      const challenge = ALL_CHALLENGES.find((item) => item.id === challengeId);
      if (status === "resuelto" && "challengeId" in body) {
        const answer = "answer" in body && typeof body.answer === "string" ? body.answer.trim().toLowerCase() : "";
        const matchesExpected = challenge?.expectedKeywords.some((keyword) => answer.includes(keyword.toLowerCase()));
        const matchesTags =
          answer.length > 6 && challenge?.tags.some((tag) => answer.includes(tag.toLowerCase()));
        if (!answer || (!matchesExpected && !matchesTags)) {
          return NextResponse.json({ error: "La respuesta no coincide con los criterios del reto." }, { status: 400 });
        }
        if (!("elapsedMs" in body)) {
          return NextResponse.json({ error: "Falta el tiempo transcurrido del reto." }, { status: 400 });
        }
      }
      const xpBonus =
        status === "resuelto" && "challengeId" in body && challenge
          ? calculateSpeedBonusXp(challenge.xp, elapsedMs)
          : 0;
      const pointsEarned =
        status === "resuelto" && challenge ? challenge.xp + xpBonus : 0;
      await setChallengeStatus(
        session.userId,
        challengeId,
        status,
        xpBonus,
        pointsEarned,
        status === "resuelto" && challenge ? elapsedMs : 0,
      );
    }
    await ensureChallengeStatusRows(session.userId, ALL_CHALLENGES.map((challenge) => challenge.id));
    await getChallengeLeaderboard(ALL_CHALLENGES.map(({ id, xp }) => ({ id, xp })));
    const [statuses, bonusXP] = await Promise.all([
      getChallengeStatuses(session.userId),
      getChallengeBonusXp(session.userId),
    ]);
    return NextResponse.json({ success: true, statuses, bonusXP });
  } catch (error) {
    console.error("Error al guardar reto completado:", error);
    return NextResponse.json({ error: "No se pudo guardar el reto completado." }, { status: 500 });
  }
}
