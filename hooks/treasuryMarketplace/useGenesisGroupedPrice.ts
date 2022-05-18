import { useQuery } from "react-query";
import {gql} from "@apollo/client";
import { apolloTreasuryMarketplaceClient, apolloBridgeWorldClient } from "../../lib/graphql";
import { ethers } from "ethers";


const genesisListingQuery = gql`query MyQuery {
  listings(
    first: 1000
    where: {collection_in: ["0xfe8c1ac365ba6780aec5a985d989b327c27670a1-0" "0xfe8c1ac365ba6780aec5a985d989b327c27670a1-1" "0xfe8c1ac365ba6780aec5a985d989b327c27670a1-2"], status: Active}
  ) {
    pricePerItem
    token {
      tokenId
    }
  }
}`

const fetchGenesisGroupedPrice = async () => {
  try {
    const groupedPrice = {} as Record<string, any>
    const res = await apolloTreasuryMarketplaceClient.query({query: genesisListingQuery, fetchPolicy: 'network-only'});
    const genesisListings = {} as Record<string, any>;
    for (let i = 0; i < res.data.listings.length; i++) {
      const listing = res.data.listings[i]
      genesisListings[listing.token.tokenId] = listing;
    }
    const tokenIds = Object.keys(genesisListings)

    const query = gql`query MyQuery {
      tokens(
        first: 1000
        where: {tokenId_in: ${JSON.stringify(tokenIds)}
        category: Legion}
      ) {
        name
        metadata {
          ... on LegionInfo {
            id
            role
          }
        }
        tokenId
      }
    }`

    const res2 = await apolloBridgeWorldClient.query({query, fetchPolicy: 'network-only'});
    const genesisInfos = res2.data.tokens;
    genesisInfos.forEach((genesis: any) => {
      const genesisName = `${genesis.name} ${genesis.metadata.role}`;
      const genesisPrice = Number(ethers.utils.formatUnits(genesisListings[genesis.tokenId].pricePerItem, 18))
      groupedPrice[genesisName] = groupedPrice[genesisName] < genesisPrice ? groupedPrice[genesisName] : genesisPrice
    });
    return groupedPrice
  } catch (_) {
    console.log(_)
    return undefined
  }
};

export const useGenesisGroupedPrice = () =>
  useQuery('useGenesisGroupedPrice', () => fetchGenesisGroupedPrice(), {
    refetchInterval: 12000,
  });
