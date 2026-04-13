import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config(); // loads .env into process.env before defineConfig runs

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    path: "prisma/migrations",
  },
});
