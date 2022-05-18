import React, { useEffect, useMemo, useState } from "react";
import mLogo from "../assets/images/m.svg";

const FlywheelEmissions = () => {
  const [emissions, setEmissions] = useState("day");
  return (
    <div className=" col-span-12 md:col-span-7 md:pl-12 relative">
      <div className="absolute w-full h-full z-[1] bg-opacity-60 bg-black"></div>
      <div className="text-xl mt-5">Flywheel emissions</div>
      <div className="gra-3777FF rounded-lg border-2 border-7B61FF mt-4 p-2">
        <div className="flex justify-between">
          <div className="my-1 mx-3">Your emissions</div>
          <div className="m-1 flex items-center justify-center">
            <div
              className="inline-flex shadow-md hover:shadow-lg focus:shadow-lg border-2 border-019380 rounded-md"
              role="group"
            >
              <button
                className={`px-3 py-1 ${
                  emissions === "hour" ? "bg-3777FF" : "bg-0A58FF"
                } font-medium text-xs rounded-l-md`}
                onClick={() => setEmissions("hour")}
              >
                1H
              </button>
              <button
                className={`px-3 py-1 ${
                  emissions === "day" ? "bg-3777FF" : "bg-0A58FF"
                } font-medium text-xs bg-0A58FF`}
                onClick={() => setEmissions("day")}
              >
                1D
              </button>
              <button
                className={`px-3 py-1 ${
                  emissions === "week" ? "bg-3777FF" : "bg-0A58FF"
                } font-medium text-xs bg-0A58FF`}
                onClick={() => setEmissions("week")}
              >
                1W
              </button>
              <button
                className={`px-3 py-1 ${
                  emissions === "year" ? "bg-3777FF" : "bg-0A58FF"
                } font-medium text-xs rounded-r-md bg-0A58FF`}
                onClick={() => setEmissions("year")}
              >
                1Y
              </button>
            </div>
          </div>
        </div>
        <div className="m-3 flex gap-4 text-2xl">
          <img src={mLogo.src} alt="a" />
          --
        </div>
      </div>

      <div
        tabIndex={0}
        className="mt-4 collapse collapse-arrow border-2 border-7B61FF rounded-md"
      >
        <input checked type="checkbox"></input>
        <div className="collapse-title text-base">Flywheel stake</div>
        <div className="collapse-content">
          <div className="mt-6">Amount to stake</div>
          <div className="font-thin mt-4">-- MAGIC available to stake</div>
          <div className="flex mt-4 relative">
            <div className="absolute right-[76px] top-[50%] translate-y-[-50%]">
              $MAGIC
            </div>
            <input
              type="number"
              placeholder="Enter amount"
              className="border-r-0 bg-[#0F0F37] pr-[76px] placeholder:text-white placeholder:text-base text-base w-full input focus:outline-none rounded-r-none "
            ></input>
            <button className="btn btn-primary rounded-l-none normal-case text-base">
              Max
            </button>
          </div>

          <div className="mt-6">Time to lock for:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="rounded-md p-4 bg-[#0F0F37] cursor-pointer flex align-middle  md:order-1">
              <div className="flex align-middle">
                <input
                  type="checkbox"
                  // checked={true}
                  className="checkbox checkbox-accent rounded-full m-auto bg-white border-2"
                ></input>
                <div className="ml-6 w-full m-auto">
                  <div className="text-base">2 Weeks</div>
                </div>
              </div>
            </div>

            <div className="rounded-md p-4 bg-[#0F0F37] cursor-pointer flex align-middle  md:order-3">
              <div className="flex align-middle">
                <input
                  type="checkbox"
                  // checked={true}
                  className="checkbox checkbox-accent rounded-full m-auto bg-white border-2"
                ></input>
                <div className="ml-6 w-full m-auto">
                  <div className="text-base">1 Month</div>

                  <div className="text-sm font-thin mt-2">
                    Released over 7 days from unlock
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md p-4 bg-[#0F0F37] cursor-pointer flex align-middle md:order-5">
              <div className="flex align-middle">
                <input
                  type="checkbox"
                  // checked={true}
                  className="checkbox checkbox-accent rounded-full m-auto bg-white border-2"
                ></input>
                <div className="ml-6 w-full m-auto">
                  <div className="text-base">6 Months</div>

                  <div className="text-sm font-thin mt-2">
                    Released over 7 days from unlock
                  </div>
                </div>
              </div>
            </div>


            <div className="rounded-md p-4 bg-[#0F0F37] cursor-pointer flex align-middle md:order-2">
              <div className="flex align-middle">
                <input
                  type="checkbox"
                  // checked={true}
                  className="checkbox checkbox-accent rounded-full m-auto bg-white border-2"
                ></input>
                <div className="ml-6 w-full m-auto">
                  <div className="text-base">12 Months</div>

                  <div className="text-sm font-thin mt-2">
                    Released over 7 days from unlock
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md p-4 bg-[#0F0F37] cursor-pointer md:order-4">
              <div className="flex align-middle">
                <input
                  type="checkbox"
                  // checked={true}
                  className="checkbox checkbox-accent rounded-full m-auto bg-white border-2"
                ></input>
                <div className="ml-6 w-full">
                  <div className="text-base">Custom</div>
                  <div className="text-sm text-warning mt-2">
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
                    Stake in 2 week increments only
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex md:justify-end mt-4">
            <button className="btn btn-accent normal-case text-base text-white">
              Stake Magic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export {FlywheelEmissions};