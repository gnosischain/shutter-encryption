import { useState, useMemo, useEffect, useCallback } from 'react';
import { useChainId, useBlockNumber } from 'wagmi';
import { CHAINS_MAP } from '@/constants/chains';
import { useGetShutterValidatorIndexes } from './useGetShutterValidatorIndexes';
import { useFetchDutiesProposer } from './useFetchDutiesProposer';

const SLOT_TIME = 5;
const SLOTS_PER_EPOCH = 16;

const getEpoch = (genesisTime: number) => {
  return Math.floor(((Date.now() / 1000) - genesisTime) / SLOT_TIME / SLOTS_PER_EPOCH);
};

const getSlot = (genesisTime: number) => {
  return Math.floor(((Date.now() / 1000) - genesisTime) / SLOT_TIME);
};


export const useShutterValidators = () => {
  const chainId = useChainId();
  const chain = useMemo(() => CHAINS_MAP[chainId], [chainId]);
  const [currentEpoch, setCurrentEpoch] = useState(getEpoch(chain.genesisTime));
  const [timeDifference, setTimeDifference] = useState(0);
  const shutteredValidatorIndexes = useGetShutterValidatorIndexes(chainId);
  const { data: dutiesProposer } = useFetchDutiesProposer(chain.gbcUrl, currentEpoch);
  const [whitelist, setWhitelist] = useState<Set<number>>(new Set());

  const filteredValidatorIndexes = useMemo(() => {
    if (!shutteredValidatorIndexes) return new Set();
    return new Set([...shutteredValidatorIndexes].filter(index => whitelist.has(Number(index))));
  }, [shutteredValidatorIndexes, whitelist]);

  const match = useMemo(() => {
    if (!filteredValidatorIndexes || !dutiesProposer) return;

    // todo: gets first one, could be case when current slot is later than the first one
    return dutiesProposer?.find((duty) => {
      return filteredValidatorIndexes.has(duty.validator_index);
    });
  }, [dutiesProposer, filteredValidatorIndexes]);

  useEffect(() => {
    if (!dutiesProposer || !match) return;
    const interval = setInterval(() => {
      const currentSlot = getSlot(chain.genesisTime);
      const timeDifference = match ? (match.slot - currentSlot) * SLOT_TIME : 0;
      setTimeDifference(timeDifference);

      if (currentSlot >= match?.slot) {
        setTimeDifference(0);
        setCurrentEpoch((prev) => prev + 1);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dutiesProposer, match, chain]);

  return {
    whitelist,
    setWhitelist,
    filteredValidatorIndexes,
    timeDifference,
  };
};
