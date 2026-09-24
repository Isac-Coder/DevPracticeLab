import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { verifyPassword, generateToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Por favor proporciona correo y contraseña." },
        { status: 400 }
      );
    }

    // 2. Lookup user in database
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas. Correo o contraseña incorrectos." },
        { status: 401 }
      );
    }

    // 3. Verify password hash
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas. Correo o contraseña incorrectos." },
        { status: 401 }
      );
    }

    // 4. Generate JWT Token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // 5. Response with HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "Sesión iniciada exitosamente.",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Error al procesar el inicio de sesión." },
      { status: 500 }
    );
  }
}
