import { useQuery } from '@tanstack/react-query';

import config from '@/constants/config';

const BASE_ENDPOINT = 'eth/v1';
const DUTIES_PROPOSER_ENDPOINT = 'validator/duties/proposer';

// query
const DUTIES_PROPOSER_QUERY_KEY = 'duties-proposer';
export const useFetchDutiesProposer = (gbcUrl: string, epoch: number) => useQuery({
  queryKey: [DUTIES_PROPOSER_QUERY_KEY, epoch],
  queryFn: async () => {
    try {
      const res = await fetch(`${config.proxyServerUrl}/${gbcUrl}/${BASE_ENDPOINT}/${DUTIES_PROPOSER_ENDPOINT}/${epoch}`);
      const data = await res.json();

      console.log('[service][rpc-gbc] queried duties proposer', { data: data.data });

      return data.data;
    } catch (error) {
      console.error('[service][apollo] Failed to query duties proposer', error);
    }
  },
  enabled: Boolean(gbcUrl),
});
