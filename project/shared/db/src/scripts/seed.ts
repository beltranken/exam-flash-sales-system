import 'dotenv/config'

import { faker } from '@faker-js/faker'
import {
  Db,
  PromoStatus,
  StockTransactionType,
  Warehouse,
  createDbClient,
  ordersTable,
  paymentsTable,
  productStocksTable,
  productsTable,
  promoItemsTable,
  promosTable,
  stockEntriesTable,
  stockTransactionsTable,
} from '../index.js'

const description1 = `
Built for everyday movement, the AeroStride Runner pairs a lightweight knit upper with a cushioned sole that keeps each step comfortable from morning errands to evening walks. Its clean profile makes it easy to style with activewear, denim, or casual weekend outfits.

The breathable construction helps keep your feet cool, while the flexible outsole gives steady traction on city streets, gym floors, and light outdoor paths. Designed for comfort without looking overly sporty, it is a reliable go-to shoe for busy days.
`
const description2 = faker.lorem.paragraphs(2)
const description3 = faker.lorem.paragraphs(3)

const productNames = [
  'Urban Drift',
  'Cloudstride',
  'Northline',
  'Everyday Edge',
  'Solace Knit',
  'Terrain Flow',
  'Streetform',
  'Luna Walk',
  'Core Motion',
  'Harbor Fit',
]

function getArgNumber(i: number) {
  const rawData = process.argv[i]
  const data = Number(rawData)

  if (Number.isFinite(data)) {
    return data
  }

  return 0
}

async function resetSeedData(db: Db) {
  await db.transaction(async (tx) => {
    await tx.delete(stockEntriesTable)
    await tx.delete(stockTransactionsTable)
    await tx.delete(paymentsTable)
    await tx.delete(ordersTable)
    await tx.delete(promosTable)
    await tx.delete(productStocksTable)
    await tx.delete(productsTable)
  })
}

async function insertSeedData(db: Db, promoId: number) {
  await db.transaction(async (tx) => {
    const quantity = faker.number.int({ min: 10, max: 3000 })
    const priceInCents = faker.number.int({ min: 1000, max: 30000 })
    const description = faker.helpers.arrayElement([description1, description2, description3])

    const [product] = await tx
      .insert(productsTable)
      .values({
        name: faker.helpers.arrayElement(productNames),
        description,
        priceInCents,
      })
      .returning({
        id: productsTable.id,
        name: productsTable.name,
      })

    if (!product) {
      throw new Error('Failed to insert product seed data')
    }

    const shouldHavePromo = faker.datatype.boolean(0.75)

    if (shouldHavePromo) {
      await tx.insert(promoItemsTable).values({
        promoId,
        productId: product.id,
      })
    }

    await tx.insert(productStocksTable).values({
      productId: product.id,
      warehouse: Warehouse.MAIN,
      availableQuantity: quantity,
      reservedQuantity: 0,
      soldQuantity: 0,
    })

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
}

async function seed() {
  const { db, pool } = createDbClient()

  try {
    await resetSeedData(db)

    const [promo] = await db
      .insert(promosTable)
      .values({
        code: 'SUMMER20',
        name: 'Summer Sale 20% Off',
        description: 'Get 20% off your order with code SUMMER20',
        discountPercentage: 20,
        status: PromoStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // valid for 30 days
        limitPerUser: 1,
      })
      .returning({
        id: promosTable.id,
      })

    if (!promo) {
      throw new Error('Failed to insert promo seed data')
    }

    const productCount = getArgNumber(2) || 100

    const promises = []
    for (let i = 0; i < productCount; i++) {
      console.log(`Seeding product ${i + 1} of ${productCount}...`)
      promises.push(insertSeedData(db, promo.id))
    }

    await Promise.all(promises)
  } finally {
    await pool.end()
  }
}

void seed().catch((error) => {
  console.error('Seeding failed:', error)
  process.exitCode = 1
})
