import { useMemo } from 'react';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { useChainId } from 'wagmi';

import { CHAINS_MAP } from '@/constants/chains';

export const GraphQLProvider = ({ children }: { children: any }) => {
  const chainId = useChainId();

  const client = useMemo(() => {
    const chain = CHAINS_MAP[chainId];

    const link = new HttpLink({
      uri: chain.theGraphUrl,
    });

    return new ApolloClient({
      link: link,
      cache: new InMemoryCache(),
    });
  }, [chainId]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
