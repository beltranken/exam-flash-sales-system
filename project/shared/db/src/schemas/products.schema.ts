import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./common.js";

export const productsTable = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  priceInCents: integer("price_in_cents").notNull(),
  ...timestamps,
});
