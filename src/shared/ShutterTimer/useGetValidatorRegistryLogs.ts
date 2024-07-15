import { useQuery } from '@tanstack/react-query';
import { providers, Contract } from 'ethers';

import { CHAINS_MAP } from '@/constants/chains';
import validatorRegistryABI from '@/abis/validatorRegistryABI';

// query
const LOGS_QUERY_KEY = 'logs';
export const useGetValidatorRegistryLogs = (chainId: number) => useQuery({
  queryKey: [LOGS_QUERY_KEY, chainId],
  queryFn: async () => {
    try {
      const chain = CHAINS_MAP[chainId];
      const rpc = chain.rpcUrls.default.http[0];
      const provider = new providers.JsonRpcProvider(rpc);

      const localStorageLogsKey = [LOGS_QUERY_KEY, chainId].join('_');
      const cachedString = localStorage.getItem(localStorageLogsKey);
      const cachedLogs = cachedString ? JSON.parse(cachedString) : { blockNumber: null, logs: [] };

      const responseLogs = await provider.getLogs({
        address: chain.contracts.validatorRegistry.address,
        topics: [],
        fromBlock: Number(cachedLogs.blockNumber) ?? 'earliest',
        toBlock: 'latest'
      });
      const allLogs = [...cachedLogs.logs, ...responseLogs];
      const blockNumber = responseLogs.length > 0 ? responseLogs[responseLogs.length - 1].blockNumber + 1 : cachedLogs.blockNumber;

      localStorage.setItem(localStorageLogsKey, JSON.stringify({
        blockNumber: blockNumber,
        logs: allLogs,
      }));

      const contract = new Contract(
        chain.contracts.validatorRegistry.address,
        validatorRegistryABI,
        provider
      );

      const parsedlogs = allLogs.map((log: any) => contract.interface.parseLog(log));

      console.log('[service][logs] queried logs', { parsedlogs });

      return parsedlogs;
    } catch (error) {
      console.error('[service][logs] Failed to query logs', error);
    }

    return;
  },
  enabled: Boolean(chainId),
});
