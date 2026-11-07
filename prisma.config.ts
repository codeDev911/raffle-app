import "dotenv/config"
import { defineConfig } from "@prisma/config";

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl && process.env.NODE_ENV === "production") {
  throw new Error("DATABASE_URL must be configured in production")
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl || "postgresql://postgres:postgres@localhost:5432/pakraffle",
  },
})