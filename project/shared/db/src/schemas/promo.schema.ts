import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./common.js";
import { productsTable } from "./products.schema.js";

export const promosTable = pgTable("promos", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 255 }),
  discountPercentage: integer("discount_percentage").notNull(),
  ...timestamps,
});

export const promoProductsTable = pgTable("promo_products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  promoId: integer("promo_id")
    .notNull()
    .references(() => promosTable.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
});
