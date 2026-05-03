export type OrderMessage = Record<string, unknown>

export async function processOrder(_order: OrderMessage): Promise<void> {
  console.log(_order)
  // Order processing logic will be added here.
}
