import z from 'zod/v4'

export const cartItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
})

export type CartItem = z.infer<typeof cartItemSchema>

export const cartSchema = cartItemSchema.array()
