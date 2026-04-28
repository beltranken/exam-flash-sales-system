import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod/v4";
import { usersTable } from "../schemas/users.schema.js";

export const userSchema = createSelectSchema(usersTable);
export type User = z.infer<typeof userSchema>;
