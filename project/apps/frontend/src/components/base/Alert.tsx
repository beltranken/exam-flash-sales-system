import { Button, Modal, ModalBody } from 'flowbite-react'

interface AlertProps {
  message: string
  onClose: () => void
}

export default function Alert({ message, onClose }: Readonly<AlertProps>) {
  return (
    <Modal show onClose={onClose} size="md" popup>
      <ModalBody className="p-6">
        <div className="flex flex-col gap-6 text-center">
          <p className="text-base text-gray-700">{message}</p>
          <Button type="button" onClick={onClose} className="w-full">
            OK
          </Button>
        </div>
      </ModalBody>
    </Modal>
  )
}
