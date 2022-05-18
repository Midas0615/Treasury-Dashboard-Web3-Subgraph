import { BattleflyFounderVault, ERC721 } from "../generated/types";
import {
  chain,
  useContractRead as useContractReadWagmi,
  useContractWrite as useContractWriteWagmi,
  useNetwork,
  useAccount,
} from "wagmi";
import type { Contract } from "ethers";
import { ContractError, DashboardContract } from "./types";
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from "./consts";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

function useContractAddresses() {
  const {
    chains,
    activeChain
  } = useNetwork();
  const chainName = activeChain?.name;

  if (!chainName || !CONTRACT_ADDRESSES[chainName]) {
    return CONTRACT_ADDRESSES[chain.arbitrum.name];
  }

  return CONTRACT_ADDRESSES[chainName];
}

function useContractAddress(contract: DashboardContract) {
  const addresses = useContractAddresses();

  return addresses[contract] as string;
}

function useContractRead<T extends Contract>(
  contract: DashboardContract,
  functionName: string
) {
  const addressOrName = useContractAddress(contract);
  const result = useContractReadWagmi<T>(
    {
      addressOrName,
      contractInterface: CONTRACT_ABIS[contract],
    },
    functionName
  );

  return result;
}

function useContractWrite<T extends Contract>(
  contract: DashboardContract,
  functionName: string,
  args?: any | any[]
) {
  const addressOrName = useContractAddress(contract);
  const result = useContractWriteWagmi<T>(
    {
      addressOrName,
      contractInterface: CONTRACT_ABIS[contract],
    },
    functionName,
    { args }
  );

  const [{ error }] = result;

  useEffect(() => {
    if (error) {
      const contractError = error as ContractError;

      toast.error(contractError.data?.message ?? contractError.message);
    }
  }, [error]);

  return result;
}

export function useFoundersVaultApprove(vault: "V1" | "V2") {
  const foundersVaultAddress = useContractAddress(
    vault === "V1"
      ? DashboardContract.FounderVaultV1
      : DashboardContract.FounderVaultV2
  );

  return useContractWrite<ERC721>(
    DashboardContract.FounderNft,
    "setApprovalForAll",
    [foundersVaultAddress, true]
  );
}

export const useStakeFounderNfts = (vault: "V1" | "V2") =>
  useContractWrite<BattleflyFounderVault>(
    vault === "V1"
      ? DashboardContract.FounderVaultV1
      : DashboardContract.FounderVaultV2,
    "stakeFounderNFT"
  );

export function useApproveToStake(vault: "V1" | "V2") {
  const foundersVaultAddress = useContractAddress(
    vault === "V1"
      ? DashboardContract.FounderVaultV1
      : DashboardContract.FounderVaultV2
  );
  const [result, action] = useContractWrite<ERC721>(
    DashboardContract.FounderNft,
    "setApprovalForAll"
  );

  const send = useCallback(() => {
    action({ args: [foundersVaultAddress, true] });
  }, [action, foundersVaultAddress]);

  const isLoading = result.loading || result.loading;

  return [isLoading, send] as const;
}

export function useIsApprovedToStake(vault: "V1" | "V2") {
  const [isApproved, setIsApproved] = useState(false);
  const [{ data: accountData }] = useAccount();
  const address = accountData?.address;
  const foundersVaultAddress = useContractAddress(
    vault === "V1"
      ? DashboardContract.FounderVaultV1
      : DashboardContract.FounderVaultV2
  );

  const [, isApprovedForAll] = useContractRead(
    DashboardContract.FounderNft,
    "isApprovedForAll"
  );

  useEffect(() => {
    async function check() {
      if (address && foundersVaultAddress) {
        const { data } = await isApprovedForAll({
          args: [address, foundersVaultAddress],
        });

        setIsApproved(Boolean(data));
      }
    }

    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, foundersVaultAddress]);

  return isApproved;
}

export function useUnstakedFounderNfts(vault: "V1" | "V2") {
  const [tokens, setTokens] = useState<number[]>([]);
  const [types, setTypes] = useState<number[]>([]);
  const [{ data }] = useAccount();
  const address = data?.address;
  const [d, c] = useContractRead(DashboardContract.FounderNft, "balanceOf");

  useEffect(() => {
    if (address) {
      c({ args: [address] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const [, m] = useContractRead(
    DashboardContract.FounderNft,
    "tokenOfOwnerByIndex"
  );

  const [, e] = useContractRead(
    DashboardContract.FounderNft,
    "getSpecialNFTType"
  );

  const n = d.data?.toNumber() ?? 0;

  useEffect(() => {
    async function g() {
      if (n > 0) {
        setTokens(
          await Promise.all<number>(
            new Array(n)
              .fill("")
              .map((_, index) => index)
              .map(async (index) => {
                const { data } = await m({ args: [address, index] });

                return data?.toNumber();
              })
          )
        );
      }
    }
    g();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, n]);

  useEffect(() => {
    async function g() {
      if (tokens.length > 0) {
        setTypes(
          await Promise.all<number>(
            tokens.map(async (index) => {
              const { data } = await e({ args: [index] });

              return data?.toNumber();
            })
          )
        );
      }
    }
    g();
  }, [tokens, e]);

  return tokens.filter((_, index) => types[index] === TYPES[vault]);
}

const TYPES = {
  V1: 150,
  V2: 151
}
