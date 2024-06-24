import { gnosisChiado, type Chain } from 'wagmi/chains';

type Token = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  img: string;
};

type EnhancedChain = Chain & {
  img: string;
  contracts: Pick<Chain, 'contracts'>;
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
        address: '0x5a6af25e3cc5eB6c146cb4d7D00148Dd59ad58f1',
        // blockCreated: ,
      },
      keyperSetManager: {
        address: '0x6759Ab83de6f7d5bc4cf02d41BbB3Bd1500712E1',
        // blockCreated: ,
      },
      keyBroadcast: {
        address: '0xDd9Ea21f682a6484ac40D36c97Fa056Fbce9004f',
        // blockCreated: ,
      },
    },

    tokens: [
      nativeXDaiToken,
      {
        address: '0x19C653Da7c37c66208fbfbE8908A5051B57b4C70',
        name: 'GnosisBridged',
        symbol: 'GNO',
        decimals: 18,
        img: '/xdai.png'
      },
    ]
  },
  // {
  //   ...gnosis,
  //   img: '/gnosis.svg',
  //   tokens: [
  //     nativeXDaiToken,
  //   ]
  // },
];

export const CHAINS_MAP = CHAINS.reduce<ChainMap>((acc, chain) => {
  acc[chain.id] = chain;

  return acc;
}, {});
