import { Button, HR } from 'flowbite-react'

interface OrderSummaryProps {
  cartItems: { productId: number }[]
}

export default function OrderSummary({ cartItems }: Readonly<OrderSummaryProps>) {
  return (
    <section className="border-border w-full border bg-white p-8 shadow">
      <h2 className="text-sm font-medium tracking-wider uppercase">Order Summary</h2>

      <div className="flex flex-col gap-4">
        <HR />

        <div className="flex flex-col gap-6">
          {cartItems.map((item) => (
            <div>{item.productId}</div>
          ))}
        </div>

        <HR />

        <div className="mb-4 flex flex-col gap-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span>$123.45</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Shipping</span>
            <span>FREE</span>
          </div>

          <div className="border-border flex justify-between border-t pt-4">
            <span className="text-lg font-medium">Total</span>
            <span className="font-medium">$123.45</span>
          </div>
        </div>

        <Button className="tracking-widest uppercase">continue to payment</Button>
      </div>
    </section>
  )
}
