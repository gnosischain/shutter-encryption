import { gnosisChiado, type Chain } from 'wagmi/chains';
import { type Address } from 'viem';

type Token = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  img: string;
};

type EnhancedChain = Chain & {
  img: string;
  contracts: Pick<Chain, 'contracts'> & {
    sequencer: {
      address: Address;
      blockCreated?: number;
    };
    keyperSetManager: {
      address: Address;
      blockCreated?: number;
    };
    keyBroadcast: {
      address: Address;
      blockCreated?: number;
    };
    validatorRegistry: {
      address: Address;
      blockCreated?: number;
    };
  };
  gbcUrl: string;
  genesisTime: number;
  tokens: Token[];
};

type ChainMap = {
  [key: number]: EnhancedChain;
};

export const nativeXDaiToken: Token = {
  address: '0x0000000000000000000000000000000000000000',
  name: 'xDai',
  symbol: 'xDai',
  decimals: 18,
  img: '/gnosis.svg',
};

export const CHAINS: EnhancedChain[] = [
  {
    ...gnosisChiado,
    img: '/gnosis.svg',
    contracts: {
      ...gnosisChiado.contracts,
      sequencer: {
        address: '0xAC3209DCBced710Dc2612bD714b9EC947a6d1e8f',
        // blockCreated: ,
      },
      keyperSetManager: {
        address: '0x6759Ab83de6f7d5bc4cf02d41BbB3Bd1500712E1',
      },
      keyBroadcast: {
        address: '0xDd9Ea21f682a6484ac40D36c97Fa056Fbce9004f',
      },
      validatorRegistry: {
        address: '0x06BfddbEbe11f7eE8a39Fc7DC24498dE85C8afca',
      }
    },

    blockExplorers: {
      default: {
        ...gnosisChiado.blockExplorers.default,
        url: 'https://gnosis-chiado.blockscout.com/',
      },
    },

    gbcUrl: 'https://rpc-gbc.chiadochain.net',
    genesisTime: 1665396300,

    tokens: [
      nativeXDaiToken,
      {
        address: '0x19C653Da7c37c66208fbfbE8908A5051B57b4C70',
        name: 'GnosisBridged',
        symbol: 'GNO',
        decimals: 18,
        img: '/xdai.png',
      },
    ],
  },
  // {
  //   ...gnosis,
  //   img: '/gnosis.svg',
  //   gbcUrl: 'https://rpc-gbc.gnosischain.com',
  //   genesisTime: 1638993340,
  //   tokens: [
  //     nativeXDaiToken,
  //   ]
  // },
];

export const CHAINS_MAP = CHAINS.reduce<ChainMap>((acc, chain) => {
  acc[chain.id] = chain;

  return acc;
}, {});
