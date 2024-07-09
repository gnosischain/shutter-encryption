import { Textarea } from '@nextui-org/input';
import { useCallback, useState } from 'react';
import type { UsePrepareTransactionRequestReturnType } from 'wagmi';

import { SubmitButton } from './SubmitButton';

interface AdvancedFormProps {
  submit: (tx: UsePrepareTransactionRequestReturnType) => void,
  status: number,
  isSubmitDisabled: boolean,
}

const exampleTransaction = `{
  account: "0x0ab3a781Ba0dB57a54Ac6AE865916a0FE585a7A2",
  chainId: 10200,
  data: "0xa9059cbb0000000000000000000000009cbaee4fd3c9a89f327edb1b161eba7bd5498d0f00000000000000000000000000000000000000000000000006f05b59d3b20000",
  from: "0x0ab3a781Ba0dB57a54Ac6AE865916a0FE585a7A2",
  gas: 42866,
  maxFeePerGas: 3000000008,
  maxPriorityFeePerGas: 3000000000,
  nonce: 52,
  to: "0x19C653Da7c37c66208fbfbE8908A5051B57b4C70",
  type: "eip1559",
  value: 0,
}`

const exampleTransaction2 = `{
  "chainId": 1,
  "from": "0x654dff41d51c230fa400205a633101c5c1f1969c",
  "to": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  "value": "0x2386f26fc10000",
  "data": "0xd0e30db0",
  "gas": "0x10a1f",
  "maxFeePerGas": "0x12a05f200",
  "maxPriorityFeePerGas": "0x12a05f200",
  "nonce": "0x48"
}`;

export const AdvancedForm = ({ submit, status, isSubmitDisabled }: AdvancedFormProps) => {
  const [transactionData, setTransactionData] = useState<string>();

  const onSubmit = useCallback(() => {
    // submit();
  }, [submit]);

  return (
    <div>
      <div className="flex flex-col items-center mt-4 text-nowrap">
        <p className="mr-2">Paste your transaction in here:</p>
        <Textarea
          className="w-full h-48 p-2"
          placeholder="{}"
          value={transactionData}
          onChange={useCallback((e: any) => setTransactionData(e.target.value), [])}
        />
        <div
          className="text-xs text-default-500 hover:cursor-pointer"
          onClick={useCallback(() => setTransactionData(exampleTransaction), [])}
        >
          Prefill Example
        </div>
      </div>

      <SubmitButton
        submit={onSubmit}
        status={status}
        transactionCount={0} // TODO: add transaction count in advanced form
        isSubmitDisabled={isSubmitDisabled}
      />
    </div>
  );
};