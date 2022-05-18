import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useEnsName, useNetwork } from "wagmi";
import ConnectModal from "./ConnectModal";
import logo from "../assets/images/butterfly.png";
import circular from "../assets/images/circular.svg";
import rainbow from "../assets/images/rainbow.svg";

import Link from "next/link";
import { useRouter } from "next/router";
import { shortenAddress } from "../lib/utils";
import { DEFAULT_CHAIN, SUPPORTED_CHAINS_IDS } from "../lib/consts";

const MENU_ITEMS = [
  {
    href: "/",
    title: "Treasury",
  },
  {
    href: "/vaults",
    title: "Vaults",
  },
  // {
  //   href: "/partners",
  //   title: "Partners",
  // },
];
export default function Sidebar() {
  const [isOpenWalletModal, setIsOpenWalletModal] = useState(false);
  const [isOpenMenu, setIsOpenMenu] = useState(false);

  const { data: accountData } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName()
  const { pathname } = useRouter();
  const {
    activeChain,
    chains,
    error,
    isLoading,
    pendingChainId,
    switchNetwork,
  } = useNetwork();

  useEffect(() => {
    if (!activeChain || !accountData?.address) return
    if(!SUPPORTED_CHAINS_IDS.includes(activeChain?.id)) {
      disconnect();
    }
  }, [accountData?.address, activeChain, disconnect])

  useEffect(() => {
    if (!window.ethereum) return;
    if (!SUPPORTED_CHAINS_IDS.includes(Number((window.ethereum as any).networkVersion))) {
      (window.ethereum as any).request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: '0x' + DEFAULT_CHAIN.id.toString(16),
          rpcUrls: [DEFAULT_CHAIN.rpcUrls.default],
          chainName: DEFAULT_CHAIN.name,
          nativeCurrency: DEFAULT_CHAIN.nativeCurrency,
          blockExplorerUrls: [DEFAULT_CHAIN.blockExplorers?.default.url]
        }],
      });
    }
  }, [])

  return (
    <>
      <aside className="bg-black w-full lg:w-56 lg:border-r-4 border-7B61FF flex flex-col  md:h-screen">
        <div className="container flex flex-wrap justify-between items-center mx-auto p-3">
          <img src={logo.src} alt="logo" />
          <label className={`md:hidden btn btn-circle swap swap-rotate ${isOpenMenu ? 'bg-[#7B61FF] hover:bg-[#7B61FF]' : ''}`}>
            <input onChange={() => { setIsOpenMenu(!isOpenMenu)}} checked={isOpenMenu} type="checkbox"/>
            <svg className="swap-off fill-white" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512"><path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z"/></svg>
            <svg className="swap-on fill-white" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512"><polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49"/></svg>
          </label>
          {/* <button  type="button" className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu" aria-expanded="false">
            <span className="sr-only">Open main menu</span>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
            <svg className="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button> */}
        </div>

        <div className={`${isOpenMenu ? "" : "hidden"} md:block`}>
          <nav className="md:mt-10  mx-6">
            <ul>
              {MENU_ITEMS.map(({ href, title }) => (
                <li key={title}>
                  <Link href={href} passHref>
                    <a
                      className={`px-6 py-3 flex items-center w-full text-xl text-white hover:text-green-300 ${
                        pathname === href && "border-2 border-019380 rounded-md"
                      }`}
                    >
                      {title}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className={`${isOpenMenu ? "" : "hidden"} md:flex flex-1 flex-col justify-end mb-7 px-4 mt-4`}>
            {/* {accountData ? (
              <>
                <button className="text-base font-bold bg-[#7B61FF] rounded-[5px] w-full py-3 text-white">
                  Buy Magic
                </button>
                <button className="btn-lp text-sm font-bold w-full py-3 text-white mt-2 flex items-center justify-center">
                  <img src={circular.src} alt="" />
                  <span className="ml-3">0.9956 Nectar</span>
                </button>
                <hr className="my-5" />
              </>
            ) : null} */}

            {accountData ? (
              <button
                onClick={() => {
                  disconnect();
                }}
                className="btn-lp text-sm font-bold w-full py-3 text-white flex items-center justify-start px-4"
              >
                <img src={rainbow.src} alt="" />
                <span className="ml-3">
                  {ensName ?? shortenAddress(accountData.address || '')}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsOpenWalletModal(true)}
                className="btn-lp text-sm font-bold w-full py-3 text-white flex items-center justify-start px-4"
              >
                <img src={rainbow.src} alt="" />
                <span className="ml-3">Connect Your Wallet</span>
              </button>
            )}
          </div>
      </aside>
      <ConnectModal
        onClose={() => setIsOpenWalletModal(false)}
        show={isOpenWalletModal}
      />
    </>
  );
}
