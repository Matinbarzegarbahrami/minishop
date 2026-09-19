import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import prisma from "@/src/lib/prisma";

// Session بدون NextAuth: توکن امضاشده (HMAC-SHA256) داخل HttpOnly Cookie
export const SESSION_COOKIE_NAME = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // یک هفته

type SessionPayload = {
  uid: string;
  iat: number;
  exp: number;
};

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set with at least 32 characters");
  }

  return secret;
}

export function createSessionToken(userId: string): string {
  const payload: SessionPayload = {
    uid: userId,
    iat: Date.now(),
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const signature = createHmac("sha256", getAuthSecret())
    .update(payloadBase64)
    .digest("base64url");

  return `${payloadBase64}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const parts = token.split(".");
  const payloadBase64 = parts[0];
  const signature = parts[1];

  if (!payloadBase64 || !signature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", getAuthSecret())
    .update(payloadBase64)
    .digest("base64url");

  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf8")
    ) as Partial<SessionPayload>;

    if (
      typeof payload.uid !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now()
    ) {
      return null;
    }

    return {
      uid: payload.uid,
      iat: typeof payload.iat === "number" ? payload.iat : 0,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export type PublicUser = {
  id: string;
  phone: string;
};

export type SessionCookie = {
  name: string;
  value: string;
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
};

// ساخت تنظیمات HttpOnly Cookie برای قرار دادن session روی response
export function buildSessionCookie(token: string): SessionCookie {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

// خواندن کاربر لاگین‌شده از داخل Cookie در سمت سرور
export async function getCurrentUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    select: { id: true, phone: true },
  });

  return user;
}