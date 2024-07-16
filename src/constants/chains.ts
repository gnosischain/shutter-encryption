import { gnosis, gnosisChiado, type Chain } from "wagmi/chains";
import { type Address } from "viem";

type Token = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  img: string;
};

type EnhancedChain = Chain & {
  img: string;
  contracts: Pick<Chain, "contracts"> & {
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
  address: "0x0000000000000000000000000000000000000000",
  name: "xDai",
  symbol: "xDai",
  decimals: 18,
  img: "/xdai.png",
};

export const CHAINS: EnhancedChain[] = [
  {
    ...gnosis,
    img: "/gnosisGreen.svg",
    contracts: {
      ...gnosis.contracts,
      sequencer: {
        address: "0xc5C4b277277A1A8401E0F039dfC49151bA64DC2E",
      },
      keyperSetManager: {
        address: "0x7C2337f9bFce19d8970661DA50dE8DD7d3D34abb",
      },
      keyBroadcast: {
        address: "0x626dB87f9a9aC47070016A50e802dd5974341301",
      },
      validatorRegistry: {
        address: "0xefCC23E71f6bA9B22C4D28F7588141d44496A6D6",
      },
    },

    blockExplorers: {
      default: {
        ...gnosis.blockExplorers.default,
        url: "https://gnosis.blockscout.com/",
      },
    },

    gbcUrl: "https://rpc-gbc.gnosischain.com",
    genesisTime: 1638993340,

    tokens: [
      nativeXDaiToken,
      {
        address: "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb",
        name: "GnosisBridged",
        symbol: "GNO",
        decimals: 18,
        img: "/gnosisGreen.svg",
      },
    ],
  },
  {
    ...gnosisChiado,
    img: "/gnosisGreen.svg",
    contracts: {
      ...gnosisChiado.contracts,
      sequencer: {
        address: "0xAC3209DCBced710Dc2612bD714b9EC947a6d1e8f",
        // blockCreated: ,
      },
      keyperSetManager: {
        address: "0x6759Ab83de6f7d5bc4cf02d41BbB3Bd1500712E1",
      },
      keyBroadcast: {
        address: "0xDd9Ea21f682a6484ac40D36c97Fa056Fbce9004f",
      },
      validatorRegistry: {
        address: "0x06BfddbEbe11f7eE8a39Fc7DC24498dE85C8afca",
      },
    },

    blockExplorers: {
      default: {
        ...gnosisChiado.blockExplorers.default,
        url: "https://gnosis-chiado.blockscout.com/",
      },
    },

    gbcUrl: "https://rpc-gbc.chiadochain.net",
    genesisTime: 1665396300,

    tokens: [
      nativeXDaiToken,
      {
        address: "0x19C653Da7c37c66208fbfbE8908A5051B57b4C70",
        name: "GnosisBridged",
        symbol: "GNO",
        decimals: 18,
        img: "/gnosisGreen.svg",
      },
    ],
  },
];

export const CHAINS_MAP = CHAINS.reduce<ChainMap>((acc, chain) => {
  acc[chain.id] = chain;

  return acc;
}, {});
