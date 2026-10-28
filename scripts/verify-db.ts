import { createPrismaClient } from "../src/lib/prisma-client";

async function main() {
  const prisma = createPrismaClient();
  const count = await prisma.game.count();
  console.log("Prisma OK — games in database:", count);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Prisma verify failed:", err);
  process.exit(1);
});
