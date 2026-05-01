import { defineRelations } from 'drizzle-orm'
import { orderItemsTable, ordersTable } from './schemas/orders.schema.js'
import { paymentsTable } from './schemas/payments.schema.js'
import { productsTable, productStocksTable } from './schemas/products.schema.js'
import { promoItemsTable, promosTable } from './schemas/promo.schema.js'
import { stockEntriesTable, stockTransactionsTable } from './schemas/stock.schema.js'
import { usersTable } from './schemas/users.schema.js'

const relationSchema = {
  stockTransactionsTable,
  stockEntriesTable,
  productsTable,
  productStocksTable,
  promoItemsTable,
  promosTable,
  usersTable,
  ordersTable,
  orderItemsTable,
  paymentsTable,
}

export const relations = defineRelations(relationSchema, (r) => ({
  stockTransactionsTable: {
    entries: r.many.stockEntriesTable({
      from: r.stockTransactionsTable.id,
      to: r.stockEntriesTable.transactionId,
    }),
  },
  stockEntriesTable: {
    transaction: r.one.stockTransactionsTable({
      from: r.stockEntriesTable.transactionId,
      to: r.stockTransactionsTable.id,
    }),
    product: r.one.productsTable({
      from: r.stockEntriesTable.productId,
      to: r.productsTable.id,
    }),
  },
  productsTable: {
    stockEntries: r.many.stockEntriesTable({
      from: r.productsTable.id,
      to: r.stockEntriesTable.productId,
    }),
    productStock: r.one.productStocksTable({
      from: r.productsTable.id,
      to: r.productStocksTable.productId,
    }),
    promoItems: r.many.promoItemsTable({
      from: r.productsTable.id,
      to: r.promoItemsTable.productId,
    }),
    activePromos: r.many.promosTable({
      from: r.productsTable.id.through(r.promoItemsTable.productId),
      to: r.promosTable.id.through(r.promoItemsTable.promoId),
    }),
  },
  productStocksTable: {
    product: r.one.productsTable({
      from: r.productStocksTable.productId,
      to: r.productsTable.id,
    }),
  },
  promosTable: {
    promoItems: r.many.promoItemsTable({
      from: r.promosTable.id,
      to: r.promoItemsTable.promoId,
    }),
  },
  promoItemsTable: {
    promo: r.one.promosTable({
      from: r.promoItemsTable.promoId,
      to: r.promosTable.id,
    }),
    product: r.one.productsTable({
      from: r.promoItemsTable.productId,
      to: r.productsTable.id,
    }),
  },
  usersTable: {
    orders: r.many.ordersTable({
      from: r.usersTable.id,
      to: r.ordersTable.userId,
    }),
  },
  ordersTable: {
    orderItems: r.many.orderItemsTable({
      from: r.ordersTable.id,
      to: r.orderItemsTable.orderId,
    }),
    user: r.one.usersTable({
      from: r.ordersTable.userId,
      to: r.usersTable.id,
    }),
    payment: r.one.paymentsTable({
      from: r.ordersTable.id,
      to: r.paymentsTable.orderId,
    }),
  },
  orderItemsTable: {
    order: r.one.ordersTable({
      from: r.orderItemsTable.orderId,
      to: r.ordersTable.id,
    }),
    product: r.one.productsTable({
      from: r.orderItemsTable.productId,
      to: r.productsTable.id,
    }),
    appliedPromo: r.one.promosTable({
      from: r.orderItemsTable.appliedPromoId,
      to: r.promosTable.id,
    }),
  },
  paymentsTable: {
    order: r.one.ordersTable({
      from: r.paymentsTable.orderId,
      to: r.ordersTable.id,
    }),
  },
}))
