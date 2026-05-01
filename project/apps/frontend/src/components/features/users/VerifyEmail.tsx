import { signIn } from '@/api'
import CheckIcon from '@/icons/CheckIcon'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Button, HelperText, TextInput } from 'flowbite-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod/v4'

const verifyEmailSchema = z.object({
  email: z.email('Please enter a valid email address.'),
})

type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>

interface VerifyEmailProps {
  email?: string | null
  onVerified: (challengeId: string) => void
}

export default function VerifyEmail({ email, onVerified }: Readonly<VerifyEmailProps>) {
  const verifyEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await signIn({
        body: { email },
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
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: '' },
  })

  useEffect(() => {
    if (email) {
      setValue('email', email)
    }
  }, [email, setValue])

  const errorMessage = isSubmitted && errors.email ? errors.email.message : null

  const isVerifying = verifyEmailMutation.isPending
  const isVerified = !!email

  const disabled = isVerifying || isVerified
  const btnText = isVerifying ? 'Verifying...' : isVerified ? 'Verified' : 'Verify'

  const color = errorMessage ? 'failure' : isVerified ? 'success' : undefined

  const onSubmit = handleSubmit((data) => {
    verifyEmailMutation.mutate(data.email, {
      onSuccess: ({ challengeId }) => {
        onVerified(challengeId)
      },
    })
  })

  return (
    <form onSubmit={onSubmit}>
      <div className="flex items-center gap-4">
        <TextInput
          id="email"
          type="text"
          sizing="lg"
          placeholder="your.email@gmail.com"
          color={color}
          disabled={disabled}
          rightIcon={isVerified ? CheckIcon : undefined}
          className="w-full flex-1"
          {...register('email')}
        />

        {!isVerified && (
          <Button size="lg" outline className="uppercase" type="submit" disabled={disabled}>
            {btnText}
          </Button>
        )}
      </div>

      <HelperText className={errorMessage ? 'text-red-500' : ''}>
        {errorMessage ?? 'We will send you a confirmation email with the details of your order.'}
      </HelperText>
    </form>
  )
}
