import { productSchema, promoSchema } from '@shared/db'
import z from 'zod/v4'

export enum LineIssues {
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PROMO_NOT_FOUND = 'PROMO_NOT_FOUND',
  PROMO_NOT_APPLICABLE = 'PROMO_NOT_APPLICABLE',
  PROMO_CHANGE = 'PROMO_CHANGE',
  PROMO_REMOVED = 'PROMO_REMOVED',
  PROMO_USAGE_LIMIT_EXCEEDED = 'PROMO_USAGE_LIMIT_EXCEEDED',
  PRODUCT_USAGE_LIMIT_EXCEEDED = 'PRODUCT_USAGE_LIMIT_EXCEEDED',
}

export const cartItemSchema = z.object({
  product: productSchema,
  appliedPromo: promoSchema.optional().nullable(), // promo applied to this specific item, if any
  quantity: z.number().int().positive(),
  subtotalInCents: z.number().nonnegative(),
  discountInCents: z.number().nonnegative(),
  totalInCents: z.number().nonnegative(),
  issues: z.array(z.enum(LineIssues)).optional(),
})
export type CartItem = z.infer<typeof cartItemSchema>

export const cartSchema = z.object({
  appliedPromo: promoSchema.optional(), // only one promo can be applied to the cart
  items: cartItemSchema.array(),
  subtotalInCents: z.number().nonnegative(),
  totalDiscountInCents: z.number().nonnegative(),
  totalInCents: z.number().nonnegative(),
  issues: z.array(z.enum(LineIssues)).optional(),
})

export type Cart = z.infer<typeof cartSchema>

export const cartItemRequest = z.object({
  productId: z.number().int(),
  quantity: z.number().int().positive(),
  appliedPromoId: z.number().int().optional(),
})
export type CartItemRequest = z.infer<typeof cartItemRequest>

export const cartRequestSchema = z.object({
  appliedPromoId: z.number().int().optional(),
  items: cartItemRequest.array(),
  message: z.string().optional(),
})
export type CartRequest = z.infer<typeof cartRequestSchema>
