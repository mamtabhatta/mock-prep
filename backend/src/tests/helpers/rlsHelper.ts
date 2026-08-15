import { PrismaClient } from "@prisma/client";
import { prisma } from "../../config/db";

export async function runAsUser<T>(
  userId: string,
  role: string,
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    // Drop superuser authorization for this transaction block
    await tx.$executeRawUnsafe(`SET LOCAL SESSION AUTHORIZATION authenticated;`);
    await tx.$executeRawUnsafe(`SET LOCAL app.current_user_id = '${userId}';`);
    await tx.$executeRawUnsafe(`SET LOCAL app.current_user_role = '${role}';`);

    return await callback(tx as unknown as PrismaClient);
  });
}