import { useEffect, useMemo, useState } from 'react';
import { useChainId } from 'wagmi';
import { CircularProgress, Tooltip, Spinner } from '@nextui-org/react';

import { CHAINS_MAP } from '@/constants/chains';

import { useFetchDutiesProposer } from './useFetchDutiesProposer';
import { useGetShutterValidatorIndexes } from './useGetShutterValidatorIndexes';

const SLOT_TIME = 5;
const SLOTS_PER_EPOCH = 16;
// const EPOCH_DURATION = SLOT_TIME * SLOTS_PER_EPOCH;

const getEpoch = (genesisTime: number) => {
  return Math.floor((Date.now() / 1000 - genesisTime) / SLOT_TIME / SLOTS_PER_EPOCH);
};

const getSlot = (genesisTime: number) => {
  return Math.floor((Date.now() / 1000 - genesisTime) / SLOT_TIME);
};

const getLoadingLabel = ({
  isValidatorsLoading,
  isProposersLoading,
  isWaiting,
  timeDifference,
}: {
  isValidatorsLoading: boolean;
  isProposersLoading: boolean;
  isWaiting: boolean;
  timeDifference: number;
}) => {
  if (isValidatorsLoading) {
    return 'Fetching shutter validators...';
  }
  if (isWaiting) {
    return 'Waiting for epoch with shutter validators...';
  }
  if (isProposersLoading) {
    return 'Fetching proposers...';
  }

  return `Next Shutter transactions will be included in ~${timeDifference} seconds`;
};

export const ShutterTimer = () => {
  const chainId = useChainId();
  const chain = useMemo(() => CHAINS_MAP[chainId], [chainId]);

  const [currentEpoch, setCurrentEpoch] = useState(getEpoch(chain.genesisTime));
  const [timeDifference, setTimeDifference] = useState(0);
  // waiting for next epoch
  const [isWaiting, setIsWaiting] = useState(false);

  const { validatorIndexes: shutteredValidatorIndexes, isLoading: isValidatorsLoading } =
    useGetShutterValidatorIndexes(chainId);

  const { data: dutiesProposer, isLoading: isProposersLoading } = useFetchDutiesProposer(
    chain.gbcUrl,
    currentEpoch,
  );

  const matches = useMemo(() => {
    if (!shutteredValidatorIndexes || !dutiesProposer) return;

    return dutiesProposer?.filter((duty: any) => {
      return shutteredValidatorIndexes.includes(Number(duty.validator_index));
    });
  }, [dutiesProposer, shutteredValidatorIndexes]);

  // console.log({ shutteredValidatorIndexes, dutiesProposer, currentEpoch, matches });

  useEffect(() => {
    setCurrentEpoch(getEpoch(chain.genesisTime));
    setIsWaiting(false);
  }, [chain]);

  useEffect(() => {
    if (!dutiesProposer || !matches) return;

    const interval = setInterval(() => {
      const currentSlot = getSlot(chain.genesisTime);
      const match = matches.find((m: any) => Number(m.slot) > currentSlot);

      if (!match) {
        setTimeDifference(0);

        const nextEpochStart = chain.genesisTime + (currentEpoch + 1) * SLOTS_PER_EPOCH * SLOT_TIME;
        const oneEpochAhead = Date.now() / 1000 + SLOTS_PER_EPOCH * SLOT_TIME;

        if (nextEpochStart < oneEpochAhead) {
          setCurrentEpoch(currentEpoch + 1);
          clearInterval(interval);
          setIsWaiting(false);
        } else {
          setIsWaiting(true);
        }

        return;
      }

      const timeDifference = (match.slot - currentSlot) * SLOT_TIME;
      setTimeDifference(timeDifference);

      // console.log({ match, timeDifference, currentSlot });
    }, 1000);

    return () => clearInterval(interval);
  }, [dutiesProposer, matches, chain]);

  return (
    <div className="fixed bottom-0 right-4 text-xs w-full flex justify-end">
      <Tooltip
        content={getLoadingLabel({
          isValidatorsLoading,
          isProposersLoading,
          isWaiting,
          timeDifference,
        })}
        color="danger"
        placement="left"
      >
        {isValidatorsLoading || isProposersLoading || isWaiting ? (
          <Spinner className="my-4" />
        ) : (
          <CircularProgress
            className="my-4"
            aria-label="Loading..."
            size="lg"
            value={timeDifference}
            formatOptions={{ style: 'unit', unit: 'second' }}
            color="warning"
            showValueLabel={true}
          />
        )}
      </Tooltip>
    </div>
  );
};
