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
  throw new Error("DATABASE_URL is not defined");
}

const queryClient = postgres(dbUrl);
export const db = drizzle(queryClient, { schema: { user, companies } });
