import React, { useEffect, useMemo, useState } from "react";
import { Chart, ArcElement } from "chart.js";
Chart.register(ArcElement);
import { Doughnut } from "react-chartjs-2";
import mLogo from "../assets/images/m.svg";
import { useCoingeckoPrice } from "../hooks/useCoingeckoPrice";
import { usePools } from "../hooks/usePools";
import {
  useAccount,
  chain,
  useContract,
  useNetwork,
  useProvider,
  useSigner,
  useContractWrite,
} from "wagmi";
import {
  CONTRACT_ABIS,
  CONTRACT_ADDRESSES,
  DEFAULT_CHAIN,
  VAULT_IDS,
  VAULT_METADATA_URL,
} from "../lib/consts";
import { DashboardContract } from "../lib/types";
import { useQuery } from "react-query";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { battleflyVaultClients } from "../lib/graphql";
import { useBattleflyVaultGraph } from "../hooks/useBattleflyVaultGraph";
import { FlywheelEmissions } from "./FlywheelEmissions";

const ACTIVE_BG: Record<string, string> = {
  false: "bg-015247",
  true: "bg-019380",
};

type VaultProps = {
  name: "V1" | "V2";
  supply: number;
  vaultContractName: DashboardContract;
};

type DistributionPercentagesProps = {
  data: NonNullable<ReturnType<typeof usePools>["data"]>[string] | undefined;
};

type ValueProps = {
  children: number | undefined;
  exact?: true;
  localeOptions?: Intl.NumberFormatOptions;
};

function Value({
  children,
  exact,
  localeOptions = {
    maximumFractionDigits: 2,
    minimumFractionDigits: 1,
  },
}: ValueProps) {
  const usdPrice = useCoingeckoPrice("magic");

  if (!children || Number.isNaN(children) || !usdPrice) {
    return <>--</>;
  }

  const price = (exact ? 1 : usdPrice) * children;

  return <>{price.toLocaleString("en-US", localeOptions)}</>;
}

function useContractAddresses() {
  const { activeChain } = useNetwork();
  const chainName = activeChain?.name;
  if (!chainName || !CONTRACT_ADDRESSES[chainName]) {
    return CONTRACT_ADDRESSES[DEFAULT_CHAIN.name];
  }

  return CONTRACT_ADDRESSES[chainName];
}

export default function Vault({ name, supply, vaultContractName }: VaultProps) {
  const [selectedNFT, setSelectedNFT] = useState([] as number[]);
  const [selectedStakedNFT, setSelectedStakedNFT] = useState([] as number[]);
  const contractAddress = useContractAddresses();
  const { data: account } = useAccount();
  const { data: signer } = useSigner();

  const provider = useProvider();
  const specialNFTRouterContract = useContract({
    addressOrName: contractAddress[DashboardContract.SpecialNFTRouter],
    contractInterface: CONTRACT_ABIS[DashboardContract.SpecialNFTRouter],
    signerOrProvider: provider,
  });

  const vaultContractWrite = useContract({
    addressOrName: contractAddress[vaultContractName],
    contractInterface: CONTRACT_ABIS[vaultContractName],
    signerOrProvider: signer,
  });

  const vaultContract = useContract({
    addressOrName: contractAddress[vaultContractName],
    contractInterface: CONTRACT_ABIS[vaultContractName],
    signerOrProvider: provider,
  });

  const nftContract = useContract({
    addressOrName: contractAddress[DashboardContract.FounderNft],
    contractInterface: CONTRACT_ABIS[DashboardContract.FounderNft],
    signerOrProvider: provider,
  });

  const nftContractWrite = useContract({
    addressOrName: contractAddress[DashboardContract.FounderNft],
    contractInterface: CONTRACT_ABIS[DashboardContract.FounderNft],
    signerOrProvider: signer,
  });
  const [isApproving, setIsApproving] = useState(false);

  // My NFT
  const approveForStaking = async () => {
    try {
      setIsApproving(true);
      const res = await nftContractWrite.setApprovalForAll(
        contractAddress[vaultContractName],
        true
      );
      const transitionRes = await res.wait();
      setIsApproving(false);
      if (transitionRes.status === 1) {
        toast.success("Your NFT has been approved");
      }
      refectchIsApproveAll();
    } catch (error: any) {
      toast.error(error.data ? error.data.message : error.message);
      setIsApproving(false);
    }
  };

  const stakeNFT = async (ids: number[]) => {
    try {
      setIsStakingIds([...isStakingIds, ...ids]);
      const res = await vaultContractWrite.stakeFounderNFT(ids);
      const transitionRes = await res.wait();
      if (transitionRes.status === 1) {
        toast.success("Your NFT has been staked");
      }
      setIsStakingIds(
        isStakingIds.filter((id: number) => {
          return !ids.includes(id);
        })
      );
      refetchStakedNFTIds();
      refetchMyNFTBalance();
    } catch (error: any) {
      toast.error(error.data ? error.data.message : error.message);
      setIsStakingIds(
        isStakingIds.filter((id: number) => {
          return !ids.includes(id);
        })
      );
    }
  };

  const { data: myNFTBalance, refetch: refetchMyNFTBalance } = useQuery(
    ["myNFTBalance", name, account?.address],
    async () => {
      if (!account?.address) return [];
      const res = await specialNFTRouterContract.getBalanceOf(
        account.address,
        VAULT_IDS[vaultContractName]
      );
      const nftBalance = res.map((nft: any) => {
        return Number(nft);
      });
      return nftBalance;
    }
  );

  const { data: isApprovedToStake, refetch: refectchIsApproveAll } = useQuery(
    ["isApprovedToStake", name, account?.address],
    async () => {
      if (!account?.address) return false;
      const res = await nftContract.isApprovedForAll(
        account.address,
        contractAddress[vaultContractName]
      );
      return res;
    }
  );

  const isCheckedAllMyNFT = useMemo(() => {
    if (!myNFTBalance || !selectedNFT) return false;
    return myNFTBalance.length === selectedNFT.length;
  }, [myNFTBalance, selectedNFT]);

  useEffect(() => {
    setSelectedNFT((s: any) => {
      return s.filter((id: number) => {
        return myNFTBalance.includes(id);
      });
    });
  }, [myNFTBalance]);
  const [isStakingIds, setIsStakingIds] = useState([] as number[]);

  const handleSelectAllMyNFT = (e: any) => {
    if (e.target.checked) {
      setSelectedNFT([...myNFTBalance]);
      return;
    }
    setSelectedNFT([]);
  };

  // Staked NFT
  const [isUnstakingIds, setIsUnstakingIds] = useState([] as number[]);

  const { data: stakedNftIds, refetch: refetchStakedNFTIds } = useQuery(
    ["stakedNftIds", name, account?.address],
    async () => {
      if (!account?.address) return [];
      const res = await vaultContract.stakesOf(account?.address);
      let stakedIds = [] as number[];
      res[1].forEach((staked: number[]) => {
        const ids = staked.map((id) => {
          return Number(id);
        });
        stakedIds = [...stakedIds, ...ids];
      });
      return stakedIds;
    }
  );

  const { data: stakedNFTMetadata } = useQuery(
    [stakedNftIds, name],
    async () => {
      if (!stakedNftIds || !stakedNftIds.length) return {};
      const nftId = Number(stakedNftIds[0]);
      const res = await fetch(`${VAULT_METADATA_URL}/${nftId}/metadata`);
      const metadata = res.json();
      return metadata;
    }
  );

  const isCheckedAllStaked = useMemo(() => {
    if (!stakedNftIds || !selectedStakedNFT) return false;
    return stakedNftIds.length === selectedStakedNFT.length;
  }, [stakedNftIds, selectedStakedNFT]);

  const unstakeNFT = async (ids: number[]) => {
    try {
      setIsUnstakingIds([...isUnstakingIds, ...ids]);
      const res = await vaultContractWrite.withdraw(ids);
      const transitionRes = await res.wait();
      if (transitionRes.status === 1) {
        toast.success("Your NFT has been unstaked");
      }
      setIsUnstakingIds(
        isUnstakingIds.filter((id: number) => {
          return !ids.includes(id);
        })
      );
      refetchMyNFTBalance();
      refetchStakedNFTIds();
    } catch (error: any) {
      toast.error(error.data ? error.data.message : error.message);
      console.log(error);
      setIsUnstakingIds(
        isUnstakingIds.filter((id: number) => {
          return !ids.includes(id);
        })
      );
    }
  };

  useEffect(() => {
    setSelectedStakedNFT((s: any) => {
      return s.filter((id: number) => {
        return stakedNftIds ? stakedNftIds.includes(id) : [];
      });
    });
  }, [stakedNftIds]);

  const handleSelectedAllStaked = (e: any) => {
    if (e.target.checked) {
      if (stakedNftIds) setSelectedStakedNFT([...stakedNftIds]);
      return;
    }
    setSelectedStakedNFT([]);
  };


  const { data: nftMetadata } = useQuery(['nftMetadata', myNFTBalance, stakedNftIds, name], async () => {
    let nftId = null;
    if (myNFTBalance && myNFTBalance.length) nftId = myNFTBalance[0];
    if (stakedNftIds && stakedNftIds.length) nftId = stakedNftIds[0];
    if (isNaN(nftId)) return {};
    const res = await fetch(`${VAULT_METADATA_URL}/${nftId}/metadata`);
    const metadata = res.json();
    return metadata;
  });
  // Claim
  const [isClaiming, setIsClaiming] = useState(false);
  const claimAll = async () => {
    try {
      setIsClaiming(true);
      const res = await vaultContractWrite.claimAll();
      const transitionRes = await res.wait();
      if (transitionRes.status === 1) {
        toast.success("Claim Success");
      }
      setIsClaiming(false);
      refetchPendingClaim();
    } catch (error: any) {
      toast.error(error.data ? error.data.message : error.message);
      console.log(error);
      setIsClaiming(false);
    }
  };

  const { data: pendingClaim, refetch: refetchPendingClaim } = useQuery(
    ["pendingClaim", name, account?.address],
    async () => {
      if (!account?.address || !vaultContract) return 0;
      const res = await vaultContract.getClaimableEmissionOf(account.address);
      const amount = ethers.utils.formatUnits(res, 18);
      return Number(amount);
    }
  );

  // Past Claim
  const [isPastClaiming, setIsPastClaiming] = useState(false);
  const claimPast = async () => {
    try {
      setIsPastClaiming(true);
      const res = await vaultContractWrite.claimPastEmission();
      const transitionRes = await res.wait();
      if (transitionRes.status === 1) {
        toast.success("Claim Past Emission Success");
      }
      setIsPastClaiming(false);
      refetchPastClaim();
    } catch (error: any) {
      toast.error(error.data ? error.data.message : error.message);
      console.log(error);
      setIsPastClaiming(false);
    }
  };

  const { data: pastClaim, refetch: refetchPastClaim } = useQuery(
    ["pastClaim", name, account?.address],
    async () => {
      if (!account?.address || !vaultContract) return 0;
      const perFounder = await vaultContract.pastEmissionPerFounder();
      const pastClaimableIds =
        await vaultContract.getPastEmissionClaimableTokens(account.address);
      const amount =
        Number(ethers.utils.formatUnits(perFounder, 18)) *
        pastClaimableIds.length;
      return Number(amount);
    }
  );

  // calc
  const { data: vaultGraphData } = useBattleflyVaultGraph(
    battleflyVaultClients[vaultContractName],
    name
  );

  const [emissions, setEmissions] = useState("day");
  const yourEmissions = useMemo(() => {
    if (!vaultGraphData || !stakedNftIds) return 0;
    const dailyValue =
      Number(ethers.utils.formatUnits(vaultGraphData.emissionPerFounder, 18)) *
      stakedNftIds.length;
    switch (emissions) {
      case "hour":
        return dailyValue / 24;
      case "day":
        return dailyValue;
      case "week":
        return dailyValue * 7;
      case "year":
        return dailyValue * 365;
      default:
        return 0;
    }
  }, [vaultGraphData, stakedNftIds, emissions]);
  const usdPrice = useCoingeckoPrice("magic");

  // const apr =
  //   (((dailyMagicEmissions * 0.35) / 0.7) * ((supply * 365) / totalMagic)) /
  //   100;
  // const apy =
  //   (((dailyMagicEmissions * 0.35 + dailyMagicEmissions * 0.15) / 0.7) *
  //     ((supply * 365) / totalMagic)) /
  //   100;

  return (
    <>
      <div className="p-6">
        <div className="mt-6">
          <div className="text-2xl">Vault Emissions</div>
          <div className="p-6 gra-7B61FF rounded-lg border border-7B61FF grid grid-cols-12 mt-4 gap-6">
            <div className="col-span-12 md:col-span-4">
              <div className="center px-6 relative">
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 px-[20%] w-full text-center">
                  {/* Total {name} pool value */}
                </div>
                <Doughnut
                  data={{
                    datasets: [
                      {
                        data: [],
                        backgroundColor: ["#5533FF", "#06B59E"],
                        label: "Dataset 1",
                      },
                    ],

                    labels: ["ETH", "MAGIC"],
                  }}
                  options={{
                    cutout: "70%",
                    responsive: true,
                    maintainAspectRatio: true,
                  }}
                />
              </div>
            </div>
            <div className="col-span-12 md:col-span-4">
              <div className="text-xl">Value Per Founder NFT</div>
              <div className="flex flex-col gap-3 mt-4">
                <div className="rounded-lg border-2 border-019380 rounded-md bg-black">
                  <div className="m-1">Indicative underlying value</div>
                  <div className="m-3 flex gap-4 text-2xl">
                    <Value exact>{undefined}</Value>
                  </div>
                </div>
                <div className="rounded-lg border-2 border-019380 rounded-md bg-black">
                  <div className="m-1">Backing value (USD)</div>
                  <div className="m-3 flex gap-4 text-2xl">
                    <Value exact>{undefined}</Value>
                  </div>
                </div>
                <div className="rounded-lg border-2 border-019380 rounded-md bg-black">
                  <div className="m-1">Backing value (Magic)</div>
                  <div className="m-3 flex gap-4 text-2xl">
                    <img src={mLogo.src} alt="a" />
                    <Value exact>{undefined}</Value>
                  </div>
                </div>
                <div className="rounded-lg border-2 border-019380 rounded-md bg-black">
                  <div className="m-1">Indicative gFLY value</div>
                  <div className="m-3 flex gap-4 text-2xl">
                    <Value exact>{undefined}</Value>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-4">
              <div className="text-xl">Expected Emissions</div>
              <div className="flex flex-col gap-6 mt-4">
                <table className="w-full table-auto border-separate border-2 border-019380 rounded-md bg-black">
                  <tbody>
                    <tr>
                      <td className="border-b border-E2E2E4" colSpan={2}>
                        {name} Founder pool emissions
                      </td>
                    </tr>
                    <tr>
                      <td className="border-b border-r border-E2E2E4 w-full">
                        Daily
                      </td>
                      <td className="border-b border-E2E2E4 text-right">
                        <Value exact>
                          {vaultGraphData
                            ? Number(
                                ethers.utils.formatUnits(
                                  vaultGraphData.totalPoolEmission,
                                  18
                                )
                              )
                            : 0}
                        </Value>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-b border-r border-E2E2E4 w-full">
                        Yearly
                      </td>
                      <td className="border-b border-E2E2E4 text-right">
                        <Value exact>
                          {vaultGraphData
                            ? Number(
                                ethers.utils.formatUnits(
                                  vaultGraphData.totalPoolEmission,
                                  18
                                )
                              ) * 365
                            : 0}
                        </Value>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-b border-r border-E2E2E4 w-full">
                        APR
                      </td>
                      <td className="border-b border-E2E2E4 text-right">
                        <Value exact localeOptions={{ style: "percent" }}>
                          {undefined}
                        </Value>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-b border-r border-E2E2E4 w-full">
                        APY
                      </td>
                      <td className="border-b border-E2E2E4 text-right">
                        <Value exact localeOptions={{ style: "percent" }}>
                          {undefined}
                        </Value>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table className="w-full table-auto border-separate border-2 border-019380 rounded-md">
                  <tbody>
                    <tr>
                      <td className="border-b border-E2E2E4" colSpan={2}>
                        Daily emissions per {name}
                      </td>
                    </tr>
                    <tr>
                      <td className="border-b border-r border-E2E2E4 w-full">
                        Claimable (35%)
                      </td>
                      <td className="border-b border-E2E2E4 text-right">
                        <Value exact>
                          {vaultGraphData
                            ? Number(
                                ethers.utils.formatUnits(
                                  vaultGraphData.emissionPerFounder,
                                  18
                                )
                              )
                            : 0}
                        </Value>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-b border-r border-E2E2E4 w-full">
                        Compounding (15%)
                      </td>
                      <td className="border-b border-E2E2E4 text-right">
                        <Value exact>
                          {vaultGraphData
                            ? (Number(
                                ethers.utils.formatUnits(
                                  vaultGraphData.emissionPerFounder,
                                  18
                                )
                              ) /
                                35) *
                              15
                            : 0}
                        </Value>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {
          account?.address ?         <div className="mt-16">
          <div className="text-2xl">Claiming & Staking</div>
          <div className="mt-4 grid grid-cols-12">
            <div className="col-span-12 p-4 md:col-span-5  md:border-r border-white md:pr-12">
              { stakedNftIds?.length ? <>
                <div className="text-xl mt-2">{name} NFTs staked</div>
                <div className="grid grid-cols-3 mt-4 gap-4">
                  {stakedNftIds &&
                    stakedNftIds.map((nftId: number, index: number) => {
                      return (
                        <div
                          key={nftId}
                          className="p-2 bg-red border border-7B61FF rounded-md"
                        >
                          <div className="text font-thin">TOKEN ID</div>
                          <div className="mt-3">{nftId}</div>
                        </div>
                      );
                    })}
                </div>
                <div className="gra-019380 rounded-lg border-2 border-019380 mt-4 p-2">
                  <div className="flex justify-between">
                    <div className="my-1 mx-3">{name} emissions</div>
                    <div className="m-1 flex items-center justify-center">
                      <div
                        className="inline-flex shadow-md hover:shadow-lg focus:shadow-lg border border-019380 rounded-md"
                        role="group"
                      >
                        <button
                          className={`px-3 py-1 ${
                            ACTIVE_BG[String(emissions === "hour")]
                          } font-medium text-xs rounded-l-md`}
                          onClick={() => setEmissions("hour")}
                        >
                          1H
                        </button>
                        <button
                          className={`px-3 py-1 ${
                            ACTIVE_BG[String(emissions === "day")]
                          } font-medium text-xs`}
                          onClick={() => setEmissions("day")}
                        >
                          1D
                        </button>
                        <button
                          className={`px-3 py-1 ${
                            ACTIVE_BG[String(emissions === "week")]
                          } font-medium text-xs`}
                          onClick={() => setEmissions("week")}
                        >
                          1W
                        </button>
                        <button
                          className={`px-3 py-1 ${
                            ACTIVE_BG[String(emissions === "year")]
                          } font-medium text-xs rounded-r-md`}
                          onClick={() => setEmissions("year")}
                        >
                          1Y
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="m-3 flex gap-4 text-2xl">
                    <img src={mLogo.src} alt="a" />
                    <Value exact>{yourEmissions}</Value>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-center flex-col">
                    <div>
                      Pending reward:
                      <span className="text-[#7B61FF] ml-2">{pendingClaim}</span>
                    </div>
                  </div>
                  <button
                    className={`btn w-full normal-case btn-primary mt-4 ${
                      isClaiming ? "loading" : ""
                    }`}
                    // disabled={!pendingClaim}
                    onClick={() => {
                      claimAll();
                    }}
                  >
                    Claim Emissions
                  </button>

                  {/* <button
                    className={`btn w-full normal-case btn-secondary text-white mt-4`}
                    // onClick={() => {claimAll()}}
                  >
                    Unstake NFTs
                  </button> */}
                </div>
              </> : <>
                  <div className="bg-[#0F0F37] text-center h-[26rem] flex align-middle p-6 mb-6">
                    <div className="m-auto">
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          className="mr-2 inline-block w-8 h-8 stroke-current"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                      <div className="mt-6">
                        No nfts staked. <br></br>Please stake nfts to generate emissions
                      </div>
                    </div>
                  </div>
              </>}

              {
                  (stakedNftIds?.length || myNFTBalance?.length) ?  <label
                  className={`btn w-full normal-case btn-accent text-white mt-4`}
                  // onClick={() => {setIsOpenStakeModal(true)}}
                  for="stakeModal"
                >
                  Stake NFTs
                </label> : null
              }

              {
                  (stakedNftIds?.length) ?  <label
                  className={`btn w-full normal-case btn-secondary mt-4`}
                  // onClick={() => {setIsOpenStakeModal(true)}}
                  for="stakeModal"
                >
                  Unstake NFTs
                </label> : null
              }
            </div>

          <FlywheelEmissions></FlywheelEmissions>
          </div>
        </div> : null
        }
      </div>

      <input
        type="checkbox"
        className="modal-toggle"
        id="stakeModal"
      ></input>
      <label for="stakeModal" className="modal">
        <label for="" className="modal-box relative max-w-5xl w-11/12 md:w-7/12 border-2 border-7B61FF">
          <label
            for="stakeModal"
            className="btn btn-sm btn-circle btn-outline absolute right-2 top-2 border-0"
          >
            ✕
          </label>
          <div className="text-xl">Founder NFTs in wallet</div>
          { myNFTBalance?.length ? <>
            <div className="text-base mt-6">Unstaked</div>
          <div className="max-h-[calc(100vh-30rem)] max-h-[300px] overflow-y-auto grid grid-cols-1 md:grid-cols-4 xl:grid-col-8 gap-12 mt-2 pr-6 py-4 mt-4">
            {myNFTBalance &&
              myNFTBalance.map((nftId: number, index: number) => {
                return (
                  <div
                    key={nftId}
                    className={`border-transparent border relative nft-hover rounded-lg p-4 cursor-pointer ${selectedNFT.includes(nftId) ? 'border-7B61FF border gra-7B61FF' : ''}`}
                    onClick={(e) => {
                      if (selectedNFT.includes(nftId)) {
                        setSelectedNFT(
                          selectedNFT.filter((a: number) => {
                            return a !== nftId;
                          })
                        );
                      } else {
                        setSelectedNFT([...selectedNFT, nftId]);
                      }
                    }}
                  >
                    {
                      selectedNFT.includes(nftId) && <label className="label cursor-pointer p-0 absolute -top-3 -right-3 bg-accent rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" fill="currentColor" className="" viewBox="0 0 16 16">
                        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                      </svg>
                    </label>
                    }
                    <img
                      src={nftMetadata ? nftMetadata.image : ""}
                      className="w-[120px] m-auto"
                    ></img>
                    <div className="my-3 text-sm">
                      {nftMetadata ? nftMetadata.name : ""}
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Token Id</p>
                      <p className="text-sm">{nftId}</p>
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="col-span-full mt-4">
            <div className="flex justify-end gap-6 flex-wrap">
                { (myNFTBalance.length && isApprovedToStake) ? <>
                  <button
                  className={`px-12 btn btn-primary normal-case text-base w-full md:w-auto
                  ${
                    isStakingIds.length
                      ? "loading"
                      : ""
                  }`}
                  onClick={() => {stakeNFT(myNFTBalance)}}
                >
                  Stake All
                </button>

                <button
                  className={`px-12 btn btn-accent normal-case text-base w-full md:w-auto
                  ${
                    isStakingIds.length
                      ? "loading"
                      : ""
                  }`}
                  onClick={() => {stakeNFT(selectedNFT)}}
                  disabled={!selectedNFT.length}
                >
                  Stake Selected
                </button></> : null
                }
            </div>
          </div></> : null}

          {
            stakedNftIds?.length ? <>
            <div className="text-base mt-6">Staked</div>
            <div className="max-h-[calc(100vh-30rem)] max-h-[300px] overflow-y-auto grid grid-cols-1 md:grid-cols-4 xl:grid-col-8 gap-12 mt-4 pr-6 py-4">
              {stakedNftIds &&
                stakedNftIds.map((nftId: number, index: number) => {
                  return (
                    <div
                      key={nftId}
                      className={`border-transparent border relative nft-hover rounded-lg p-4 cursor-pointer ${selectedStakedNFT.includes(nftId) ? 'border-7B61FF border gra-7B61FF' : ''}`}
                      onClick={(e) => {
                        if (selectedStakedNFT.includes(nftId)) {
                          setSelectedStakedNFT(
                            selectedStakedNFT.filter((a: number) => {
                              return a !== nftId;
                            })
                          );
                        } else {
                          setSelectedStakedNFT([...selectedStakedNFT, nftId]);
                        }
                      }}
                    >
                      {
                        selectedStakedNFT.includes(nftId) && <label className="label cursor-pointer p-0 absolute -top-3 -right-3 bg-accent rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" fill="currentColor" className="" viewBox="0 0 16 16">
                          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                        </svg>
                      </label>
                      }
                      <img
                        src={nftMetadata ? nftMetadata.image : ""}
                        className="w-[120px] m-auto"
                      ></img>
                    <div className="my-3 text-sm">
                      {nftMetadata ? nftMetadata.name : ""}
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Token Id</p>
                      <p className="text-sm">{nftId}</p>
                    </div>
                    </div>
                  );
                })}
            </div>
            <div className="col-span-full mt-6">
              <div className="flex justify-end gap-6 flex-wrap">
                  <button
                    className={`px-12 btn btn-secondary normal-case text-base w-full md:w-auto
                      ${isUnstakingIds.length ? 'loading' : ''}
                    `}
                    onClick={() => {unstakeNFT(stakedNftIds || [])}}
                  >
                    Unstake All
                  </button>
  
                  <button
                    className={`px-12 btn btn-secondary normal-case text-base w-full md:w-auto
                    ${isUnstakingIds.length ? 'loading' : ''}
                  `}
                    onClick={() => {unstakeNFT(selectedStakedNFT)}}
                    disabled={!selectedStakedNFT.length}
                  >
                    Unstake Selected
                  </button>
              </div>
            </div></> : null
          }
        </label>
      </label>
    </>
  );
}
