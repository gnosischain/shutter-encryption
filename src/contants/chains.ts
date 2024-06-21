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
        address: '0xd073BD5A717Dce1832890f2Fdd9F4fBC4555e41A',
        // blockCreated: ,
      },
      keyperSetManager: {
        address: '0x7Fbc29C682f59f809583bFEE0fc50F1e4eb77774',
        // blockCreated: ,
      },
      keyBroadcast: {
        address: '0x1FD85EfeC5FC18f2f688f82489468222dfC36d6D',
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
  // ...gnosis,
];

export const CHAINS_MAP = CHAINS.reduce<ChainMap>((acc, chain) => {
  acc[chain.id] = chain;

  return acc;
}, {});
