import { BigNumber, utils } from 'ethers';
import { useMemo } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';

import { useGetValidatorRegistryLogs } from './useGetValidatorRegistryLogs';
import { GET_UPDATES } from './ValidatorRegistryQL';
import { useQueryValidatorRegistryLogs } from './useQueryValidatorRegistryLogs';

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
  const { data: logs } = useGetValidatorRegistryLogs(chainId);

// todo wip
  useQueryValidatorRegistryLogs();
  // const [getUpdates, { loading, data: updates }] = useLazyQuery(GET_UPDATES);
  // const { data: updates, loading, error } = useQuery(GET_UPDATES);

  // console.log('graph', { logs, updates, loading, error });

  return useMemo(() => {
    return logs?.reduce((acc, log) => {
      const validatorIndex = extractValidatorIndex(log.args.message);
      const subscriptionStatus = extractSubscriptionStatus(log.args.message);

      if (subscriptionStatus) {
        acc.add(validatorIndex);
      } else {
        acc.delete(validatorIndex);
      }

      return acc;
    }, new Set());
  }, [logs]);
};
