import { getPromos } from '@/api/sdk.gen'
import { useQuery } from '@tanstack/react-query'
import { Button, Spinner } from 'flowbite-react'
import PromoCounter from './PromoCounter'

export default function PromoCard() {
  const { data: promos, isLoading } = useQuery({
    queryKey: ['promos'],
    queryFn: async () => {
      const response = await getPromos()

      if (response.error || !response.data) {
        throw new Error(response.error.message)
      }

      return response.data
    },
  })

  // For simplicity, we only show the first promo
  const promo = promos?.at(0)

  let promoComp
  if (isLoading) {
    promoComp = (
      <div className="z-100 flex flex-col items-center justify-center gap-2 py-20">
        <Spinner />
      </div>
    )
  } else if (promo) {
    let endTime
    let labelComp

    if (promo.temporalStatus === 'upcoming') {
      endTime = promo.startDate
      labelComp = <p className="font-semibold text-white uppercase">starts</p>
    } else if (promo.temporalStatus === 'active') {
      endTime = promo.endDate
      labelComp = <p className="font-semibold text-white uppercase">ends</p>
    } else {
      labelComp = (
        <div>
          <p className="font-semibold text-white uppercase">Promo already ended</p>

          <img src="/images/sad-face.png" alt="Sad face" className="mx-auto mt-4 h-16 w-16" />
        </div>
      )
    } // sad-face.png

    promoComp = (
      <div className="format relative z-10 mx-auto flex w-full flex-col items-center justify-center">
        <p className="tracking-widest text-white uppercase">{promo.name}</p>
        <h2 className="text-white uppercase">flash sale</h2>

        {labelComp}

        {endTime && <PromoCounter endTime={new Date(endTime)} />}

        <Button type="button" size="xl" className="mt-10">
          Shop Now
        </Button>
      </div>
    )
  }

  return (
    <section className="relative w-full overflow-hidden py-20">
      {promo && (
        <div className="absolute inset-0 top-0 right-0 bottom-0 left-0">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2Vhc29uJTIwc3BlY2lhbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
            alt="Seasonal Specials"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="absolute inset-0 top-0 right-0 bottom-0 left-0 bg-[rgba(0,0,0,0.8)]" />

      {promoComp}
    </section>
  )
}
