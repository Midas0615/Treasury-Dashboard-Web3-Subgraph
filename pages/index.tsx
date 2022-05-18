import React, { useEffect, useMemo, useState } from 'react'

import { Chart, ArcElement, Tooltip} from 'chart.js'
Chart.register([Tooltip, ArcElement])
import { Doughnut } from 'react-chartjs-2'
import { useBridgeWorldGraph } from '../hooks/useBridgeWorldGraph'
// Images
import mLogo from '../assets/images/m.svg'
import { BigNumber, ethers } from 'ethers'
import { chain, useContract, useProvider, Connector, Provider } from 'wagmi'
import { BATTLEFLY_POOL, CONTRACT_ABIS, CONTRACT_ADDRESSES } from '../lib/consts'
import { useQuery } from 'react-query'
import { providers } from "ethers";
import { useGenesisGroupedPrice } from '../hooks/treasuryMarketplace/useGenesisGroupedPrice'
import { useTreasuryPrice } from '../hooks/treasuryMarketplace/useTreasuryPrice'
import { DashboardContract } from '../lib/types'

const doughnutOptions = {
  options: {
    responsive: true,
    cutoutPercentage: 70,
  },
  legend: {
    display: false,
  },
}

enum RewardPerOption {
  HOURS = 0,
  DATE = 1,
  WEEK = 2,
  MONTH = 3,
  YEAR = 4
}

const readableNumber = (num: number | string, fixed: number = 2) => {
  const parseNum = Number(num);
  if (parseNum < 1) return parseNum.toFixed(fixed);
  const s = ['', ' K', ' M', ' B'];
  const e = Math.floor(Math.log(parseNum) / Math.log(1000));
  return (parseNum / Math.pow(1000, e)).toFixed(fixed) + s[e];
}

const lockupTime = ['2 Weeks', '1 Month', '3 Months', '6 Months', '12 Months']
const lockupBoost = [0.1, 0.25, 0.8, 1.8, 4]

const getBgClass = (value: RewardPerOption, selected: RewardPerOption) => {
  if (value === selected) return 'bg-7D77FC';
  return 'bg-0F0F37'

}

const arbitrumProvider =  new providers.AlchemyProvider(
  chain.arbitrum.id,
  process.env.NEXT_PUBLIC_ALCHEMY_KEY
);

export default function Home() {
  const bridgeWorldData = useBridgeWorldGraph();
  const genesisGroupedPrice = useGenesisGroupedPrice();
  const stakedTreasures = useMemo(() => {
    if (!bridgeWorldData.data) return [];
    return bridgeWorldData.data.user.staked.filter((staked: any) => {
      return staked.token.category === "Treasure"
    })
  }, [bridgeWorldData.data])
  const treasuryStakedPrices = useTreasuryPrice(stakedTreasures)

  const totalMiningPower = useMemo(() => {
    if (!bridgeWorldData.data) return 0;
    const totalDepoist = Number(ethers.utils.formatUnits(bridgeWorldData.data.user.deposited, 18));
    let totaLockBoosts = 0;
    bridgeWorldData.data.user.deposits.forEach((deposits: Record<string, any>) => {
      const boostPower = Number(ethers.utils.formatUnits(deposits.amount, 18)) * lockupBoost[deposits.lock]
      totaLockBoosts += boostPower;
    })
    return totalDepoist + totalDepoist * bridgeWorldData.data.user.boost + totaLockBoosts;
  }, [bridgeWorldData.data])
  const atlasMineContract = useContract({
    addressOrName: CONTRACT_ADDRESSES[chain.arbitrum.name][3],
    contractInterface: CONTRACT_ABIS[3],
    signerOrProvider: arbitrumProvider
  })

  const magicContract = useContract({
    addressOrName: CONTRACT_ADDRESSES[chain.arbitrum.name][4],
    contractInterface: CONTRACT_ABIS[4],
    signerOrProvider: arbitrumProvider
  })
  const [rewardPerDuration, setRewardPerDuration] = useState(RewardPerOption.HOURS);
  const totalLpTokenQuery = useQuery('totalLpToken', async () => {
    const data = await atlasMineContract.totalLpToken();
    return Number(ethers.utils.formatUnits(data, 18))
  })

  const shareOfmine = useMemo(() => {
    if (!totalLpTokenQuery.data || !totalMiningPower) return 0;
    return (totalMiningPower/totalLpTokenQuery.data)*100
  }, [totalLpTokenQuery, totalMiningPower])

  const magicBalance = useQuery('magicBalance', async () => {
    const data = await magicContract.balanceOf(BATTLEFLY_POOL);
    return Number(ethers.utils.formatUnits(data, 18))
  })

  const rewardYTDQuery = useQuery('caclRewardYTD', async () => {
    const pendingReward = await atlasMineContract.pendingRewardsAll(BATTLEFLY_POOL)
    const harvestFilter = atlasMineContract.filters.Harvest(BATTLEFLY_POOL)
    const lastestBlockNum = await arbitrumProvider.getBlockNumber()
    const events = await atlasMineContract.queryFilter(harvestFilter, 4214200, lastestBlockNum)
    let totalHarvest = BigNumber.from(0)
    events.forEach((event: Record<string, any>) => {
      totalHarvest = totalHarvest.add(event.args[2])
    })
    return pendingReward.add(totalHarvest)
  }, { initialData: BigNumber.from(0) })

  const unknowContract = useContract({
    addressOrName: CONTRACT_ADDRESSES[chain.arbitrum.name][DashboardContract.UnknowPool],
    contractInterface: CONTRACT_ABIS[DashboardContract.UnknowPool],
    signerOrProvider: arbitrumProvider
  })

  const {data: ratePerSecond} = useQuery(['ratePerSecond', CONTRACT_ADDRESSES[chain.arbitrum.name][DashboardContract.UnknowPool]], async () => {
    const res = await unknowContract.getGlobalRatePerSecond();
    return Number(ethers.utils.formatUnits(res, 18));
  })

  const rewardPerValue = useMemo(() => {
    if (!ratePerSecond) return 0;
    switch (rewardPerDuration) {
      case RewardPerOption.HOURS:
        return ratePerSecond * 60 * 60
      case RewardPerOption.DATE:
        return ratePerSecond * 60 * 60 * 24
      case RewardPerOption.WEEK:
        return ratePerSecond * 60 * 60 * 7
      case RewardPerOption.MONTH:
          return ratePerSecond * 60 * 60 * 24 * 30
      case RewardPerOption.YEAR:
        return ratePerSecond * 60 * 60 * 24 * 365
      default:
        break;
    }
    return 0
  }, [ratePerSecond, rewardPerDuration])

  const stakedGenesisValue = useMemo(() => {
    if (!bridgeWorldData.data || !genesisGroupedPrice.data)  return 0;
    const stakedGenesis = bridgeWorldData.data.user.staked.filter((genesis: Record<string, any>) => {
      return genesis.token.metadata.role
    })
    let totalValue = 0;
    stakedGenesis.forEach((genesis: any) => {
      const groupName = `${genesis.token.name} ${genesis.token.metadata.role}`
      const priceData = (genesisGroupedPrice.data as Record<string, any>)[groupName] || 0
      totalValue += priceData ? priceData : 0
    });
    return totalValue;
  }, [genesisGroupedPrice.data, bridgeWorldData.data])

  const stakedtreasureValue = useMemo(() => {
    if (!bridgeWorldData.data || !treasuryStakedPrices.data)  return 0;
    let totalValue = 0;
    stakedTreasures.forEach((staked: any) => {
      totalValue += Number(staked.quantity) * (treasuryStakedPrices.data as Record<string, any>)[staked.token.id]
    });
    return totalValue;
  },[treasuryStakedPrices.data, stakedTreasures, bridgeWorldData.data])

  const genesisPercent = useMemo(() => {
    return Math.round(stakedGenesisValue/(stakedGenesisValue + stakedtreasureValue) * 100)
  }, [stakedGenesisValue, stakedtreasureValue])

  const treasurePercent = useMemo(() => {
    return 100 - genesisPercent
  }, [genesisPercent])

  const stakedNfts = useMemo(() => {
    if (!bridgeWorldData.data) return [];
    const nfts = [...bridgeWorldData.data.user.staked];
    nfts.sort((a: any, b: any) => {
      return Number(b.token.metadata.boost) - Number(a.token.metadata.boost)
    })
    return nfts
  }, [bridgeWorldData.data])

  const portfolioData = useMemo(() => {
    if (!bridgeWorldData.data) return {
      data: [],
      label: []
    };
    const stakedMagic = Number(ethers.utils.formatUnits(bridgeWorldData.data.user.deposited, 18))
    const data = [stakedMagic, stakedtreasureValue, stakedGenesisValue, magicBalance.data];
    const label = ["Staked Magic", "Staked Treasure", "Staked Genesis", "$Magic balance (Wallet)"];
    return {
      data,
      label
    }
  }, [bridgeWorldData.data, magicBalance, stakedGenesisValue, stakedtreasureValue])
  return (
    <>
      <div className="p-8 text-6xl font-semibold gra-title">Treasury</div>
      <div className="px-6">
        <div className="grid gap-6 mb-8 xl:grid-cols-7">
          <div className="col-span-2">
            <div className="py-6 text-xl">Total asset distribution</div>
            <div className="p-4 gra-7B61FF rounded-lg border-2 border-7B61FF">
              <Doughnut {...doughnutOptions} data={
                {
                  datasets: [
                    {
                      data: portfolioData.data,
                      backgroundColor: ['#3B009A', "#F72585", "#B5179E", "#00D4FF",  "#C3D9E1", "#151A20", "#7209B7", "#02222F", "#0A0D10", '#00B4D8', '#560BAD'],
                      label: 'Portfolio',
                    },
                  ],
                  labels: portfolioData.label,
                }
              }/>
            </div>
          </div>
          <div className="col-span-2">
            <div className="py-6 text-xl">Treasury Data</div>
            <div className="grid gap-6 md:grid-rows-4">
              <div className="gra-7B61FF rounded-lg border-2 border-7B61FF">
                <div className="m-1">Total rewards YTD</div>
                <div className="m-3 flex gap-4 font-semibold text-2xl">
                  <img src={mLogo.src} alt="a" />
                  {readableNumber(ethers.utils.formatUnits(rewardYTDQuery.data.toString(), 18))}
                </div>
              </div>
              <div className="gra-7B61FF rounded-lg border-2 border-7B61FF">
                <div className="m-1">Total Deposited</div>
                <div className="m-3 flex gap-4 font-semibold text-2xl">
                  <img src={mLogo.src} alt="a" />
                  {bridgeWorldData.data && readableNumber(ethers.utils.formatUnits(bridgeWorldData.data.user.deposited, 18).toString(), 4)}
                </div>
              </div>
              <div className="gra-7B61FF rounded-lg border-2 border-7B61FF">
                <div className="m-1 flex justify-between">
                  <div>Rewards per</div>
                  <div className="flex items-center justify-center">
                    <div
                      className="inline-flex shadow-md hover:shadow-lg focus:shadow-lg border border-7D77FC rounded-md"
                      role="group"
                    >
                      <a
                        className={"px-3 py-1 font-medium text-xs rounded-l-md " + getBgClass(RewardPerOption.HOURS, rewardPerDuration)}
                        onClick={() => {setRewardPerDuration(RewardPerOption.HOURS)}}
                        href="#"
                      >
                        1H
                      </a>
                      <a
                        className={"px-3 py-1 font-medium text-xs " + getBgClass(RewardPerOption.DATE, rewardPerDuration)}
                        onClick={() => {setRewardPerDuration(RewardPerOption.DATE)}}
                        href="#"
                      >
                        1D
                      </a>
                      <a
                        className={"px-3 py-1 font-medium text-xs " + getBgClass(RewardPerOption.WEEK, rewardPerDuration)}
                        onClick={() => {setRewardPerDuration(RewardPerOption.WEEK)}}
                        href="#"
                      >
                        1W
                      </a>
                      <a
                        className={"px-3 py-1 font-medium text-xs  " + getBgClass(RewardPerOption.MONTH, rewardPerDuration)}
                        onClick={() => {setRewardPerDuration(RewardPerOption.MONTH)}}
                        href="#"
                      >
                        1M
                      </a>
                      <a
                        className={"px-3 py-1 font-medium text-xs rounded-r-md "+ getBgClass(RewardPerOption.YEAR, rewardPerDuration)}
                        onClick={() => {setRewardPerDuration(RewardPerOption.YEAR)}}
                        href="#"
                      >
                        1Y
                      </a>
                    </div>
                  </div>
                </div>
                <div className="m-3 flex gap-4 font-semibold text-2xl">
                  <img src={mLogo.src} alt="a" />
                  {readableNumber(rewardPerValue)}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-3">
            <div className="py-6 text-xl">Deposit history</div>
            <div>
              <table className="w-full table-auto gra-7B61FF border-separate border-2 border-7B61FF rounded-md">
                <thead>
                  <tr>
                    <th className="border-b border-E2E2E4"></th>
                    <th className="border-b border-E2E2E4">Amount</th>
                    <th className="border-b border-E2E2E4">Lockup</th>
                    <th className="border-b border-E2E2E4">Unlock date</th>
                    <th className="border-b border-E2E2E4">Mining power</th>
                  </tr>
                </thead>
                <tbody>
                  {bridgeWorldData.data && bridgeWorldData.data.user.deposits.map((deposits: any) => {
                     return <tr key={deposits.depositId}>
                      <td>{deposits.depositId}</td>
                      <td>{readableNumber(ethers.utils.formatUnits(deposits.amount, 18))}</td>
                      <td>{lockupTime[deposits.lock]}</td>
                      <td>{new Date(Number(deposits.endTimestamp)).toLocaleDateString()}</td>
                      <td>{readableNumber(Number(ethers.utils.formatUnits(deposits.amount, 18)) * (1 + lockupBoost[deposits.lock]))}</td>
                    </tr>
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="py-6 text-xl">Staked NFTs</div>
        <div className="flex md:justify-between flex-wrap">
          <div className="md:w-8/12 my-4">
            <div className="text-xs">EST. TOTAL VALUE {(new Date()).toLocaleDateString()}</div>
            <p className="flex gap-1 text-lg font-semibold">
              <img src={mLogo.src} alt="a" />
              {readableNumber(stakedGenesisValue + stakedtreasureValue)}
            </p>
          </div>
          <div className="flex justify-between w-full md:w-3/12 my-4">
            <div>
              <div className="text-sm">GENESIS LEGION</div>
              <p className="flex gap-1 text-lg font-semibold">
                <img src={mLogo.src} alt="a" />
                {readableNumber(stakedGenesisValue)}
              </p>
            </div>
            <div>
              <div className="text-sm">TREASURE</div>
              <p className="flex gap-1 text-lg font-semibold">
                <img src={mLogo.src} alt="a" />
                {readableNumber(stakedtreasureValue)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-7D77FC h-10 mb-2 rounded-lg">
          <div
            className="bg-4A3EE4 h-10 rounded-l-lg"
            style={{ width: genesisPercent ? genesisPercent + '%' :'0%' }}
          ></div>
        </div>
        <div className="flex justice-between text-lg">
          <div style={{ width: genesisPercent ? genesisPercent + '%' :'0%' }}>
            { genesisPercent ? genesisPercent : 0}% Genesis Legion
          </div>
          <div style={{ width: treasurePercent ? treasurePercent.toFixed(0) + '%' :'0%' }}>
          { treasurePercent ? treasurePercent : 0}% Treasures
          </div>
        </div>
        <div className="py-6 grid xl:grid-cols-6 gap-4">
          <div className="col-span-1 gra-019380 rounded-lg border-2 border-019380">
            <div className="m-1">NFT boost</div>
            <div className="m-3 flex gap-4 text-2xl">{bridgeWorldData.data ? bridgeWorldData.data.user.boost*100 : 0}%</div>
          </div>
          <div className="col-span-1 bg-0F0F37 rounded-lg border-2 border-7B61FF">
            <div className="m-1">Mining power</div>
            <div className="m-3 flex gap-4 text-2xl">{readableNumber(totalMiningPower, 4)}</div>
          </div>
          <div className="col-span-1 bg-0F0F37 rounded-lg border-2 border-7B61FF">
            <div className="m-1">Share of mine</div>
            <div className="m-3 flex gap-4 text-2xl">{shareOfmine.toFixed(3)}%</div>
          </div>
        </div>
        <div className="my-4 grid 2xl:grid-cols-7 xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 gap-6 justify-self-center">
          {bridgeWorldData.data && stakedNfts.map((tokens: any, index: number) => {
            return <div key={index} className="col-span-1 flex flex-col justify-self-center">
              <img src={tokens.token.image.replace("ipfs://", "https://ipfs.io/ipfs/")} alt="a" />
              <div className="py-4">
                {tokens.token.metadata.role ?  `${tokens.token.name} - ${tokens.token.metadata.role}` : tokens.token.name}
                <div className="flex justify-between">
                  <div>Boost</div>
                  <div>{(tokens.token.metadata.boost * tokens.quantity * 100).toFixed(2)}%</div>
                </div>
              </div>
            </div>
          })}
        </div>
      </div>
    </>
  )
}
