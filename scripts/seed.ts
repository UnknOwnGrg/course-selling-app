import "dotenv/config";
import prisma from "@/lib/db";

async function main() {
  try {
    await prisma.category.createMany({
      data: [
        { name: "Computer Science" },
        { name: "Music" },
        { name: "Engineering" },
        { name: "Photography" },
        { name: "Fitness" },
      ],
    });
    console.log("Success");
  } catch (error) {
    console.log("Error seedint the database categories", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
