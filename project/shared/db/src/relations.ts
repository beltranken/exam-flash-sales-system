import { defineRelations } from 'drizzle-orm'
import { productsTable } from './schemas/products.schema.js'
import { promoProductsTable, promosTable } from './schemas/promo.schema.js'
import { stockEntriesTable, stockTransactionsTable } from './schemas/stock.schema.js'
import { usersTable } from './schemas/users.schema.js'

const relationSchema = {
  stockTransactionsTable,
  stockEntriesTable,
  productsTable,
  promosTable,
  promoProductsTable,
  usersTable,
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
    promoProducts: r.many.promoProductsTable({
      from: r.productsTable.id,
      to: r.promoProductsTable.productId,
    }),
  },
  promosTable: {
    promoProducts: r.many.promoProductsTable({
      from: r.promosTable.id,
      to: r.promoProductsTable.promoId,
    }),
  },
  promoProductsTable: {
    promo: r.one.promosTable({
      from: r.promoProductsTable.promoId,
      to: r.promosTable.id,
    }),
    product: r.one.productsTable({
      from: r.promoProductsTable.productId,
      to: r.productsTable.id,
    }),
  },
  usersTable: {},
}))
