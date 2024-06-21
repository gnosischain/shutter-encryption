import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { createWalletClient, custom } from 'viem';

export const useCreateWalletClient = () => {
  const { address, chain } = useAccount();

  console.log({ address, chain });

  return useMemo(() => {
    return createWalletClient({
      account: address,
      chain,
      // @ts-expect-error - we know that window.ethereum is defined
      transport: custom(window.ethereum!)
    });
  }, [address, chain]);
}
