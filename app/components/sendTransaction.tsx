import { Input } from "@headlessui/react";
import clsx from "clsx";
import * as React from "react";
import { type BaseError, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";

const SEQUENCER = "0x854ce9415d1Ee1d95ACf7d0F2c718AaA9A5894aa";

export function SendTransaction() {
  const { data: hash, error, isPending, sendTransaction } = useSendTransaction();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = formData.get("data") as `0x${string}`;
    sendTransaction({ to: SEQUENCER, data });
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
