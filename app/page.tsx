"use client";

import { useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import ConnectButton from "./components/connectButton";
import { SendTransaction } from "./components/sendTransaction";
import { testEncrypt } from "@/actions/encryptTxNobleCurves";

export default function Home() {
  const account = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const test = async () => {
      const testTx = await testEncrypt();
      console.log(testTx);
    };
    test();
  }, []);

  console.log(account.status);

  return (
    <main className="flex h-screen bg-stone-900 flex-col items-center p-12">
      {account.status == "connected" ? (
        <button
          onClick={() => {
            disconnect();
          }}
        >
          Disconnect
        </button>
      ) : (
        <ConnectButton />
      )}
      <div className="flex flex-col items-center mt-4 text-nowrap">
        <p className="mr-2">Paste your transaction in here:</p>
        <SendTransaction address={account.address} chainId={account.chainId} />
      </div>
    </main>
  );
}
