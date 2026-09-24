import { NextRequest, NextResponse } from "next/server";
import { getSession, verifyPassword, hashPassword, generateToken, COOKIE_NAME } from "@/lib/auth";
import { findUserById, findUserByEmail, updateUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión para realizar cambios." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currentPassword, email, username, newPassword } = body;

    // 1. Current password is required to perform any account changes
    if (!currentPassword || typeof currentPassword !== "string") {
      return NextResponse.json(
        { error: "Debes ingresar tu contraseña actual para confirmar los cambios." },
        { status: 400 }
      );
    }

    // 2. Fetch current user data from database
    const currentUser = await findUserById(session.userId);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado en la base de datos." },
        { status: 404 }
      );
    }

    // 3. Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, currentUser.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta. No se realizaron cambios." },
        { status: 403 }
      );
    }

    const updates: { email?: string; username?: string; passwordHash?: string } = {};

    // 4. Validate email change
    if (email && email.trim() !== currentUser.email) {
      const cleanEmail = email.toLowerCase().trim();
      if (!cleanEmail.includes("@")) {
        return NextResponse.json(
          { error: "Por favor ingresa un correo electrónico válido." },
          { status: 400 }
        );
      }

      const existingByEmail = await findUserByEmail(cleanEmail);
      if (existingByEmail && existingByEmail.id !== currentUser.id) {
        return NextResponse.json(
          { error: "El correo electrónico ya está en uso por otra cuenta." },
          { status: 409 }
        );
      }
      updates.email = cleanEmail;
    }

    // 5. Validate username change
    if (username && username.trim() !== currentUser.username) {
      const cleanUsername = username.trim();
      if (cleanUsername.length < 3) {
        return NextResponse.json(
          { error: "El nombre de usuario debe tener al menos 3 caracteres." },
          { status: 400 }
        );
      }
      updates.username = cleanUsername;
    }

    // 6. Validate new password if provided
    if (newPassword && typeof newPassword === "string" && newPassword.length > 0) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "La nueva contraseña debe tener al menos 6 caracteres." },
          { status: 400 }
        );
      }
      updates.passwordHash = await hashPassword(newPassword);
    }

    // If nothing changed, return current info
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: true,
        message: "No se detectaron cambios para guardar.",
        user: {
          id: currentUser.id,
          email: currentUser.email,
          username: currentUser.username,
          created_at: currentUser.created_at,
          updated_at: currentUser.updated_at,
        },
      });
    }

    // 7. Update user in database
    const updatedUser = await updateUser(session.userId, updates);

    // 8. Generate updated JWT session token
    const token = await generateToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
    });

    const response = NextResponse.json({
      success: true,
      message: "Tu cuenta ha sido actualizada exitosamente.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en update-account:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Error al actualizar la cuenta." },
      { status: 500 }
    );
  }
}
