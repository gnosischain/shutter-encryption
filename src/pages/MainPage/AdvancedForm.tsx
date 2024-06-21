import { Textarea } from '@nextui-org/input';

export const AdvancedForm = () => {
  return (
    <div>
      <div className="flex flex-col items-center mt-4 text-nowrap">
        <p className="mr-2">Paste your transaction in here:</p>
        <Textarea className="w-full h-48 p-2" placeholder="0x..." />
      </div>
    </div>
  )
};