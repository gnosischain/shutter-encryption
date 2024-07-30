import { useQuery } from '@tanstack/react-query';
import { useLazyQuery } from '@apollo/client';


import { GET_UPDATES } from './ValidatorRegistryQL';

export interface ValidatorRegistryLog {
  message: string,
  signature: string,
}

const SUB_GRAPH_MAX_QUERY_LOGS = 1000;

// query
const LOGS_QUERY_KEY = 'logs';
export const useGetValidatorRegistryLogs = (chainId: number) => {
  const [getUpdates] = useLazyQuery(GET_UPDATES);

  return useQuery({
    queryKey: [LOGS_QUERY_KEY, chainId],
    queryFn: async () => {
      try {
        let allLogs: ValidatorRegistryLog[] = [];
        let skip = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const response = await getUpdates({ variables: { first: SUB_GRAPH_MAX_QUERY_LOGS, skip }});

          const logs = response.data?.updateds;

          allLogs = [...allLogs, ...logs];

          if (logs.length < SUB_GRAPH_MAX_QUERY_LOGS) {
            break; // Break the loop if the number of logs fetched is less than 'first', indicating the end of data
          }

          skip += SUB_GRAPH_MAX_QUERY_LOGS; // Increment skip by 'first' for the next page
        }

        console.log('[service][logs] queried logs', { allLogs });

        return allLogs;
      } catch (error) {
        console.error('[service][logs] Failed to query logs', error);
      }

      return;
    },
    enabled: Boolean(chainId),
  });
};
