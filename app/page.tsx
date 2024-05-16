"use client";

import { useAccount, useDisconnect } from "wagmi";
import ConnectButton from "./components/connectButton";

export default function Home() {
  const account = useAccount();
  const { disconnect } = useDisconnect();

  console.log(account.status);

  return (
    <main className="flex min-h-screen flex-col items-center p-12">
      {account.status == "connected" ? <button onClick={() => {disconnect()}}>Disconnect</button> : <ConnectButton />}
      Paste your transaction in here.
    </main>
  );
}
