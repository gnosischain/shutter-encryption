import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { CHAINS } from '@/constants/chains';
import { createSelectors } from './createSelectors';

type State = {
  [key: number]: {
    validatorIndexes: number[];
    lastBlockNumber: number;
  };

  _hasHydrated: boolean;
};

type Action = {
  setValidatorIndexes: (validatorIndexes: number[], chainId: number) => void;
  addValidatorIndex: (validatorIndex: number, chainId: number) => void;
  removeValidatorIndex: (validatorIndex: number, chainId: number) => void;
  setLastBlockNumber: (lastBlockNumber: number, chainId: number) => void;

  setHasHydrated: (state: boolean) => void;
};

const useValidatorIndexesStoreBase = create<State & Action>()(
  persist(
    (set) => ({
      [CHAINS[0].id]: {
        validatorIndexes: [],
        lastBlockNumber: 0,
      },
      [CHAINS[1].id]: {
        validatorIndexes: [],
        lastBlockNumber: 0,
      },

      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setValidatorIndexes: (validatorIndexes, chainId) =>
        set((state) => {
          return {
            [chainId]: {
              validatorIndexes: validatorIndexes,
              lastBlockNumber: state[chainId].lastBlockNumber,
            },
          };
        }),
      addValidatorIndex: (validatorIndex, chainId) =>
        set((state) => {
          return {
            [chainId]: {
              validatorIndexes: [...state[chainId].validatorIndexes, validatorIndex],
              lastBlockNumber: state[chainId].lastBlockNumber,
            },
          };
        }),
      removeValidatorIndex: (validatorIndex, chainId) =>
        set((state) => {
          return {
            [chainId]: {
              validatorIndexes: state[chainId].validatorIndexes.filter(
                (index) => index !== validatorIndex,
              ),
              lastBlockNumber: state[chainId].lastBlockNumber,
            },
          };
        }),
      setLastBlockNumber: (lastBlockNumber, chainId: string) =>
        set((state) => {
          return {
            [chainId]: {
              validatorIndexes: state[chainId].validatorIndexes,
              lastBlockNumber: lastBlockNumber,
            },
          };
        }),
    }),
    {
      name: 'validator-indexes-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => window.localStorage), // (optional) by default, 'localStorage' is used

      onRehydrateStorage: () => {
        console.log('hydration starts');

        return (state, error) => {
          console.debug({ state });
          if (error) {
            console.log('an error happened during hydration', error);
          } else {
            state?.setHasHydrated(true);

            console.log('hydration finished');
          }
        };
      },
    },
  ),
);

export const useValidatorIndexesStore = createSelectors(useValidatorIndexesStoreBase);
