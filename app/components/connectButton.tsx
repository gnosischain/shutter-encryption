"use client";

import { Button, Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { useState } from "react";
import { useAccount, useConnect } from "wagmi";

export default function ConnectButton() {
  const { connectors, connect, status, error } = useConnect();
  let [isOpen, setIsOpen] = useState(false);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      <Button onClick={open} className="rounded-md bg-black/20 py-2 px-4 text-sm font-medium text-white focus:outline-none data-[hover]:bg-black/30 data-[focus]:outline-1 data-[focus]:outline-white">
        Connect Wallet
      </Button>

      <Transition appear show={isOpen}>
        <Dialog as="div" className="relative z-10 focus:outline-none" onClose={close}>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0 transform-[scale(95%)]" enterTo="opacity-100 transform-[scale(100%)]" leave="ease-in duration-200" leaveFrom="opacity-100 transform-[scale(100%)]" leaveTo="opacity-0 transform-[scale(95%)]">
                
                <DialogPanel className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl">
                  <DialogTitle as="h3" className="text-base/7 font-medium text-white">
                    Connect your wallet
                  </DialogTitle>
                  <div className="w-full flex flex-col divide-white-900 divide-y mt-8">
                  {connectors.map((connector) => (
                    <div className="flex w-full justify-between items-center text-white py-4 p-2" key={connector.uid} onClick={() => connect({ connector })}>
                      {connector.name}
                    </div>
                  ))}
                </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
