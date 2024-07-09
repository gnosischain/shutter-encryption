import { useEffect, useMemo, useState } from 'react';
import { useChainId } from 'wagmi';
import { CircularProgress, Tooltip } from '@nextui-org/react';

import { CHAINS_MAP } from '@/constants/chains';

import { useFetchDutiesProposer } from './useFetchDutiesProposer';
import { useGetShutterValidatorIndexes } from './useGetShutterValidatorIndexes';

const SLOT_TIME = 5;
const SLOTS_PER_EPOCH = 16;
// const EPOCH_DURATION = SLOT_TIME * SLOTS_PER_EPOCH;

const getEpoch = (genesisTime: number) => {
  return Math.floor(((Date.now() / 1000) - genesisTime) / SLOT_TIME / SLOTS_PER_EPOCH);
}

const getSlot = (genesisTime: number) => {
  return Math.floor(((Date.now() / 1000) - genesisTime) / SLOT_TIME);
}

export const ShutterTimer = () => {
  const chainId = useChainId();
  const chain = useMemo(() => CHAINS_MAP[chainId], [chainId]);

  const [currentEpoch, setCurrentEpoch] = useState(getEpoch(chain.genesisTime));
  const [timeDifference, setTimeDifference] = useState(0);

  const shutteredValidatorIndexes = useGetShutterValidatorIndexes(chainId);

  const { data: dutiesProposer } = useFetchDutiesProposer(chain.gbcUrl, currentEpoch);

  const match = useMemo(() => {
    if (!shutteredValidatorIndexes || !dutiesProposer) return;

    // todo: gets first one, could be case when current slot is later than the first one
    return dutiesProposer?.find((duty: any) => {
      return shutteredValidatorIndexes.has(Number(duty.validator_index));
    });
  }, [dutiesProposer, shutteredValidatorIndexes]);

  // console.log({ shutteredValidatorIndexes, dutiesProposer, currentEpoch, match });

  useEffect(() => {
    if (!dutiesProposer || !match) return;

    const interval = setInterval(() => {
      const currentSlot = getSlot(chain.genesisTime);

      const timeDifference = (match.slot - currentSlot) * SLOT_TIME;
      setTimeDifference(timeDifference);

      // console.log({ match, timeDifference, currentSlot });

      if (currentSlot >= match.slot) {
        setTimeDifference(0);
        setCurrentEpoch(getEpoch(chain.genesisTime) + 1);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dutiesProposer, match, chain]);

  // console.log(timeDifference);

  return (
    <div className="fixed bottom-0 right-4 text-xs w-full flex justify-end">
      <Tooltip content={`Next Shutter transactions will be included in ~${timeDifference} seconds`} color='warning' placement='left'>
        <CircularProgress
          className="my-4"
          aria-label="Loading..."
          size="lg"
          value={100 - timeDifference}
          color="warning"
          showValueLabel={true}
        />
      </Tooltip>
    </div>
  )
};
