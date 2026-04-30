import { useEffect, useState } from 'react'

interface PromoCounterProps {
  endTime: Date
}

function getTimeLeft(endTime: Date) {
  const totalSeconds = Math.max(0, Math.floor((endTime.getTime() - Date.now()) / 1000))

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

export default function PromoCounter({ endTime }: Readonly<PromoCounterProps>) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endTime))

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft(getTimeLeft(endTime))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [endTime])

  return (
    <div className="flex justify-center gap-8">
      {[
        ['hours', timeLeft.hours],
        ['minutes', timeLeft.minutes],
        ['seconds', timeLeft.seconds],
      ].map(([label, value]) => (
        <div key={label} className="flex flex-col items-center justify-center gap-1">
          <span className="text-3xl font-medium text-white">{String(value).padStart(2, '0')}</span>
          <span className="text-white uppercase">{label}</span>
        </div>
      ))}
    </div>
  )
}
