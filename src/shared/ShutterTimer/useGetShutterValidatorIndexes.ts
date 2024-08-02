import { useMemo } from 'react';

import { useGetValidatorRegistryLogs } from './useGetValidatorRegistryLogs';

export const useGetShutterValidatorIndexes = (chainId: number) => {
  const { data: logs } = useGetValidatorRegistryLogs(chainId, true);

  return useMemo(() => {
    return new Set(logs?.map((validator) => validator.id));
  }, [logs]);
};
