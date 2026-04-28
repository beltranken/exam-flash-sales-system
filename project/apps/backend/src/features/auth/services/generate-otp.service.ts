import { generateOTP, hashOtp } from "@utils";
import { FastifyInstance } from "fastify";

export async function generateAndSaveOTPService(
  fastify: FastifyInstance,
  userId: number,
) {
  const otp = generateOTP();
  const hashedInput = hashOtp(otp);
  await fastify.redis.set(`otp:${userId}`, hashedInput, "EX", 5 * 60);
}
