import { Button } from '@nextui-org/react';
import { Tooltip } from "@nextui-org/tooltip";

interface SubmitButtonProps {
  submit: () => void,
  status: number,
  transactionCount: number,
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
};

export const SubmitButton = ({ submit, status, transactionCount, isSubmitDisabled }: SubmitButtonProps) => {
  return (
    <div>
      {status === 0 || status === 1 ?
        <Tooltip content="Use this custom nonce when signing your transaction" color='warning'>
          <div className='text-sm'>Required nonce:
            <p className='inline-flex ml-2 text-[#f37e4b]'>
              {transactionCount + 1}
            </p>
          </div>
        </Tooltip>
        : ""}
      <Button isLoading={status !== 0 && status !== 4} onClick={submit} color="primary" className="w-full mt-4 focus:outline-none" isDisabled={isSubmitDisabled}>
        {getStatusText(status)}
      </Button>
    </div>
  );
};
