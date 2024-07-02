import { useCallback, useMemo } from "react";
import {
  useReadContract,
  useChainId,
  useBlockNumber,
  useAccount,
  useWriteContract,
} from "wagmi";
import { type SignTransactionReturnType, type Hex, parseEther } from "viem";

import keyBroadcastABI from "@/abis/keyBroadcastABI";
import keyperSetManagerABI from "@/abis/keyperSetManagerABI";
import sequencerABI from "@/abis/sequencerABI";
import { CHAINS_MAP } from "@/constants/chains";
import { encryptData } from "@/services/shutter/encryptDataBlst";

const tKeyperSetChangeLookAhead = 4;

function randomBytes(size: number) {
  const array = new Uint8Array(size);
  window.crypto.getRandomValues(array);

  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

export const useShutterEncryption = () => {
  const { data: blockNumber } = useBlockNumber();
  const chainId = useChainId();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const chain = useMemo(() => CHAINS_MAP[chainId], [chainId]);

  const { data: eon, ...eonRest } = useReadContract({
    address: chain.contracts.keyperSetManager.address,
    abi: keyperSetManagerABI,
    functionName: "getKeyperSetIndexByBlock",
    // @ts-expect-error - disabled query if address is not defined
    args: [Number(blockNumber) + tKeyperSetChangeLookAhead],
    query: {
      enabled: Boolean(blockNumber),
    },
  });

  const { data: eonKeyBytes, ...eonKeyBytesRest } = useReadContract({
    address: chain.contracts.keyBroadcast.address,
    abi: keyBroadcastABI,
    functionName: "getEonKey",
    // @ts-expect-error - disabled query if eon is not defined
    args: [eon],
    query: {
      enabled: Boolean(eon),
    },
  });

  const encryptTx = useCallback(
    async (signedTx: SignTransactionReturnType) => {
      if (!eonKeyBytes) return;

      const randomHex = randomBytes(12);
      const identityPrefixHex = (address +
        randomHex +
        address?.slice(2)) as Hex;

      const sigmaHex = (address + randomHex) as Hex;

      console.log({
        signedTx,
        identityPrefixHex,
        eonKeyBytes,
        randomHex,
        sigmaHex,
      });

      const encryptedTx = await encryptData(
        signedTx,
        identityPrefixHex,
        eonKeyBytes,
        sigmaHex
      );

      return { identityPrefixHex: sigmaHex, encryptedTx };
    },
    [eonKeyBytes, address]
  );

  const submitTransactionToSequencer = useCallback(
    async (encryptionParams?: { identityPrefixHex: Hex; encryptedTx: Hex }) => {
      if (!encryptionParams) return;

      const { identityPrefixHex, encryptedTx } = encryptionParams;

      return await writeContractAsync({
        address: chain.contracts.sequencer.address,
        abi: sequencerABI,
        functionName: "submitEncryptedTransaction",
        args: [eon, identityPrefixHex, encryptedTx, 210000],
        value: parseEther("210000", "gwei"),
        gasPrice: 210000n,
      });
    },
    [chain, eon]
  );

  return {
    encryptTx,
    submitTransactionToSequencer,
    isLoading: eonRest.isLoading || eonKeyBytesRest.isLoading,
  };
};
