import { useQuery } from "react-query";

type Period = "all" | "year" | "month" | "week" | "day" | "hour";
type Vault = "v1Vault" | "v2Vault" | "treasuryMain";

type Stat = {
  magic: number;
  ethereum: number;
};

type Pool = {
  name: Vault;
  stats: {
    totalValue: Stat;
    totalEmissions: Array<{
      [Key in Period]: {
        period: Key;
        value: Stat;
      };
    }[Period]>;
  };
  updatedAt: string;
};

export function usePools() {
  return useQuery(["pools"], () =>
    fetch(`${process.env.NEXT_PUBLIC_BATTLEFLY_API}/dashboard/pools`)
      .then((res) => res.json())
      .then((data: Pool[]) =>
        data.reduce<Record<string, Pool>>((acc, value) => {
          acc[value.name] = value;

          return acc;
        }, {})
      )
  );
}
