import { Tabs, Tab } from '@nextui-org/react';
import { useState, useCallback } from 'react';
import { type UsePrepareTransactionRequestReturnType } from 'wagmi';
import { type SignTransactionReturnType } from 'viem';

import { useSignTransaction } from '@/hooks/useSignTransaction';

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

  const signTx = useSignTransaction();

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
              submit={submit}
              status={status}
            />
          </Tab>
          <Tab className="focus:outline-none" key="advanced" title="Advanced">
            <AdvancedForm
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
