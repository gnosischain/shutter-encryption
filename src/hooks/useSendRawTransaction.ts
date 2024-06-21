import { useCallback } from 'react';
import type { TransactionSerializedGeneric } from 'viem';

import { useCreateWalletClient } from '@/hooks/useCreateWalletClient';

export const useSendRawTransaction = () => {
  const client = useCreateWalletClient();

  return useCallback(async (signature: TransactionSerializedGeneric) => {
    const hash = await client.sendRawTransaction({
      serializedTransaction: signature,
    })

    console.log({ hash });

    return hash;
  }, [client]);
}