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

      // TODO delete test data
      // const randomHex = randomBytes(12);
      const randomHex = "35dd1a46c48a8aa165359ceb";
      const identityPrefixHex = (address +
        randomHex +
        address?.slice(2)) as Hex;

      const sigmHex = (address + randomHex) as Hex;

      const eonKeyBytes1 =
        "0x8a70247b414a44d0f08ec1d08484e1192fe68f7e08c3f4f1bf6acefa668de84004e3ed5f6dc8b66087b177fcd0a20a6a16430893464a8d69666c6f28c7b4d1da67b2e09a2b64d719b6b61459feb38e7d8bb13da435845b35fb89f7bbe878e2fa";

      console.log({ signedTx, identityPrefixHex, eonKeyBytes1, randomHex });

      const encryptedTx = await encryptData(
        signedTx,
        identityPrefixHex,
        eonKeyBytes1,
        sigmHex
      );

      return { identityPrefixHex, encryptedTx };
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
