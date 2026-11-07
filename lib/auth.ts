import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";

const scrypt = promisify(scryptCallback);
const PASSWORD_KEY_LENGTH = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;

  const expected = Buffer.from(key, "hex");
  if (expected.length !== PASSWORD_KEY_LENGTH) return false;
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return timingSafeEqual(expected, actual);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Kata sandi", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials.email ?? "").trim().toLowerCase();
        const password = String(credentials.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await verifyPassword(password, user.passwordHash))) return null;

        return { id: user.id, name: user.nama, email: user.email, image: user.foto, role: user.role };
      },
    }),
  ],
});
