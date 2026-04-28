import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { PaymentStatus } from "../types/enums.js";
import { timestamps } from "./common.js";
import { paymentProviderEnum, paymentStatusEnum } from "./enums.js";
import { ordersTable } from "./order.schema.js";

export const paymentsTable = pgTable("payments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  provider: paymentProviderEnum("provider").notNull(),
  externalRefId: varchar("external_ref_id", { length: 255 }),
  status: paymentStatusEnum("status").notNull().default(PaymentStatus.PENDING),
  amountInCents: integer("amount_in_cents").notNull(),
  ...timestamps,
});
