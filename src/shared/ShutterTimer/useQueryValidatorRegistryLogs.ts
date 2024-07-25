import { useState, useEffect } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_UPDATES } from './ValidatorRegistryQL';

// finish logic for dynamic fetching
// use cache persistent
// deploy another graph for mainnet
// todo wip
export const useQueryValidatorRegistryLogs = () => {
  const [getUpdates, { loading, data }] = useLazyQuery(GET_UPDATES);
  const [logs, setLogs] = useState();

  useEffect(() => {
    const fetchAllLogs = async (): Promise<any[]> => {
      let allLogs = [];
      let skip = 0;
      const first = 1000; // Adjust based on the rate limits or performance considerations

      while (true) {
        const response = await getUpdates({
          variables: { first, skip },
          // fetchPolicy: 'network-only'  // Ensures data is fetched from the network not the cache
        });
        console.log({ response });

        const logs = response.data.updateds;
        allLogs = allLogs.concat(logs);

        if (logs.length < first) {
          break; // Break the loop if the number of logs fetched is less than 'first', indicating the end of data
        }

        skip += first; // Increment skip by 'first' for the next page
      }

      console.log({ allLogs });
      setLogs(allLogs);
    }

    fetchAllLogs();
  }, []);
}