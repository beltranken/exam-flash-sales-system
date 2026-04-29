import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { OrderStatus } from "../types/enums.js";
import { timestamps } from "./common.js";
import { orderStatusEnum } from "./enums.js";
import { productsTable } from "./products.schema.js";
import { promosTable } from "./promo.schema.js";
import { usersTable } from "./users.schema.js";

export const ordersTable = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "restrict" }),
  status: orderStatusEnum("status").notNull().default(OrderStatus.PENDING),
  note: text("note"),
  ...timestamps,
});

export const orderItemsTable = pgTable("order_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  discountPercentage: integer("discount_percentage").notNull().default(0),
  appliedPromoId: integer("applied_promo_id").references(() => promosTable.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});
