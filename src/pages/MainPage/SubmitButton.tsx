import { Button } from '@nextui-org/react';

interface SubmitButtonProps {
  submit: () => void,
  status: number,
  isSubmitDisabled: boolean,
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return 'Sign Transaction';
    case 1:
      return 'Signing Transaction';
    case 2:
      return 'Encrypting Transaction';
    case 3:
      return 'Submitting Transaction';
    default:
      return 'New Transaction';
  }
}

export const SubmitButton = ({ submit, status, isSubmitDisabled }: SubmitButtonProps) => {
  return (
    <Button isLoading={status !== 0 && status !== 4} onClick={submit} color="primary" className="w-full mt-4 focus:outline-none" isDisabled={isSubmitDisabled}>
      {getStatusText(status)}
    </Button>
  )
}
