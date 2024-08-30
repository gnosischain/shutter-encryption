import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { gnosis, gnosisChiado } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import config from '@/constants/config';
import { Web3Modal } from '@web3modal/wagmi';

const BRAWE_WALLET_ID = '163d2cf19babf05eb8962e9748f9ebe613ed52ebf9c8107c9a0f104bfcf161b3';

const queryClient = new QueryClient();

const projectId = config.walletConnectProjectId;

const chains = [gnosisChiado, gnosis] as const;
export const wagmiConfig = createConfig({
  chains,
  transports: {
    [gnosis.id]: http(),
    [gnosisChiado.id]: http(),
  },
});

export const modal: Web3Modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  featuredWalletIds: [BRAWE_WALLET_ID],
  includeWalletIds: [BRAWE_WALLET_ID],
  themeVariables: {
    '--w3m-accent': '#f37e4b',
  },
});

export function Web3ModalProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
