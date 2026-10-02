import { NextResponse } from "next/server";
import { DatabaseUnavailableError, getChallengeLeaderboard } from "@/lib/db";
import { ALL_CHALLENGES } from "@/lib/challengesData";

export async function GET() {
  try {
    const leaderboard = await getChallengeLeaderboard(
      ALL_CHALLENGES.map(({ id, xp }) => ({ id, xp })),
    );

    return NextResponse.json({
      leaderboard: leaderboard.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      })),
    });
  } catch (error) {
    console.error("Error al cargar el ranking de retos:", error);
    return NextResponse.json(
      {
        error: error instanceof DatabaseUnavailableError
          ? "La base de datos no está disponible temporalmente. Inténtalo de nuevo más tarde."
          : "No se pudo cargar el ranking de retos.",
      },
      { status: error instanceof DatabaseUnavailableError ? 503 : 500 },
    );
  }
}
