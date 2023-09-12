import { prismaClient } from "../database/prismaClient";

async function demoUser() {
  const demo = [
    {
      "name": "Alice Johnson",
      "email": "alice.johnson@example.com",
      "password": "P@ssw0rd123"
    },
    {
      "name": "David Wilson",
      "email": "david.wilson@example.com",
      "password": "Secur3P@ssw0rd"
    },
    {
      "name": "Eva Davis",
      "email": "eva.davis@example.com",
      "password": "Str0ngP@ss99"
    },
    {
      "name": "Grace Brown",
      "email": "grace.brown@example.com",
      "password": "MyS3cur3Pwd123"
    },
    {
      "name": "Frank Miller",
      "email": "frank.miller@example.com",
      "password": "L0ngerP@ss1234"
    },
    {
      "name": "Sophia Garcia",
      "email": "sophia.garcia@example.com",
      "password": "S@feP@ssw0rd56"
    },
    {
      "name": "Oliver Martinez",
      "email": "oliver.martinez@example.com",
      "password": "M@rt1n3zP@ssw0rd"
    },
    {
      "name": "Emma Harris",
      "email": "emma.harris@example.com",
      "password": "3mmaP@ssw0rd7"
    },
    {
      "name": "Liam Lee",
      "email": "liam.lee@example.com",
      "password": "L33S3cur3P@ss"
    },
    {
      "name": "Mia Turner",
      "email": "mia.turner@example.com",
      "password": "T3stP@ssw0rd88"
    }
  ]
  
  

  const createDemo = await prismaClient.user.createMany({
    data: demo,
  });
  console.log("Criado!");
}

demoUser()
  .catch((error) => {
    console.error("Erro ao adicionar usuários:", error);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
