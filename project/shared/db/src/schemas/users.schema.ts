import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./common.js";

export const usersTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  ...timestamps,
});
