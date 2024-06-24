// import { computeData } from "@/actions/encryptTxNobleCurves";
import { Input } from "@headlessui/react";
import clsx from "clsx";
import { Address, parseEther } from "viem";
import { config } from "@/wagmi";
import { type BaseError, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { getPublicClient } from "wagmi/actions";
import keyperSetManagerABI from "@/utils/abis/keyperSetManager";
import keyBroadcastABI from "@/utils/abis/keyBroadcast";
import sequencerABI from "@/utils/abis/sequencer";
import { randomBytes } from "crypto";
import { runEncryptData, runTests } from "@/shutter/testEncryption";
// import { prepareAndSignTransaction } from "@/actions/createRawTx";
// import { encryptData } from "@/actions/encryptTxNobleCurvesFullBlst";

const SEQUENCER = "0x5a6af25e3cc5eB6c146cb4d7D00148Dd59ad58f1";
const KEYPERSETMANAGER = "0x6759Ab83de6f7d5bc4cf02d41BbB3Bd1500712E1";
const KEYBROADCAST = "0xDd9Ea21f682a6484ac40D36c97Fa056Fbce9004f";
const tKeyperSetChangeLookAhead = BigInt(4);

interface SendTransactionProps {
  address: Address | undefined;
  chainId: number | undefined;
}

declare global {
  interface Window {
    blst: any;
  }
}

export function SendTransaction({ address, chainId }: SendTransactionProps) {
  const client = getPublicClient(config, {
    chainId: chainId as 100 | 10200 | undefined,
  });
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  // const data = prepareAndSignTransaction();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const blockNumber = await client.getBlockNumber();
    const eon = await client.readContract({
      address: KEYPERSETMANAGER,
      abi: keyperSetManagerABI,
      functionName: "getKeyperSetIndexByBlock",
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
      const randomBytesBuffer = randomBytes(12);
      const randomHex = randomBytesBuffer.toString("hex");
      const identityPrefixHex = address + randomHex;
      const encryptedTx = await runEncryptData(data, identityPrefixHex as `0x{string}`, eonKeyBytes, identityPrefixHex as `0x{string}`);
      console.log(eon, identityPrefixHex, encryptedTx, eonKeyBytes);
      writeContract({
        address: SEQUENCER,
        abi: sequencerABI,
        functionName: "submitEncryptedTransaction",
        args: [eon, identityPrefixHex, encryptedTx, 210000],
        value: parseEther("210000", "gwei"),
      });
    }
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const testEncryption = async () => {
    if (!window.blst) {
      console.log("blst not loaded");
      return;
    }
    runTests();
  };

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
      <div>
        <button className="rounded-md bg-black/20 border border-white text-white py-2 px-4 text-sm m-4" onClick={testEncryption} type="button">
          Test encryption
        </button>
      </div>
    </form>
  );
}
