import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { createWalletClient, custom } from 'viem';

export const useCreateWalletClient = () => {
  const { address, chain } = useAccount();

  return useMemo(() => {
    // @ts-expect-error - avoid error if window.ethereum is not defined
    return window.ethereum ? createWalletClient({
      account: address,
      chain,
      // @ts-expect-error - we know that window.ethereum is defined
      transport: custom(window.ethereum!),
    }) : null;
  }, [address, chain]);
}
