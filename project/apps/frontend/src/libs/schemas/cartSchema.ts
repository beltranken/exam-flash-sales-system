import z from 'zod/v4'

export const cartItemRequest = z.object({
  productId: z.number().int(),
  quantity: z.number().int().positive(),
})
export type CartItemRequest = z.infer<typeof cartItemRequest>

export const cartRequest = z.object({
  appliedPromoId: z.number().int().optional(),
  items: cartItemRequest.array(),
})
export type CartRequest = z.infer<typeof cartRequest>
