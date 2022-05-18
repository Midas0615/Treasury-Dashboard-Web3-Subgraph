import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import {
  BRIDGEWORLD_GRAPH_URI,
  TREASURY_MARKETPLACE_GRAPH_URI,
  BATTLEFLY_ATLAS_STAKER_URI,
  BATTLEFLY_VAULT_V1_URI,
  BATTLEFLY_VAULT_V2_URI
} from "./consts";
import { DashboardContract } from "./types";

export const apolloBridgeWorldClient = new ApolloClient({
  uri: BRIDGEWORLD_GRAPH_URI,
  cache: new InMemoryCache(),
});

export const apolloTreasuryMarketplaceClient = new ApolloClient({
  uri: TREASURY_MARKETPLACE_GRAPH_URI,
  cache: new InMemoryCache(),
});

export const apolloPartnerClient = new ApolloClient({
  uri: TREASURY_MARKETPLACE_GRAPH_URI,
  cache: new InMemoryCache(),
});

export const aplBattleflyAtlasStaker = new ApolloClient({
  uri: BATTLEFLY_ATLAS_STAKER_URI,
  cache: new InMemoryCache(),
});

const battleflyVaultV1AplCl = new ApolloClient({
  uri: BATTLEFLY_VAULT_V1_URI,
  cache: new InMemoryCache(),
});

const battleflyVaultV2AplCl = new ApolloClient({
  uri: BATTLEFLY_VAULT_V2_URI,
  cache: new InMemoryCache()
});

export const battleflyVaultClients = {
  [DashboardContract.FounderVaultV1]: battleflyVaultV1AplCl,
  [DashboardContract.FounderVaultV2]: battleflyVaultV2AplCl
} as any