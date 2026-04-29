import bcrypt from "bcryptjs";
import { prisma } from "../../infrastructure/database/prisma";

export async function registerDriver(email: string, password: string) {
  const existing = await prisma.driver.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);
  const driver = await prisma.driver.create({
    data: { email, passwordHash },
  });
  return { id: driver.id };
}

export async function loginDriver(email: string, password: string) {
  const driver = await prisma.driver.findUnique({ where: { email } });
  if (!driver) throw new Error("Invalid email or password");

  const valid = await bcrypt.compare(password, driver.passwordHash);
  if (!valid) throw new Error("Invalid email or password");

  return { id: driver.id };
}
