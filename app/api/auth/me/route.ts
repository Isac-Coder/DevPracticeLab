import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { findUserById } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    const userDb = await findUserById(session.userId);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        email: userDb?.email || session.email,
        username: userDb?.username || session.username,
        created_at: userDb?.created_at || null,
        updated_at: userDb?.updated_at || null,
      },
    });
  } catch (error) {
    console.error("Error en auth/me:", error);
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500 }
    );
  }
}
