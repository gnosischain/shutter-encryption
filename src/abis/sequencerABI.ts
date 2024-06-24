const sequencerABI = [
  {
    inputs: [
      {
        name: "eon",
        type: "uint64",
      },
      {
        name: "identityPrefix",
        type: "bytes32",
      },
      {
        name: "encryptedTransaction",
        type: "bytes",
      },
      {
        name: "gasLimit",
        type: "uint256",
      },
    ],
    name: "submitEncryptedTransaction",
    outputs: [],
    type: "function",
  },
] as const;

export default sequencerABI;
