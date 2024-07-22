
import { useCallback } from "react";
import { useCreateWalletClient } from "@/hooks/useCreateWalletClient";

export const useSignTransaction = () => {
  const client = useCreateWalletClient();

  return useCallback(async (request: any) => {
      if (!client) return;

      console.log({ request });

      const serializedTransaction = await client.signTransaction(request);

      console.log('serialized transaction', { serializedTransaction });

      return serializedTransaction;
    }, [client]);
};
