import { Tabs, Tab } from "@nextui-org/react";
import { useState, useCallback } from "react";
import { type UsePrepareTransactionRequestReturnType } from "wagmi";
import { type Hash } from "viem";

import { useSignTransaction } from "@/hooks/useSignTransaction";
import { useShutterEncryption } from "@/hooks/useShutterEncryption";

import { TransferForm } from "./TransferForm";
import { AdvancedForm } from "./AdvancedForm";
import { ProgressInfoCard } from "./ProgressInfoCard";

// status = 0 -> preparing
// status = 1 -> signing
// status = 2 -> encrypting
// status = 3 -> submitting
// status = 4 -> submitted tx

export const FormsWrapper = () => {
  const [status, setStatus] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [submittedTxHash, setSubmittedTxHash] = useState<Hash>();

  const signTx = useSignTransaction();
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

        // submit tx to sequencer
        const hash = await submitTransactionToSequencer(encryptionParams);
        console.log({ hash });
        setStatus(4);

        setSubmittedTxHash(hash);
      } catch (err) {
        console.log(err);
        setStatus(0);
      }
    },
    [status, signTx, encryptTx, submitTransactionToSequencer]
  );

  // TODO delete
  const testEncryption = async () => {
    const tx =
      "0x02f8748227d80e84b2d05e0084b2d05e0882520894cabf0fe39453388285f78dbf251511a857131c09880de0b6b3a764000080c080a0937ae369ca7a337da478a51c4b8dd6d7a1e8308bf4e9fa02c9c8bd1e4033163ea03caedb7d814df505067dff817eebd5c5b10a4e862cf08605f7690c7311d3c55b";
    const ecnryptedTx = await encryptTx(tx);
    console.log("encrypted tx");
    console.log(ecnryptedTx?.encryptedTx.toUpperCase());
  };

  return (
    <div className="flex flex-col">
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

      <ProgressInfoCard status={status} submittedTxHash={submittedTxHash} />
      <button onClick={testEncryption}>test encryption</button>
    </div>
  );
};
