import { useCallback, useEffect, useState } from "react";

import { useCreateWalletClient } from "@/hooks/useCreateWalletClient";
import { getTransactionCount } from "wagmi/actions";
import { wagmiConfig } from "@/components/Web3ModalProvider";

export const useSignTransaction = () => {
  const client = useCreateWalletClient();
  const [transactionCount, setTransactionCount] = useState(0)

  useEffect(() => {
    const fetchTransactionCount = async () => {
      if (client.account?.address) {
        const count = await getTransactionCount(wagmiConfig, { address: client.account.address });
        setTransactionCount(count);
      }
    };

    fetchTransactionCount();
  }, [client]);

  const signTx = useCallback(
    async (request: any) => {
      // const request = await client.prepareTransactionRequest({
      //   account: client.account,
      //   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      //   value: 1000000000000n
      // })

      console.log({ request });

      const serializedTransaction = await client.signTransaction(request);
      // await client.sendRawTransaction({ serializedTransaction });

      console.log("serialized transaction", { serializedTransaction });

      return serializedTransaction;
    },
    [client]
  );

  return { signTx, transactionCount };
};
