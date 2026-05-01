import { signInConfirm, type SignInConfirmResponse } from '@/api'
import { useAuth } from '@/libs/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Button, HelperText, TextInput } from 'flowbite-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod/v4'

const verifyOtpSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required.'),
  otp: z.string().min(6).max(6, 'OTP must be 6 characters long.'),
})

type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>

interface VerifyOtpProps {
  challengeId: string
  onVerified: (data: SignInConfirmResponse) => void
}

export default function VerifyOtp({ challengeId, onVerified }: Readonly<VerifyOtpProps>) {
  const { setAuthenticated } = useAuth()

  const verifyTokenMutation = useMutation({
    mutationFn: async ({ challengeId, otp }: { challengeId: string; otp: string }) => {
      const response = await signInConfirm({
        body: { challengeId, otp },
      })

      if (response.error || !response.data) {
        throw new Error(response.error?.message || 'An error occurred while verifying your email. Please try again.')
      }

      return response.data
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitted },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { challengeId: '', otp: '' },
  })

  useEffect(() => {
    if (challengeId) {
      setValue('challengeId', challengeId)
    }
  }, [challengeId, setValue])

  const errorMessage = isSubmitted && errors.otp ? errors.otp.message : null

  const isVerifying = verifyTokenMutation.isPending

  const disabled = isVerifying
  const btnText = isVerifying ? 'Verifying...' : 'Verify'

  const onSubmit = handleSubmit((data) => {
    verifyTokenMutation.mutate(
      { challengeId: data.challengeId, otp: data.otp },
      {
        onSuccess: (data) => {
          setAuthenticated(data)
          onVerified(data)
        },
      },
    )
  })

  return (
    <form onSubmit={onSubmit}>
      <div className="flex items-center gap-4">
        <TextInput
          id="otp"
          type="text"
          sizing="lg"
          placeholder="Enter OTP"
          color={errorMessage ? 'failure' : undefined}
          disabled={disabled}
          className="w-full flex-1"
          {...register('otp')}
        />

        <Button size="lg" outline className="uppercase" type="submit" disabled={disabled}>
          {btnText}
        </Button>
      </div>

      {errorMessage && <HelperText className="text-red-500">{errorMessage}</HelperText>}
    </form>
  )
}
