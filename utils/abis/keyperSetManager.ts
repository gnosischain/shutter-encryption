const keyperSetManagerABI = [
  {
    inputs: [
      {
        internalType: "uint64",
        name: "block",
        type: "uint64",
      },
    ],
    name: "getKeyperSetIndexByBlock",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export default keyperSetManagerABI;
