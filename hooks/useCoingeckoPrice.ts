import { useQuery } from "react-query";

// Taken from https://github.com/TrueFiEng/useDApp/blob/master/packages/coingecko/src/hooks/useCoingeckoPrice.tsx
// Can use this package if switching from web3-react to useDapp (recommended)

const getCoingeckoSimplePriceUri = (baseId: string, quoteId: string) =>
  `https://api.coingecko.com/api/v3/simple/price?ids=${baseId}&vs_currencies=${quoteId}`;

const fetchCoingeckoPrice = async (base: string, quote: string) => {
  try {
    const baseId = base.toLowerCase();
    const quoteId = quote.toLowerCase();
    const url = getCoingeckoSimplePriceUri(baseId, quoteId);
    const data = await fetch(url);
    const result = await data.json();
    const price = result[baseId][quoteId];
    return price ? Number(price) : undefined;
  } catch (_) {
    return undefined;
  }
};

export const useCoingeckoPrice = (base: string, quote = "usd") =>
  useQuery(["usd-price", base, quote], () => fetchCoingeckoPrice(base, quote), {
    refetchInterval: 12000,
  }).data ?? 0;
