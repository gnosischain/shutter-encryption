import { useCallback } from 'react';

import { useCreateWalletClient } from '@/hooks/useCreateWalletClient';

export const useSignTransaction = () => {
  const client = useCreateWalletClient();

  return useCallback(async (request: any) => {
    // const request = await client.prepareTransactionRequest({
    //   account: client.account,
    //   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    //   value: 1000000000000n
    // })

    console.log({ request });

    const signature = await client.signTransaction(request);

    console.log({ signature });

    return signature;
  }, [client]);
}
