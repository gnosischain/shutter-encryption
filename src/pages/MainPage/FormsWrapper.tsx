import { Tabs, Tab } from "@nextui-org/react";
import { useState, useCallback, useEffect } from "react";
import { type UsePrepareTransactionRequestReturnType } from "wagmi";
import { type Hash } from "viem";

import { useSignTransaction } from "@/hooks/useSignTransaction";
import { useShutterEncryption } from "@/hooks/useShutterEncryption";

import { TransferForm } from "./TransferForm";
import { AdvancedForm } from "./AdvancedForm";
import { ProgressInfoCard } from "./ProgressInfoCard";
import { WhiteList } from "./Whitelist";
import { useShutterValidators } from "@/shared/ShutterTimer/ShutterValidatorsProvider";

// status = 0 -> preparing
// status = 1 -> signing
// status = 2 -> encrypting
// status = 3 -> submitting
// status = 4 -> submitted tx

export const FormsWrapper = () => {
  const [status, setStatus] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [submittedTxHash, setSubmittedTxHash] = useState<Hash>();
  const { filteredValidatorIndexes, lastNonWhitelistValidator } = useShutterValidators();

  const { signTx } = useSignTransaction();
  const {
    encryptTx,
    submitTransactionToSequencer,
    isLoading: isEncryptionParamsLoading,
  } = useShutterEncryption();

  const submit = useCallback(
    async (tx: UsePrepareTransactionRequestReturnType) => {
      try {
        if (status === 4) {
          setStatus(0);
          return;
        }

        if (!tx.data) return;

        console.log({ tx });

        setStatus(1);

        // sign tx
        const signedTx = await signTx({
          ...tx.data,
          nonce: tx.data.nonce + 1,
        });
        console.log({ signedTx });
        setStatus(2);

        // encrypt tx
        const encryptionParams = await encryptTx(signedTx);
        console.log({ encryptionParams });
        setStatus(3);

        // Wait for the correct validator before submitting
        const interval = setInterval(async () => {
          if (!filteredValidatorIndexes.has(lastNonWhitelistValidator)) {
            clearInterval(interval);

            // submit tx to sequencer
            const hash = await submitTransactionToSequencer(encryptionParams);
            console.log({ hash });
            setStatus(4);

            setSubmittedTxHash(hash);
          }
        }, 1000);
      } catch (err) {
        console.log(err);
        setStatus(0);
      }
    },
    [status, signTx, encryptTx, submitTransactionToSequencer, filteredValidatorIndexes, lastNonWhitelistValidator]
  );

  return (
    <div className="w-full flex justify-center py-8">
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
        <WhiteList />
        <ProgressInfoCard status={status} submittedTxHash={submittedTxHash} />
      </div>
    </div>
  );
};
