import { Tabs, Tab } from '@nextui-org/react';
import { useState, useCallback } from 'react';
import { type UsePrepareTransactionRequestReturnType } from 'wagmi';
import { type SignTransactionReturnType, type Hex } from 'viem';

import { useSignTransaction } from '@/hooks/useSignTransaction';
import { useShutterEncryption } from '@/hooks/useShutterEncryption';
import sequencerABI from '@/abis/sequencerABI';

import { TransferForm } from './TransferForm';
import { AdvancedForm } from './AdvancedForm';
import { ProgressInfoCard } from './ProgressInfoCard';

// status = 0 -> preparing
// status = 1 -> signing
// status = 2 -> encrypting
// status = 3 -> submitting
// status = 4 -> submitted tx
// status = 5 -> original tx

export const FormsWrapper = () => {
  const [status, setStatus] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [signedTx, setSignedTx] = useState<SignTransactionReturnType>('0x02');
  const [encryptedTx, setEncryptedTx] = useState<Hex>('0x');

  const signTx = useSignTransaction();
  const { encryptTx, isLoading: isEncryptionParamsLoading } = useShutterEncryption({ signedTx });

  const submit = useCallback(async (tx: UsePrepareTransactionRequestReturnType) => {
    if (!tx.data) return;

    console.log({ tx });

    if (status === 0) {
      // sign tx
      const signedTx = await signTx({
        ...tx.data,
        nonce: tx.data.nonce + 1,
      });

      console.log({ signedTx })

      setSignedTx(signedTx);
    }
    if (status === 1) {
      // encrypt tx
      const encryption = await encryptTx();
      console.log({ encryption });

      if (encryption) {
        setEncryptedTx(encryption);
      }
    }
    if (status === 2) {
      // submit tx


    }
    if (status === 3) {
      setStatus(0);
    }

    // @ts-expect-error - this is more easy interaction between the transaction statuses
    setStatus(s => s+1);
  }, [status, signedTx]);

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-96 p-4">
        <Tabs fullWidth color="primary" className="">
          <Tab className="focus:outline-none" key="transfer" title="Transfer">
            <TransferForm
              isSubmitDisabled={isEncryptionParamsLoading}
              submit={submit}
              status={status}
            />
          </Tab>
          <Tab className="focus:outline-none" key="advanced" title="Advanced">
            <AdvancedForm
              isSubmitDisabled={isEncryptionParamsLoading}
              submit={submit}
              status={status}
            />
          </Tab>
        </Tabs>
      </div>

      <ProgressInfoCard status={status} />
    </div>
  )
};
