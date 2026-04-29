import { defineRelations } from 'drizzle-orm'
import { orderItemsTable, ordersTable } from './schemas/orders.schema.js'
import { productsTable, productStocksTable } from './schemas/products.schema.js'
import { promosTable } from './schemas/promo.schema.js'
import { stockEntriesTable, stockTransactionsTable } from './schemas/stock.schema.js'
import { usersTable } from './schemas/users.schema.js'

const relationSchema = {
  stockTransactionsTable,
  stockEntriesTable,
  productsTable,
  productStocksTable,
  promosTable,
  usersTable,
  ordersTable,
  orderItemsTable,
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
    promos: r.many.promosTable({
      from: r.productsTable.id,
      to: r.promosTable.productId,
    }),
  },
  productStocksTable: {
    product: r.one.productsTable({
      from: r.productStocksTable.productId,
      to: r.productsTable.id,
    }),
  },
  promosTable: {
    promoProduct: r.one.productsTable({
      from: r.promosTable.productId,
      to: r.productsTable.id,
    }),
  },
  usersTable: {},
  ordersTable: {
    orderItems: r.many.orderItemsTable({
      from: r.ordersTable.id,
      to: r.orderItemsTable.orderId,
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
}))
