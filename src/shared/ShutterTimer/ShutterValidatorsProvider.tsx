import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from "react";
import { useChainId } from "wagmi";
import { CHAINS_MAP } from "@/constants/chains";
import { useGetShutterValidatorIndexes } from "./useGetShutterValidatorIndexes";
import { useFetchDutiesProposer } from "./useFetchDutiesProposer";

interface ShutterValidatorsContextType {
  whitelist: Set<number>;
  setWhitelist: React.Dispatch<React.SetStateAction<Set<number>>>;
  shutteredValidatorIndexes: Set<unknown> | undefined;
  timeDifference: number;
  lastNonWhitelistValidator: number | null;
}

const ShutterValidatorsContext = createContext<ShutterValidatorsContextType | null>(null);

const SLOT_TIME = 5;
const SLOTS_PER_EPOCH = 16;

const getEpoch = (genesisTime: number) => {
  return Math.floor((Date.now() / 1000 - genesisTime) / SLOT_TIME / SLOTS_PER_EPOCH);
};

const getSlot = (genesisTime: number) => {
  return Math.floor((Date.now() / 1000 - genesisTime) / SLOT_TIME);
};

interface ShutterValidatorsProviderProps {
  children: ReactNode;
}

export const ShutterValidatorsProvider: React.FC<ShutterValidatorsProviderProps> = ({ children }) => {
  const chainId = useChainId();
  const chain = useMemo(() => CHAINS_MAP[chainId], [chainId]);
  const [currentEpoch, setCurrentEpoch] = useState(getEpoch(chain.genesisTime));
  const [timeDifference, setTimeDifference] = useState(0);
  const [lastNonWhitelistValidator, setLastNonWhitelistValidator] = useState<number | null>(null);
  const shutteredValidatorIndexes = useGetShutterValidatorIndexes(chainId);
  const { data: dutiesProposer } = useFetchDutiesProposer(chain.gbcUrl, currentEpoch);
  const [whitelist, setWhitelist] = useState<Set<number>>(new Set());

  const filteredValidatorIndexes = useMemo(() => {
    if (!shutteredValidatorIndexes) return new Set();
    if (whitelist.size === 0) return new Set(shutteredValidatorIndexes);
    return new Set([...shutteredValidatorIndexes].filter((index) => whitelist.has(Number(index))));
  }, [shutteredValidatorIndexes, whitelist]);

  const match = useMemo(() => {
    if (!filteredValidatorIndexes || !dutiesProposer) return null;
    return dutiesProposer.find((duty) => filteredValidatorIndexes.has(Number(duty.validator_index)));
  }, [dutiesProposer, filteredValidatorIndexes]);

  useEffect(() => {
    if (!dutiesProposer) return;

    const firstWhitelistedDuty = dutiesProposer.find((duty) => whitelist.has(Number(duty.validator_index)));

    if (firstWhitelistedDuty) {
      const lastNonWhitelistDuty = dutiesProposer
        .slice(0, dutiesProposer.indexOf(firstWhitelistedDuty))
        .reverse()
        .find((duty) => !whitelist.has(Number(duty.validator_index)));

      if (lastNonWhitelistDuty) {
        setLastNonWhitelistValidator(Number(lastNonWhitelistDuty.validator_index));
      }
    }
  }, [dutiesProposer, whitelist]);

  useEffect(() => {
    if (!dutiesProposer || !match) return;
    const interval = setInterval(() => {
      const currentSlot = getSlot(chain.genesisTime);
      const timeDifference = match ? (Number(match.slot) - currentSlot) * SLOT_TIME : 0;
      setTimeDifference(timeDifference);

      if (currentSlot >= Number(match?.slot)) {
        setTimeDifference(0);
        setCurrentEpoch((prev) => prev + 1);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dutiesProposer, match, chain.genesisTime]);

  const value = {
    whitelist,
    setWhitelist,
    shutteredValidatorIndexes,
    timeDifference,
    lastNonWhitelistValidator,
  };

  return (
    <ShutterValidatorsContext.Provider value={value}>
      {children}
    </ShutterValidatorsContext.Provider>
  );
};

export const useShutterValidators = () => {
  return useContext(ShutterValidatorsContext);
};
