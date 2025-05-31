"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain, http } from "viem";
import { Provider as ChakraProvider } from '@/components/ui/provider'
import { CacheProvider } from '@chakra-ui/next-js'
import { Toaster } from "@/components/ui/toaster";

export const monad = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'Monad', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet-rpc2.monad.xyz/52227f026fa8fac9e2014c58fbf5643369b3bfc6'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://testnet.monadexplorer.com/' },
  },
  contracts: {
    multicall3: {
      address: '0x6cEfcd4DCA776FFaBF6E244616ea573e4d646566'
    },
  },
})

const config = getDefaultConfig({
  appName: 'Rug Rumble',
  projectId: 'fdf5c6b39eaaac790985c3d3eefe7dab',
  chains: [monad],
  transports: {
    [monad.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet-rpc2.monad.xyz/52227f026fa8fac9e2014c58fbf5643369b3bfc6'),
  },
});

type Props = {
  children: React.ReactNode;
};

export function Providers({ children }: Props) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: "always",
        refetchOnReconnect: "always",
        refetchOnMount: "always",
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <CacheProvider>
        <ChakraProvider>
          <WagmiProvider config={config}>
            <RainbowKitProvider>
              {children}
              <Toaster />
            </RainbowKitProvider>
          </WagmiProvider>
        </ChakraProvider>
      </CacheProvider>
    </QueryClientProvider>
  );
}
