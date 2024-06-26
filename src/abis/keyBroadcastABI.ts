const keyBroadcastABI = [
  {
    inputs: [
      { internalType: "uint64", name: "eon", type: "uint64" },
      { internalType: "bytes", name: "key", type: "bytes" },
    ],
    name: "broadcastEonKey",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint64", name: "eon", type: "uint64" }],
    name: "getEonKey",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export default keyBroadcastABI;
