import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { createSelectors } from './createSelectors';

type State = {
  validatorIndexes: number[],
  lastBlockNumber: number,

  _hasHydrated: boolean,
};

type Action = {
  setValidatorIndexes: (validatorIndexes: number[]) => void,
  addValidatorIndex: (validatorIndex: number) => void,
  removeValidatorIndex: (validatorIndex: number) => void,
  setLastBlockNumber: (lastBlockNumber: number) => void,

  setHasHydrated: (state: boolean) => void,
};

const useValidatorIndexesStoreBase = create<State & Action>()(
  persist(
    (set) => ({
      validatorIndexes: [],
      lastBlockNumber: 0,

      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setValidatorIndexes: (validatorIndexes) => set({ validatorIndexes }),
      addValidatorIndex: (validatorIndex) => set((state) => {
        state.validatorIndexes.push(validatorIndex);

        return { validatorIndexes: state.validatorIndexes };
      }),
      removeValidatorIndex: (validatorIndex) => set((state) => {
        return { validatorIndexes: state.validatorIndexes.filter((index) => index !== validatorIndex) };
      }),
      setLastBlockNumber: (lastBlockNumber) => set({ lastBlockNumber }),
    }),
    {
      name: 'validator-indexes-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => window.localStorage), // (optional) by default, 'localStorage' is used

      onRehydrateStorage: () => {
        console.log('hydration starts')

        return (state, error) => {
          console.log({ state });
          if (error) {
            console.log('an error happened during hydration', error)
          } else {
            state?.setHasHydrated(true);

            console.log('hydration finished')
          }
        }
      },
    },
  ),
);

export const useValidatorIndexesStore = createSelectors(useValidatorIndexesStoreBase);
