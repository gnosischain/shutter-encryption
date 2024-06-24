import { Button } from '@nextui-org/react';

interface SubmitButtonProps {
  submit: () => void,
  status: number,
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return 'Sign Transaction';
    case 1:
      return 'Encrypt Transaction';
    case 2:
      return 'Submit Transaction';
    default:
      return 'New Transaction';
  }
}

export const SubmitButton = ({ submit, status }: SubmitButtonProps) => {
  return (
    <Button onClick={submit} color="primary" className="w-full mt-4 focus:outline-none">
      {getStatusText(status)}
    </Button>
  )
}
