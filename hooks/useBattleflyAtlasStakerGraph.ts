import { useQuery } from "react-query";
import {gql} from "@apollo/client";
import { aplBattleflyAtlasStaker } from "../lib/graphql";

const fetchBattleFlyStaker= async () => {
  try {
    const query = gql`query MyQuery {
      dailyEmissionEntities(orderBy: daysSinceStart, first: 1) {
        id
        emissionPerFounder
      }
    }`
    const res = await aplBattleflyAtlasStaker.query({query, fetchPolicy: 'network-only'});
    return res.data as Record<string, any>;
  } catch (_) {
    return undefined
  }
};

export const useBattleflyAtlasStakerGraph = () =>
  useQuery(['useBattleflyAtlasStakerGraph'], () => fetchBattleFlyStaker(), {
    refetchInterval: 12000,
  });
