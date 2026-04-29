import 'dotenv/config'

import {
  StockTransactionType,
  Warehouse,
  createDbClient,
  ordersTable,
  paymentsTable,
  productsTable,
  promosTable,
  stockEntriesTable,
  stockTransactionsTable,
} from '../index.js'

const DEFAULT_SEED_QUANTITY = 10000

function getSeedQuantity() {
  const rawQuantity = process.argv[2]
  const parsedQuantity = Number(rawQuantity)

  if (!rawQuantity || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
    return DEFAULT_SEED_QUANTITY
  }

  return parsedQuantity
}

async function seed() {
  const { db, pool } = createDbClient()
  const quantity = getSeedQuantity()

  try {
    await db.transaction(async (tx) => {
      await tx.delete(stockEntriesTable)
      await tx.delete(stockTransactionsTable)
      await tx.delete(paymentsTable)
      await tx.delete(ordersTable)
      await tx.delete(promosTable)
      await tx.delete(productsTable)

      const [product] = await tx
        .insert(productsTable)
        .values({
          name: 'Flash Sale Product',
          description: 'Sample seeded product for local development',
          priceInCents: 19900,
        })
        .returning({
          id: productsTable.id,
          name: productsTable.name,
        })

      if (!product) {
        throw new Error('Failed to insert product seed data')
      }

      const [transaction] = await tx
        .insert(stockTransactionsTable)
        .values({
          type: StockTransactionType.PURCHASE,
          note: 'Initial stock seed',
        })
        .returning({
          id: stockTransactionsTable.id,
        })

      if (!transaction) {
        throw new Error('Failed to insert stock transaction seed data')
      }

      await tx.insert(stockEntriesTable).values([
        {
          transactionId: transaction.id,
          productId: product.id,
          warehouse: Warehouse.SUPPLIER,
          quantity: -quantity,
        },
        {
          transactionId: transaction.id,
          productId: product.id,
          warehouse: Warehouse.MAIN,
          quantity,
        },
      ])

      console.log(`Seeded product ${product.name} (id: ${product.id}) with stock ${quantity} in ${Warehouse.MAIN}`)
    })
  } finally {
    await pool.end()
  }
}

void seed().catch((error) => {
  console.error('Seeding failed:', error)
  process.exitCode = 1
})
