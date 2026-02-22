/**
 * Independent email/password authentication system.
 * Replaces Manus OAuth entirely. Uses bcrypt for password hashing and JWT for sessions.
 */
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import * as db from "../db";
import type { User } from "../../drizzle/schema";
import { ForbiddenError } from "@shared/_core/errors";

const SALT_ROUNDS = 12;

function getSessionSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "fallback-dev-secret-change-in-prod";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: string, name: string): Promise<string> {
  const secretKey = getSessionSecret();
  return new SignJWT({ openId: userId, name, appId: "servicesourceconnect" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
    .sign(secretKey);
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<{ openId: string; name: string } | null> {
  if (!token) return null;
  try {
    const secretKey = getSessionSecret();
    const { payload } = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
    const { openId, name } = payload as Record<string, unknown>;
    if (typeof openId !== "string" || !openId) return null;
    return { openId, name: typeof name === "string" ? name : "" };
  } catch {
    return null;
  }
}

export async function authenticateRequest(req: Request): Promise<User> {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const sessionCookie = cookies[COOKIE_NAME];
  const session = await verifySessionToken(sessionCookie);
  if (!session) throw ForbiddenError("Invalid session");

  const user = await db.getUserByOpenId(session.openId);
  if (!user) throw ForbiddenError("User not found");

  return user;
}
