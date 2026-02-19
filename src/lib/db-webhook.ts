import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Define minimal schema for webhook usage
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  active: boolean("active").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const companies = pgTable("companies", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  active: boolean("active").default(true).notNull(),
  name: text("name"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.warn("Warning: DATABASE_URL is not defined. Database operations will fail.");
}

// Fallback para evitar erro no build se a variável não estiver definida
// O postgres.js conecta preguiçosamente, então isso não deve causar erro a menos que uma query seja executada
const connectionString = dbUrl || "postgres://postgres:postgres@localhost:5432/postgres";
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema: { user, companies } });
