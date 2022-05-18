import "../styles/tailwind.css";
import "react-toastify/dist/ReactToastify.css";

import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import { ReactQueryDevtools } from "react-query/devtools";
import Sidebar from "../components/Sidebar";
import { providers } from "ethers";
import { Connector, Provider, chain, createClient } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { DEFAULT_CHAIN, SUPPORTED_CHAINS } from "../lib/consts";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const connectors = [
  new InjectedConnector({
    chains: SUPPORTED_CHAINS,
    options: { shimDisconnect: true },
  }),
  new WalletConnectConnector({
    chains: SUPPORTED_CHAINS,
    options: {
      rpc: {
        [chain.arbitrumRinkeby.id]:
          "https://arb-rinkeby.g.alchemy.com/v2/PDUCdHLoNrdDJwgVvCNPTx7MrHuQ0uBg",
      },
      qrcode: true,
    },
  }),
];

const isChainSupported = (chainId?: number) =>
  SUPPORTED_CHAINS.some((x) => x.id === chainId);

const provider = ({ chainId }: { chainId?: number; connector?: Connector }) =>
  new providers.AlchemyProvider(
    isChainSupported(chainId) ? chainId : DEFAULT_CHAIN.id,
    process.env.NEXT_PUBLIC_ALCHEMY_KEY
  );
const client = createClient({
  autoConnect: true,
  connectors,
  provider,
})

function Main({ pageProps, Component }: AppProps) {
  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <>
      <div className="min-h-screen flex flex-col bg-black text-white relative">
        <div className="flex flex-col lg:flex-row flex-1">
          <Sidebar />
          <main className="flex-1  md:h-screen overflow-auto">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <>
      <ToastContainer />
      <Provider
        client={client}
      >
        <QueryClientProvider client={queryClient}>
          <Main {...props} />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </Provider>
    </>
  );
}
