import { useCallback, useState, useMemo, useEffect } from 'react';
import { Textarea } from '@nextui-org/input';
import { usePrepareTransactionRequest, type UsePrepareTransactionRequestReturnType } from 'wagmi';
import { Tab, Tabs } from '@nextui-org/react';

import { SubmitButton } from './SubmitButton';

interface AdvancedFormProps {
  submit: (tx: UsePrepareTransactionRequestReturnType | `0x${string}`) => void,
  status: number,
  setStatus: (status: 0 | 1 | 2 | 3 | 4 | 5 | 6) => void,
  isSubmitDisabled: boolean,
}

const rawTx = `{
  "account": "0x0ab3a781Ba0dB57a54Ac6AE865916a0FE585a7A2",
  "chainId": 10200,
  "data": "0xa9059cbb0000000000000000000000009cbaee4fd3c9a89f327edb1b161eba7bd5498d0f00000000000000000000000000000000000000000000000006f05b59d3b20000",
  "from": "0x0ab3a781Ba0dB57a54Ac6AE865916a0FE585a7A2",
  "gas": 42866,
  "maxFeePerGas": 3000000008,
  "maxPriorityFeePerGas": 3000000000,
  "nonce": 52,
  "to": "0x19C653Da7c37c66208fbfbE8908A5051B57b4C70",
  "type": "eip1559",
  "value": 0
}`;

const signedTx = "0x02f8b18227d80184b2d05e0084b2d05e0882a7729419c653da7c37c66208fbfbe8908a5051b57b4c7080b844a9059cbb0000000000000000000000009cbaee4fd3c9a89f327edb1b161eba7bd5498d0f00000000000000000000000000000000000000000000000006f05b59d3b20000c080a0d424743c77d03d7859e4da871cbd82fca4424e47ba823304faaf5dec08e58393a0666944aee77733691cf514ba2607ed6625409219f89cd2ef36583a0a422ca684";

const encryptedTx = "0x02f8b18227d80184b2d05e0084b2d05e0882a7729419c653da7c37c66208fbfbe8908a5051b57b4c7080b844a9059cbb0000000000000000000000009cbaee4fd3c9a89f327edb1b161eba7bd5498d0f00000000000000000000000000000000000000000000000006f05b59d3b20000c080a0d424743c77d03d7859e4da871cbd82fca4424e47ba823304faaf5dec08e58393a0666944aee77733691cf514ba2607ed6625409219f89cd2ef36583a0a422ca684";

const formatTransactionData = (data: string, transactionType: string) => {
  if (transactionType !== "raw") return data as `0x${string}`;
  try {
    const parsedData = JSON.parse(data);
    return parsedData;
  } catch (e) {
    return null;
  }
};

const isValidTxData = (txData: any, transactionType: string) => {
  if (transactionType !== "raw") return typeof txData === 'string' && txData.startsWith('0x');
  return !!txData &&
    typeof txData.chainId === 'number' &&
    typeof txData.to === 'string' &&
    typeof txData.data === 'string' &&
    typeof txData.nonce === 'number' &&
    typeof txData.gas === 'number' &&
    typeof txData.maxFeePerGas === 'number';
};

export const AdvancedForm = ({ submit, status, setStatus, isSubmitDisabled }: AdvancedFormProps) => {
  const [transactionData, setTransactionData] = useState<string>('');
  const [transactionType, setTransactionType] = useState<'raw' | 'signed' | 'encrypted'>('raw');

  const formattedTxData = useMemo(() => formatTransactionData(transactionData, transactionType), [transactionData, transactionType]);

  const preparedTransactionRequest = usePrepareTransactionRequest({
    chainId: formattedTxData?.chainId,
    data: formattedTxData?.data,
    to: formattedTxData?.to,
    gas: formattedTxData?.gas,
    maxFeePerGas: formattedTxData?.maxFeePerGas,
    maxPriorityFeePerGas: formattedTxData?.maxPriorityFeePerGas,
    nonce: formattedTxData?.nonce,
    value: formattedTxData?.value,
  });

  const onSubmit = useCallback(() => {
    if (!isValidTxData(formattedTxData, transactionType)) return;
    if (formattedTxData !== null) {
      const tx = transactionType === 'raw' ? preparedTransactionRequest : formattedTxData;
      submit(tx);
    }
  }, [submit, transactionType, formattedTxData, preparedTransactionRequest]);

  useEffect(() => {
    if (transactionType === 'signed') {
      setStatus(2); // Encrypting transaction
    } else if (transactionType === 'encrypted') {
      setStatus(4); // Submitting transaction
    } else {
      setStatus(0); // Sign transaction
    }
  }, [transactionType, setStatus]);

  const handleTabChange = useCallback((key: React.Key) => {
    setTransactionType(key as string as 'raw' | 'signed' | 'encrypted');
  }, []);

  return (
    <div>
      <div className="flex w-full flex-col items-start mt-4 text-nowrap">
        <p className="mb-2">Paste your transaction in here:</p>
        <Tabs aria-label="Tabs variants" size='sm' color="primary" classNames={{ tab: "bg-white" }} selectedKey={transactionType} onSelectionChange={handleTabChange} >
          <Tab className="focus:outline-none" key="raw" title="Raw" />
          <Tab className="focus:outline-none" key="signed" title="Signed" />
          <Tab className="focus:outline-none" key="encrypted" title="Encrypted" />
        </Tabs>
        <Textarea
          className="w-full h-48 mt-2"
          placeholder="{}"
          value={transactionData}
          onChange={useCallback((e: any) => setTransactionData(e.target.value), [])}
        />
        <div
          className="text-xs text-default-500 hover:cursor-pointer"
          onClick={useCallback(() => setTransactionData(transactionType === "raw" ? rawTx : transactionType === "signed" ? signedTx : encryptedTx), [transactionType])}
        >
          Prefill Example
        </div>
      </div>

      <SubmitButton
        submit={onSubmit}
        status={status}
        transactionCount={preparedTransactionRequest.data?.nonce}
        isSubmitDisabled={isSubmitDisabled || !isValidTxData(formattedTxData, transactionType)}
      />
    </div>
  );
};
