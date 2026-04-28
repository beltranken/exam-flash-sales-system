import { pgEnum } from "drizzle-orm/pg-core";
import {
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  StockTransactionType,
  Warehouse,
} from "../types/index.js";

function enumToPgEnum<T extends Record<string, string>>(
  myEnum: T,
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(myEnum) as [T[keyof T], ...T[keyof T][]];
}

export const warehouseEnum = pgEnum("warehouse", enumToPgEnum(Warehouse));

export const stockTransactionTypeEnum = pgEnum(
  "stock_transaction_type",
  enumToPgEnum(StockTransactionType),
);

export const orderStatusEnum = pgEnum(
  "order_status",
  enumToPgEnum(OrderStatus),
);

export const paymentStatusEnum = pgEnum(
  "payment_status",
  enumToPgEnum(PaymentStatus),
);

export const paymentProviderEnum = pgEnum(
  "payment_provider",
  enumToPgEnum(PaymentProvider),
);
