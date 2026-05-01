import dayjs from 'dayjs'
import { Button } from 'flowbite-react'
import PromoCounter from './PromoCounter'

export default function PromoCard() {
  return (
    <section className="relative w-full overflow-hidden py-20">
      <div className="absolute inset-0 top-0 right-0 bottom-0 left-0">
        <img
          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2Vhc29uJTIwc3BlY2lhbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
          alt="Seasonal Specials"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="absolute inset-0 top-0 right-0 bottom-0 left-0 bg-[rgba(0,0,0,0.8)]" />

      <div className="format relative z-10 mx-auto flex w-full flex-col items-center justify-center">
        <p className="tracking-widest text-white uppercase">seasonal specials</p>
        <h2 className="text-white uppercase">flash sale</h2>

        <PromoCounter endTime={dayjs().add(10, 'hours').toDate()} />

        <Button type="button" size="xl" className="mt-10">
          Shop Now
        </Button>
      </div>
    </section>
  )
}
