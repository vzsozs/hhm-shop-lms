import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema/auth";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=InvalidToken", request.url));
    }

    // Keressük meg a tokent
    const [existingToken] = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, token));

    if (!existingToken) {
      return NextResponse.redirect(new URL("/login?error=TokenNotFound", request.url));
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      // Töröljük a lejárt tokent
      await db.delete(verificationTokens).where(eq(verificationTokens.identifier, existingToken.identifier));
      return NextResponse.redirect(new URL("/login?error=TokenExpired", request.url));
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, existingToken.identifier));

    if (!existingUser) {
      return NextResponse.redirect(new URL("/login?error=EmailNotFound", request.url));
    }

    // Fiók megerősítése
    await db.update(users)
      .set({
        emailVerified: new Date(),
        // email: existingToken.identifier, // Opcionális: Ha az email változtatásra is ezt a tokent használjuk
      })
      .where(eq(users.id, existingUser.id));

    // Token törlése
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, existingToken.identifier));

    return NextResponse.redirect(new URL("/login?verified=true", request.url));
  } catch (error) {
    console.error("Váratlan hiba az e-mail megerősítés során:", error);
    return NextResponse.redirect(new URL("/login?error=Default", request.url));
  }
}
