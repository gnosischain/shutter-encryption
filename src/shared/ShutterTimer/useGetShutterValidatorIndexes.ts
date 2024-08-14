import { BigNumber, utils } from 'ethers';
import { useEffect } from 'react';

import { useValidatorIndexesStore } from '@/stores/useValidatorIndexesStore';
import { useGetValidatorRegistryLogs } from './useGetValidatorRegistryLogs';

function extractValidatorIndex(messageHex: string) {
  // Convert hex to bytes
  const messageBytes = utils.arrayify(messageHex);

  // Version: 1 byte
  // Chain ID: 8 bytes
  // Validator Registry Address: 20 bytes (Ethereum address)
  // Validator Index: 8 bytes
  // Nonce: 8 bytes
  // Action: 1 byte
  const offset = 1 + 8 + 20; // skip Version, Chain ID, and Address
  const validatorIndexBytes = messageBytes.slice(offset, offset + 8);

  // Convert from bytes to big-endian integer
  return BigNumber.from(validatorIndexBytes).toNumber();
}

function extractSubscriptionStatus(messageHex: string) {
  return messageHex[messageHex.length - 1] === '1';
}

export const useGetShutterValidatorIndexes = (chainId: number) => {
  const { validatorIndexes, lastBlockNumber} = useValidatorIndexesStore(state => state[chainId]);
  const { _hasHydrated, setValidatorIndexes, setLastBlockNumber } = useValidatorIndexesStore();

  const { data: logs, isLoading } = useGetValidatorRegistryLogs(chainId, lastBlockNumber, _hasHydrated);

  useEffect(() => {
    let currentIndexes = validatorIndexes;
    let newLastBlock = lastBlockNumber;

    const indexes = logs?.reduce((acc, log) => {
      try {
        const validatorIndex = extractValidatorIndex(log.message);
        const subscriptionStatus = extractSubscriptionStatus(log.message);

        if (subscriptionStatus) {
          acc.add(validatorIndex);
        } else {
          currentIndexes = currentIndexes.filter((index) => index !== validatorIndex);
          acc.delete(validatorIndex);
        }

        newLastBlock = Number(log.blockNumber);

        return acc;
      } catch (err) {
        console.error('Failed to extract validator index from log', err);
        return acc;
      }
    }, new Set<number>());

    if (indexes && newLastBlock > lastBlockNumber) {
      setValidatorIndexes([...currentIndexes, ...indexes], chainId);
      setLastBlockNumber(newLastBlock, chainId);
    }

  }, [logs]);

  return {
    validatorIndexes,
    isLoading,
  }
};
