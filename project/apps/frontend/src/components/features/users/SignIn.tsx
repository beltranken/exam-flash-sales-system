import type { SignInConfirmResponse } from '@/api/types.gen'
import { useAuth } from '@/libs/auth'
import { useState } from 'react'
import VerifyEmail from './VerifyEmail'
import VerifyOtp from './VerifyOtp'

export default function SignIn() {
  const { email, setAuthenticated } = useAuth()

  const [challengeId, setChallengeId] = useState<string>()

  const handleOtpVerified = (data: SignInConfirmResponse) => {
    setAuthenticated(data)
    setChallengeId(undefined)
  }

  return (
    <>
      {challengeId ? (
        <VerifyOtp challengeId={challengeId} onVerified={handleOtpVerified} />
      ) : (
        <VerifyEmail email={email} onVerified={setChallengeId} />
      )}
    </>
  )
}
