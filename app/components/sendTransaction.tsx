import { computeData } from "@/actions/encryptTxNobleCurves";
import { Input } from "@headlessui/react";
import clsx from "clsx";
import * as React from "react";
import { Address } from "viem";
import { config } from "@/wagmi";
import { type BaseError, useSendTransaction, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { getPublicClient } from "wagmi/actions";
import keyperSetManagerABI from "@/utils/abis/keyperSetManager";
import keyBroadcastABI from "@/utils/abis/keyBroadcast";

const SEQUENCER = "0x854ce9415d1Ee1d95ACf7d0F2c718AaA9A5894aa";
const KEYPERSETMANAGER = "0x847efd7D3a8b4AF8226bc156c330002d1c06Cf75";
const KEYBROADCAST = "0x4c6A91Aff2C81df838437d104DA71369A6b4030e";
const tKeyperSetChangeLookAhead = BigInt(50);

interface SendTransactionProps {
  address: Address | undefined;
  chainId: number | undefined;
}

export function SendTransaction({ address, chainId }: SendTransactionProps) {
  const client = getPublicClient(config, { chainId: chainId as 100 | 10200 | undefined });
  const { data: hash, error, isPending, sendTransaction } = useSendTransaction();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const blockNumber = await client.getBlockNumber();
    const eon = await client.readContract({
      address: KEYPERSETMANAGER,
      abi: keyperSetManagerABI,
      functionName: "GetKeyperSetIndexByBlock",
      args: [blockNumber + tKeyperSetChangeLookAhead],
    });

    const eonKeyBytes = await client.readContract({
      address: KEYBROADCAST,
      abi: keyBroadcastABI,
      functionName: "getEonKey",
      args: [eon],
    });
    const data = formData.get("data") as `0x${string}`;
    if (address) {
      const encryptedTx = computeData(data, address, eonKeyBytes);
      sendTransaction({ to: SEQUENCER, data: encryptedTx });
    }
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return (
    <form onSubmit={submit}>
      <Input name="data" type="text" required placeholder="0xA0Cf…251e" className={clsx("mt-3 block w-full rounded-lg border-none bg-white/5 py-1.5 px-3 text-sm/6 text-white", "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25")} />
      <button disabled={isPending} type="submit">
        {isPending ? "Confirming..." : "Send"}
      </button>
      {hash && <div>Transaction Hash: {hash}</div>}
      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && <div>Transaction confirmed.</div>}
      {error && <div>Error: {(error as BaseError).shortMessage || error.message}</div>}
    </form>
  );
}
