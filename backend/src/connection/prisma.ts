import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: "31.220.99.154",
  database: "stock_prime_homologa",
  user: "root",
  password: "M3a6n987.",
});

export const prisma = new PrismaClient({ adapter });
