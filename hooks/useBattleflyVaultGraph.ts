import { useQuery } from "react-query";
import {ApolloClient, gql, NormalizedCacheObject} from "@apollo/client";

const fetchBattleflyVault = async (aplClient: ApolloClient<NormalizedCacheObject>) => {
  try {
    const query = gql`query MyQuery {
      dailyEmissionEntities(orderBy: daysSinceStart, first: 5) {
        id
        emissionPerFounder
        totalPoolEmission
      }
    }`
    const res = await aplClient.query({query, fetchPolicy: 'network-only'});
    
    return res.data.dailyEmissionEntities.length ? res.data.dailyEmissionEntities[0] : undefined;
  } catch (_) {
    console.log(_)
    return undefined
  }
};

export const useBattleflyVaultGraph = (aplClient: ApolloClient<NormalizedCacheObject>, key: string) =>
  useQuery(['useBattleflyVaultGraph', key], () => fetchBattleflyVault(aplClient), {
    refetchInterval: 12000,
  });
