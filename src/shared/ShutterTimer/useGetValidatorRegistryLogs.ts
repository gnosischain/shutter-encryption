import { useQuery } from '@tanstack/react-query';
import { useLazyQuery } from '@apollo/client';
import { GET_UPDATES } from './ValidatorRegistryQL';

export interface ValidatorIndex {
  id: string,
  active: boolean,
}

// Max query limitation is different when using the hosted service. If run locally, it might be possible to configure this
const ENVIO_MAX_QUERY_LOGS = 10000;

// query
const LOGS_QUERY_KEY = 'logs';
export const useGetValidatorRegistryLogs = (chainId: number, enabled: boolean) => {
  const [getUpdates] = useLazyQuery(GET_UPDATES);

  return useQuery({
    queryKey: [LOGS_QUERY_KEY, chainId],
    queryFn: async () => {
      try {
        let allLogs: ValidatorIndex[] = [];

        // eslint-disable-next-line no-constant-condition
        while (true) {
          // const blockNumber = allLogs.length ? allLogs[allLogs.length - 1].blockNumber : lastBlockNumber;

          const response = await getUpdates({ variables: { first: ENVIO_MAX_QUERY_LOGS } });

          const logs = response.data.ValidatorIndex;

          allLogs = [...allLogs, ...(logs ?? [])];

          if (logs.length < ENVIO_MAX_QUERY_LOGS) {
            break; // Break the loop if the number of logs fetched is less than 'first', indicating the end of data
          }
        }

        console.log('[service][logs] queried logs', { allLogs, chainId });

        return allLogs;
      } catch (error) {
        console.error('[service][logs] Failed to query logs', error);
      }

      return;
    },
    enabled: enabled && Boolean(chainId),
  });
};