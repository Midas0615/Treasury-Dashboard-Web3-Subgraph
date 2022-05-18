import { useQuery } from "react-query";
import {gql} from "@apollo/client";
import { apolloBridgeWorldClient } from "../lib/graphql";
import { BATTLEFLY_POOL } from "../lib/consts";

const query = gql`query MyQuery {
  user(id: "${BATTLEFLY_POOL}") {
    id
    deposited
    boosts
    boost
    staked(first: 1000) {
      quantity
      token {
        id
        image
        category
        name
        metadata {
          ... on TreasureInfo {
            boost
          }
          ... on LegionInfo {
            boost
            type
            role
            id
          }
        }
      }
    }
    deposits {
      depositId
      endTimestamp
      amount
      lock
    }
  }
}`

const fetchBattleFlyTreasury = async () => {
  try {
    const res = await apolloBridgeWorldClient.query({query, fetchPolicy: 'network-only'});
    return res.data as Record<string, any>;
  } catch (_) {
    return undefined
  }
};

export const useBridgeWorldGraph = () =>
  useQuery('useBridgeWorldGraph', () => fetchBattleFlyTreasury(), {
    refetchInterval: 12000,
  });
