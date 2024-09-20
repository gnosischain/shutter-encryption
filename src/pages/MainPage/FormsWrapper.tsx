import { Tabs, Tab } from '@nextui-org/react';
import { useState, useCallback, useEffect } from 'react';
import { type Hash } from 'viem';

import { useSignTransaction } from '@/hooks/useSignTransaction';
import { useShutterEncryption } from '@/hooks/useShutterEncryption';

import { TransferForm } from './TransferForm';
import { AdvancedForm } from './AdvancedForm';
import { ProgressInfoCard } from './ProgressInfoCard';

// status = 0 -> sign
// status = 1 -> signing
// status = 2 -> encrypt
// status = 3 -> encrypting
// status = 4 -> submit
// status = 5 -> submitting
// status = 6 -> submitted tx

export const FormsWrapper = () => {
  const [status, setStatus] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  const [submittedTxHash, setSubmittedTxHash] = useState<Hash>();
  const [currentTx, setCurrentTx] = useState<any>(null);

  const signTx = useSignTransaction();
  const {
    encryptTx,
    submitTransactionToSequencer,
    isLoading: isEncryptionParamsLoading,
  } = useShutterEncryption();

  const submit = useCallback(
    async (tx: any) => {
      if (status === 6) {
        setStatus(0);
        return;
      }

      if (!tx) return;

      setCurrentTx(tx);

      if (status === 0) {
        setStatus(1); // Start the signing process
      } else if (status === 2) {
        setStatus(3); // Start the encryption process
      } else if (status === 4) {
        setStatus(5); // Start the submission process
      }
    },
    [status],
  );

  useEffect(() => {
    const processTransaction = async () => {
      try {
        if (!currentTx) return;

        if (status === 1) {
          // sign tx
          const signedTx = await signTx({
            ...currentTx.data,
            nonce: currentTx.data.nonce + 1,
          });
          if (!signedTx) {
            setStatus(0);
            return;
          }
          console.log({ signedTx });
          setCurrentTx(signedTx);
          setStatus(3); // Move to the encrypt step
        }

        if (status === 3) {
          // encrypt tx
          const encryptionParams = await encryptTx(currentTx);
          if (!encryptionParams) {
            setStatus(0);
            return;
          }
          console.log({ encryptionParams });
          setCurrentTx(encryptionParams);
          setStatus(5); // Move to the submit step
        }

        if (status === 5) {
          // submit tx to sequencer
          const hash = await submitTransactionToSequencer(currentTx);
          if (!hash) {
            setStatus(0);
            return;
          }
          console.log({ hash });
          setSubmittedTxHash(hash);
          setStatus(6); // Transaction submitted
        }
      } catch (err) {
        console.log(err);
        setStatus(0);
      }
    };

    processTransaction();
  }, [status, currentTx, signTx, encryptTx, submitTransactionToSequencer]);

  return (
    <div className="w-full flex justify-center py-8">
      <div className="w-96 p-4">
        <Tabs fullWidth color="primary" classNames={{ tab: 'bg-white' }}>
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
              setStatus={setStatus}
            />
          </Tab>
        </Tabs>
        <ProgressInfoCard status={status} submittedTxHash={submittedTxHash} />
      </div>
    </div>
  );
};
