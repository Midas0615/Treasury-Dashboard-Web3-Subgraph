import mLogo from "../assets/images/m.svg";



export default function Partners() {
  
  return (
    <>
      <div className="p-8 text-6xl font-semibold gra-title">Flywhell</div>

      <div className="px-6 pt-4 text-4xl">Smolove</div>
      <div className="px-6">
        <div className="py-6 text-xl">Toptal Staked</div>
        <div className="flex py-4 justify-between">
          <div style={{ width: "70%" }} className="flex justify-between">
            <div className="">
              <div className="text-xs">TOTAL AS OF 4/11/2022</div>
              <p className="flex gap-1 text-lg font-semibold">
                <img src={mLogo.src} alt="a" />
                500,000
              </p>
            </div>
            <div className="">
              <div className="text-xs">6 WEEK LOCK</div>
              <p className="flex gap-1 text-lg font-semibold">
                <img src={mLogo.src} alt="a" />
                40,000
              </p>
            </div>
          </div>
          <div style={{ width: "30%" }} className="flex pl-6 justify-between">
            <div className="">
              <div className="text-sm">2 WEEK LOCK</div>
              <p className="flex gap-1 text-lg font-semibold">
                <img src={mLogo.src} alt="a" />
                10,000
              </p>
            </div>
            <div className="">
              <div className="text-sm">1 YEAR LOCK</div>
              <p className="flex gap-1 text-lg font-semibold">
                <img src={mLogo.src} alt="a" />
                1,000
              </p>
            </div>
          </div>
        </div>
        <div className="w-full bg-7D77FC h-10 mb-6 rounded-lg">
          <div className="bg-4A3EE4 h-10 rounded-l-lg" style={{ width: "70%" }}>
            <div
              className="bg-2500E0 h-10 rounded-l-lg"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>
        <div className="text-lg">67% Genesis Legion</div>
        <div className="py-6 grid xl:grid-cols-5 gap-4">
          <div className="col-span-1 gra-019380 rounded-lg border-2 border-7B61FF">
            <div className="m-1">Player APR</div>
            <div className="m-3 flex gap-4 font-semibold text-2xl">
              <img src={mLogo.src} alt="a" />
              50.78%
            </div>
          </div>
          <div className="col-span-1 bg-0F0F37 rounded-lg border-2 border-7B61FF">
            <div className="m-1">Assumed lock</div>
            <div className="m-3 flex gap-4 text-2xl">2 weeks</div>
          </div>
          <div className="col-span-1 bg-0F0F37 rounded-lg border-2 border-7B61FF">
            <div className="m-1">Players in the game</div>
            <div className="m-3 flex gap-4 text-2xl">10,000</div>
          </div>
          <div className="col-span-1 bg-0F0F37 rounded-lg border-2 border-7B61FF">
            <div className="m-1">Magic per player</div>
            <div className="m-3 flex gap-4 text-2xl">
              <img src={mLogo.src} alt="a" />
              50
            </div>
          </div>
          <div className="col-span-1 bg-0F0F37 rounded-lg border-2 border-7B61FF">
            <div className="m-1">Magic per user</div>
            <div className="m-3 flex gap-4 text-2xl">
              <img src={mLogo.src} alt="a" />
              0.98
            </div>
          </div>
        </div>
        <div className="py-6 grid xl:grid-cols-6 gap-4">
          <div className="col-span-2 gra-3777FF rounded-lg border-2 border-7B61FF">
            <div className="m-1">Partner magic deposit</div>
            <div className="m-3 flex gap-4 font-semibold text-2xl">
              <img src={mLogo.src} alt="a" />
              1,219.40
            </div>
          </div>
          <div className="col-span-2 gra-3777FF rounded-lg border-2 border-7B61FF">
            <div className="m-1">2 week emissions</div>
            <div className="m-3 flex gap-4 font-semibold text-2xl">
              <img src={mLogo.src} alt="a" />
              12,194.04
            </div>
          </div>
          <div className="col-span-1 bg-0F0F37 rounded-lg border-2 border-7B61FF">
            <div className="m-1">BattleFly cut</div>
            <div className="m-3 flex gap-4 text-2xl">10%</div>
          </div>
          <div className="col-span-1 bg-0F0F37 rounded-lg border-2 border-7B61FF">
            <div className="m-1">Partner cut</div>
            <div className="m-3 flex gap-4 text-2xl">10%</div>
          </div>
        </div>
        <div className="gra-019380 rounded-lg border-2 border-019380">
          <div className="m-3 flex justify-between">
            <div>Partner Magic yield</div>
            <div className="flex items-center justify-center">
              <div
                className="inline-flex shadow-md hover:shadow-lg focus:shadow-lg border border-019380 rounded-md"
                role="group"
              >
                <a
                  className="px-3 py-1 bg-015247 font-medium text-xs rounded-l-md"
                  href="#"
                >
                  1H
                </a>
                <a className="px-3 py-1 bg-015247 font-medium text-xs" href="#">
                  1D
                </a>
                <a className="px-3 py-1 bg-015247 font-medium text-xs" href="#">
                  1W
                </a>
                <a className="px-3 py-1 bg-015247 font-medium text-xs" href="#">
                  1M
                </a>
                <a
                  className="px-3 py-1 bg-019380 font-medium text-xs rounded-r-md"
                  href="#"
                >
                  1Y
                </a>
              </div>
            </div>
          </div>
          <div className="m-3 flex gap-4 text-2xl">
            <img src={mLogo.src} alt="a" />
            31791.60
          </div>
          <div className="m-3">
            <div>Partner USD yield</div>
            <div className="my-3 flex gap-4 text-2xl">$124,791.60</div>
          </div>
        </div>
        <div className="pt-6 grid xl:grid-cols-5">
          <button className="col-span-1 py-4 text-lg bg-7B61FF rounded-lg">
            Claim
          </button>
        </div>
      </div>
    </>
  );
}
