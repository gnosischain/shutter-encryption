import { useQuery } from '@tanstack/react-query';

interface ValidatorDuty {
  pubkey: string;
  slot: number;
  validator_index: number;
}

interface DutiesProposerResponse {
  data: ValidatorDuty[];
}

const BASE_ENDPOINT = 'eth/v1';
const DUTIES_PROPOSER_ENDPOINT = 'validator/duties/proposer';

// query
const DUTIES_PROPOSER_QUERY_KEY = 'duties-proposer';
export const useFetchDutiesProposer = (gbcUrl: string, epoch: number) => useQuery<DutiesProposerResponse['data']>({
  queryKey: [DUTIES_PROPOSER_QUERY_KEY, epoch],
  queryFn: async () => {
    try {
      const res = await fetch(`${gbcUrl}/${BASE_ENDPOINT}/${DUTIES_PROPOSER_ENDPOINT}/${epoch}`);
      const data = await res.json();

      console.log('[service][rpc-gbc] queried duties proposer', { data: data.data });

      return data.data;
    } catch (error) {
      console.error('[service][apollo] Failed to query duties proposer', error);
    }
  },
  enabled: Boolean(gbcUrl),
});
