import { userSchema } from "@shared/db";
import { z } from "zod/v4";

export const emailLoginRequestSchema = userSchema.pick({ email: true });
export type EmailLoginRequest = z.infer<typeof emailLoginRequestSchema>;

export const emailLoginResponseSchema = z.object({ token: z.string() });
export type EmailLoginResponse = z.infer<typeof emailLoginResponseSchema>;
