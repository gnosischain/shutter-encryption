import { Textarea } from '@nextui-org/input';

import { SubmitButton } from './SubmitButton';

interface AdvancedFormProps {
  submit: () => void,
  status: number,
  isSubmitDisabled: boolean,
}

export const AdvancedForm = ({ submit, status, isSubmitDisabled }: AdvancedFormProps) => {
  return (
    <div>
      <div className="flex flex-col items-center mt-4 text-nowrap">
        <p className="mr-2">Paste your transaction in here:</p>
        <Textarea className="w-full h-48 p-2" placeholder="0x..." />
      </div>

      <SubmitButton
        submit={submit}
        status={status}
        isSubmitDisabled={isSubmitDisabled}
      />
    </div>
  )
};