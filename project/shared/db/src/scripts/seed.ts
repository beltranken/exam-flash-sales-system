import 'dotenv/config'

import {
  StockTransactionType,
  Warehouse,
  createDbClient,
  ordersTable,
  paymentsTable,
  productStocksTable,
  productsTable,
  promosTable,
  stockEntriesTable,
  stockTransactionsTable,
} from '../index.js'

const description = `
Built for everyday movement, the AeroStride Runner pairs a lightweight knit upper with a cushioned sole that keeps each step comfortable from morning errands to evening walks. Its clean profile makes it easy to style with activewear, denim, or casual weekend outfits.

The breathable construction helps keep your feet cool, while the flexible outsole gives steady traction on city streets, gym floors, and light outdoor paths. Designed for comfort without looking overly sporty, it is a reliable go-to shoe for busy days.
`

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
      await tx.delete(productStocksTable)
      await tx.delete(productsTable)

      const [product] = await tx
        .insert(productsTable)
        .values({
          name: 'AeroStride Runner',
          description,
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
