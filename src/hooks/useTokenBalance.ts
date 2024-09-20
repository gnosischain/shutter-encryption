import { type Address, erc20Abi, formatUnits } from 'viem';
import { useReadContracts, useBalance, useAccount } from 'wagmi';

import { nativeXDaiToken } from '@/constants/chains';

interface UseTokenBalanceProps {
  tokenAddress: Address;
  enabled: boolean;
  chainId: number;
}

export const useTokenBalance = ({ tokenAddress, enabled, chainId }: UseTokenBalanceProps) => {
  const isNativeXDai = tokenAddress === nativeXDaiToken.address;

  const { address } = useAccount();

  const { data: [tokenBalance, tokenDecimals, tokenSymbol] = [], ...tokenRest } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        // @ts-expect-error - disabled query if address is not defined
        args: [address],
        chainId,
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'decimals',
        chainId,
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'symbol',
        chainId,
      },
    ],
    query: {
      enabled: enabled && !isNativeXDai && Boolean(address),
    },
  });

  const { data: ethData, ...ethRest } = useBalance({
    address,
    chainId,
    query: {
      enabled: enabled && isNativeXDai && Boolean(address),
    },
  });

  const { balance, decimals, symbol, ...rest } = {
    balance: tokenBalance ?? ethData?.value,
    decimals: tokenDecimals ?? ethData?.decimals,
    symbol: tokenSymbol ?? ethData?.symbol,
    ...(tokenRest ?? ethRest),
  };

  return {
    balance:
      balance && decimals && symbol
        ? {
            value: balance,
            formatted: formatUnits(balance, decimals),
            decimals,
            symbol,
          }
        : null,
    ...rest,
  };
};
