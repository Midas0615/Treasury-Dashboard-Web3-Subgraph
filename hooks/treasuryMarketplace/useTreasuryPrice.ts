import { useQuery } from "react-query";
import {gql} from "@apollo/client";
import { apolloTreasuryMarketplaceClient, apolloBridgeWorldClient } from "../../lib/graphql";
import { BATTLEFLY_POOL } from "../../lib/consts";
import { ethers } from "ethers";


const genesisListingQuery = gql`query MyQuery {
  listings(
    first: 1
    orderBy: pricePerItem
    where: {token_in: ["0xebba467ecb6b21239178033189ceae27ca12eadf-0x75"], status: Active}
  ) {
    pricePerItem
  }
}`

const fetchTreasuryPrices = async (tokenIds: string[]) => {
  try {
    const prices = {} as Record<string, any>;
    const query = gql`query MyQuery {
      tokens(where: {id_in: ${JSON.stringify(tokenIds)}}) {
        floorPrice
        id
      }
    }`
    const res = await apolloTreasuryMarketplaceClient.query({query, fetchPolicy: 'network-only'});
    res.data.tokens.forEach((token: Record<string, any>) => {
      prices[token.id] = Number(ethers.utils.formatUnits(token.floorPrice, 18))
    });
    return prices;
  } catch (_) {
    console.log(_)
    return undefined
  }
};

export const useTreasuryPrice = (stakedTreasures: any) =>
  useQuery(['useTreasuryPrice', stakedTreasures], () => fetchTreasuryPrices(stakedTreasures.map((staked: any) => staked.token.id)), {
    refetchInterval: 12000,
  });
