import React, { Fragment } from "react";

import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { useConnect, useNetwork } from "wagmi";

import MetaMask from "../assets/images/MetaMaskFox.svg";
import WalletConnect from "../assets/images/walletconnect.png";
import { DEFAULT_CHAIN, SUPPORTED_CHAINS_IDS } from "../lib/consts";

const WALLET_IMGS: Record<string, StaticImageData> = {
  MetaMask: MetaMask,
  WalletConnect: WalletConnect,
};

type Props = {
  onClose: () => void;
  show: boolean;
};

export default function ConnectModal({ onClose, show }: Props) {
  const { connect, connectors } = useConnect()
  const {
    activeChain,
    chains,
    error,
    isLoading,
    pendingChainId,
    switchNetwork,
  } = useNetwork()

  const handleConnect = async (x: any) => {
    if (!window.ethereum) return;
    if (!SUPPORTED_CHAINS_IDS.includes(Number((window.ethereum as any).networkVersion))) {
      await (window.ethereum as any).request({
        method: "wallet_addwindow.ethereumChain",
        params: [{
          chainId: '0x' + DEFAULT_CHAIN.id.toString(16),
          rpcUrls: [DEFAULT_CHAIN.rpcUrls.default],
          chainName: DEFAULT_CHAIN.name,
          nativeCurrency: DEFAULT_CHAIN.nativeCurrency,
          blockExplorerUrls: [DEFAULT_CHAIN.blockExplorers?.default.url]
        }],
      });
    }
    if (SUPPORTED_CHAINS_IDS.includes(Number((window.ethereum as any).networkVersion))) {
      connect(x);
      onClose();
    }
  }
  return (
    <Transition show={show} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-40 inset-0 overflow-y-auto"
        onClose={onClose}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-slate-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle md:max-w-3xl sm:max-w-xl sm:w-full sm:p-6">
              <div className="mt-3 text-center sm:mt-0 sm:text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {connectors.map((x) => (
                    <button
                      key={x.id}
                      className="flex items-center justify-center flex-col hover:bg-slate-700 px-3 py-2 rounded-md"
                      onClick={() => {
                        handleConnect(x);
                      }}
                    >
                      <p className="md:text-xl sm:text-lg mb-2 text-slate-300">
                        {x.name}
                      </p>
                      <p className="text-slate-400 font-bold sm:text-sm text-xs mb-8">
                        Connect to {x.name}
                      </p>
                      {x.name && (
                        <img
                          src={
                            WALLET_IMGS[x.name as "MetaMask" | "WalletConnect"]
                              ?.src || ""
                          }
                          alt={x.name}
                          height={48}
                          width={48}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
