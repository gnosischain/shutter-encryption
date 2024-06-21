import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { gnosisChiado } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import config from '@/contants/config';

const queryClient = new QueryClient();

const projectId = config.walletConnectProjectId;

const metadata = {
  name: 'Gnosis-Shutter',
  description: 'Gnosis Shutter',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [gnosisChiado] as const;
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

createWeb3Modal({
  wagmiConfig,
  projectId,
});

export function Web3ModalProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
