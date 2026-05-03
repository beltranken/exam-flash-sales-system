import { Button, CloseIcon, Modal, ModalBody } from 'flowbite-react'
import { useState } from 'react'
import PaymentSkip from './PaymentSkip'
import PaymentStripe from './PaymentSripe'

interface PaymentProps {
  orderId: string
  paymentMethod: string
  onClose: () => void
  onSuccess: () => void
}

export default function Payment({ orderId, paymentMethod, onClose, onSuccess }: Readonly<PaymentProps>) {
  const [isConfirming, setIsConfirming] = useState(false)

  const handleOnClose = () => {
    if (isConfirming) {
      onClose()
    } else {
      setIsConfirming(true)
    }
  }

  return (
    <Modal size="5xl" popup show={true}>
      <ModalBody>
        <div className="absolute top-6 right-6">
          <button
            type="button"
            className="text-body hover:bg-neutral-tertiary hover:text-heading ms-auto inline-flex h-9 w-9 items-center justify-center bg-transparent text-sm"
            data-modal-hide="default-modal"
            onClick={handleOnClose}
          >
            <CloseIcon className="h-4 w-4" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        {isConfirming && (
          <div className="absolute top-0 right-0 bottom-0 left-0 z-100 flex flex-col items-center justify-center gap-4 bg-white p-20">
            <span className="text-xl">You're about to skip the payment. Are you sure?</span>

            <div className="flex w-100 gap-5">
              <Button outline fullSized>
                Yes
              </Button>
              <Button onClick={() => setIsConfirming(false)} fullSized>
                Continue with Payment
              </Button>
            </div>
          </div>
        )}

        {paymentMethod === 'Stripe' ? (
          <PaymentStripe onSuccess={onSuccess} orderId={orderId} />
        ) : (
          <PaymentSkip onSuccess={onSuccess} orderId={orderId} />
        )}
      </ModalBody>
    </Modal>
  )
}
