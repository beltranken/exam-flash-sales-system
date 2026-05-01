export enum Warehouse {
  SUPPLIER = 'supplier',
  MAIN = 'main',
  RESERVE = 'reserve',
  SALES = 'sales',

  /* // These types are not used for this example
  RETURN = "return",
  ADJUSTMENT = "adjustment",
  MOVING = "moving", */
}

export enum StockTransactionType {
  PURCHASE = 'purchase', // SUPPLIER -> MAIN
  RESERVE = 'reserve', // MAIN -> RESERVE (order is placed but not yet paid)
  SALE = 'sale', // RESERVE -> SALES (order is paid)
  RESERVE_CANCEL = 'reserve_cancel', // RESERVE -> MAIN (payment failed or order cancelled)

  /* // These types are not used for this example
  RETURN_IN = "return_in", // SALES -> MAIN
  RETURN_OUT = "return_out", // MAIN -> SUPPLIER
  ADJUSTMENT = "adjustment", // Manual
  TRANSFER_IN = "TRANSFER_IN", // From MOVING to MAIN
  TRANSFER_OUT = "TRANSFER_OUT", // To MAIN from MOVING */
}

export enum TemporalStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  EXPIRED = 'expired',
}

export enum OrderStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  MOCK = 'mock',
}

export enum PromoStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}
