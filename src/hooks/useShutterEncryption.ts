import { useCallback } from 'react';
import { useReadContract, useChainId, useBlockNumber, useAccount } from 'wagmi';
import { type SignTransactionReturnType, type Hex } from 'viem';

import keyBroadcastABI from '@/abis/keyBroadcastABI';
import keyperSetManagerABI from '@/abis/keyperSetManagerABI';
import { CHAINS_MAP } from '@/constants/chains';
import { encryptData } from '@/services/shutter/encryptDataBlst';

const tKeyperSetChangeLookAhead = 4;

function randomBytes(size: number) {
  const array = new Uint8Array(size);
  window.crypto.getRandomValues(array);

  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

interface UseShutterEncryptionProps {
  signedTx: SignTransactionReturnType;
}

export const useShutterEncryption = ({ signedTx }: UseShutterEncryptionProps) => {
  const { data: blockNumber } = useBlockNumber();
  const chainId = useChainId();
  const { address } = useAccount();
  const chain = CHAINS_MAP[chainId];

  const { data: eon, ...eonRest } = useReadContract({
    address: chain.contracts.keyperSetManager.address,
    abi: keyperSetManagerABI,
    functionName: 'getKeyperSetIndexByBlock',
    // @ts-expect-error - disabled query if address is not defined
    args: [Number(blockNumber) + tKeyperSetChangeLookAhead],
    query: {
      enabled: Boolean(blockNumber && signedTx),
    },
  });

  const { data: eonKeyBytes, ...eonKeyBytesRest } = useReadContract({
    address: chain.contracts.keyBroadcast.address,
    abi: keyBroadcastABI,
    functionName: 'getEonKey',
    // @ts-expect-error - disabled query if eon is not defined
    args: [eon],
    query: {
      enabled: Boolean(eon && signedTx),
    },
  });

  const encryptTx = useCallback(async () => {
    if (!signedTx || !eonKeyBytes) return;

    const randomHex = randomBytes(12);
    const identityPrefixHex = address + randomHex as Hex;

    console.log({ signedTx, identityPrefixHex, eonKeyBytes, randomHex });

    return await encryptData(signedTx, identityPrefixHex, eonKeyBytes, identityPrefixHex);
  }, [signedTx, eonKeyBytes, address]);

  return {
    encryptTx,
    isLoading: eonRest.isLoading || eonKeyBytesRest.isLoading,
  };
};
