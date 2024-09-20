import { Button } from '@nextui-org/react';
import { Tooltip } from '@nextui-org/tooltip';

interface SubmitButtonProps {
  submit: () => void;
  status: number;
  transactionCount: number | undefined;
  isSubmitDisabled: boolean;
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return 'Sign Transaction';
    case 1:
      return 'Signing Transaction...';
    case 2:
      return 'Encrypt Transaction';
    case 3:
      return 'Encrypting Transaction...';
    case 4:
      return 'Submit Transaction';
    case 5:
      return 'Submitting Transaction...';
    default:
      return 'New Transaction';
  }
};

export const SubmitButton = ({
  submit,
  status,
  transactionCount,
  isSubmitDisabled,
}: SubmitButtonProps) => {
  return (
    <div>
      {(status === 0 || status === 1) && transactionCount !== undefined ? (
        <Tooltip content="Use this custom nonce when signing your transaction" color="danger">
          <div className="text-sm">
            Required nonce:
            <p className="inline-flex ml-2 text-warning">{transactionCount + 1}</p>
          </div>
        </Tooltip>
      ) : (
        ''
      )}
      <Button
        isLoading={status === 1 || status === 3 || status === 5}
        onClick={submit}
        color="primary"
        className="w-full mt-4 focus:outline-none"
        isDisabled={isSubmitDisabled}
      >
        {getStatusText(status)}
      </Button>
    </div>
  );
};
