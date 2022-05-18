import { chain } from "wagmi";

import {
  BattleflyFounderVault__factory,
  ERC721__factory,
  AtlasMine__factory,
  ERC20__factory,
  SpecialNFTRouter__factory,
  UnknowPool__factory
} from "../generated/types";
import { ContractMap, DashboardContract } from "./types";

// Chains
export const SUPPORTED_CHAINS = [chain.arbitrum, chain.arbitrumRinkeby];
export const SUPPORTED_CHAINS_IDS = [chain.arbitrum.id, chain.arbitrumRinkeby.id];

export const DEFAULT_CHAIN = chain.arbitrumRinkeby;

// Contracts
export const CONTRACT_ADDRESSES: Record<string, ContractMap> = {
  [chain.arbitrumRinkeby.name]: {
    [DashboardContract.FounderNft]:
      "0x219600bd4a1250b14530e057a6ff682649818128",
    [DashboardContract.FounderVaultV1]:
      "0x7D449898b9dFA3449cA372717102b5D48e4B30d1",
    [DashboardContract.FounderVaultV2]:
      "0x8bf0F04227b7A8397aDdBF515959c166d7B99293",
    [DashboardContract.AtlasMine]:
      "0xA0A89db1C899c49F98E6326b764BAFcf167fC2CE",
      [DashboardContract.Magic]:
      "",
      [DashboardContract.SpecialNFTRouter]: "0x658ba454e7df85B9Be065e244713355Dd2B5C52c",
      [DashboardContract.UnknowPool]: "0x3563590e19d2b9216e7879d269a04ec67ed95a87"
  },
  [chain.arbitrum.name]: {
    [DashboardContract.FounderNft]:
      "0xc43104775bd9f6076808b5f8df6cbdbeac96d7de",
    [DashboardContract.FounderVaultV1]:
      "0x935e2aab89fcd2712c8409ce83814ca7853f7538",
    [DashboardContract.FounderVaultV2]:
      "0x935e2aab89fcd2712c8409ce83814ca7853f7538",
      [DashboardContract.AtlasMine]:
      "0xA0A89db1C899c49F98E6326b764BAFcf167fC2CE",
      [DashboardContract.Magic]:
      "0x539bdE0d7Dbd336b79148AA742883198BBF60342",
      [DashboardContract.SpecialNFTRouter]: "",
      [DashboardContract.UnknowPool]: "0x3563590e19d2b9216e7879d269a04ec67ed95a87"
  },
};

export const BRIDGEWORLD_GRAPH_URI = "https://api.thegraph.com/subgraphs/name/treasureproject/bridgeworld-next"
export const TREASURY_MARKETPLACE_GRAPH_URI = "https://api.thegraph.com/subgraphs/name/treasureproject/marketplace"
export const BATTLEFLY_ATLAS_STAKER_URI = "https://api.thegraph.com/hosted-service/subgraph/phungnm/battlefly-atlas-staker"
export const BATTLEFLY_VAULT_V1_URI = "https://api.thegraph.com/subgraphs/name/phungnm/battlefly-founder-vault-v1"
export const BATTLEFLY_VAULT_V2_URI = "https://api.thegraph.com/subgraphs/name/phungnm/battlefly-founder-vault-v2"



export const VAULT_METADATA_URL = "https://api.battlefly.game/specials"
export const VAULT_IDS = {
  [DashboardContract.FounderVaultV1]: 150,
  [DashboardContract.FounderVaultV2]: 151
} as any


export const BATTLEFLY_POOL = "0xf5411006eefd66c213d2fd2033a1d340458b7226"


export const CONTRACT_ABIS: Partial<ContractMap> = {
  [DashboardContract.FounderNft]: ERC721__factory.abi,
  [DashboardContract.FounderVaultV1]: BattleflyFounderVault__factory.abi,
  [DashboardContract.FounderVaultV2]: BattleflyFounderVault__factory.abi,
  [DashboardContract.AtlasMine]: AtlasMine__factory.abi,
  [DashboardContract.Magic]: ERC20__factory.abi,
  [DashboardContract.SpecialNFTRouter]: SpecialNFTRouter__factory.abi,
  [DashboardContract.UnknowPool]: UnknowPool__factory.abi
};
