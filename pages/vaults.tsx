import React, { useMemo, useState } from "react";
import { Chart, ArcElement } from "chart.js";
Chart.register(ArcElement);
import Vault from "../components/Vault";
import { DashboardContract } from "../lib/types";

export default function Vaults() {
  const [tab, setTab] = useState("v1");

  return (
    <>
      <div className="p-8 text-6xl font-semibold gra-title">Vaults</div>
      <div className="flex">
        <button
          className={`px-6 pt-4 text-3xl cursor-pointer ${
            tab === "v1" ? "text-[#7B61FF] underline underline-offset-[12px]" : ""
          }`}
          onClick={() => setTab("v1")}
        >
          V1 Vault
        </button>
        <button
          className={`px-6 pt-4 text-3xl cursor-pointer ${
            tab === "v2" ? "text-[#7B61FF] underline underline-offset-[12px]" : ""
          }`}
          onClick={() => setTab("v2")}
        >
          V2 Vault
        </button>
      </div>

      {tab === "v1" && <Vault key="V1" name="V1" supply={220} vaultContractName={DashboardContract.FounderVaultV1} />}
      {tab === "v2" && <Vault key="V2" name="V2" supply={2105} vaultContractName={DashboardContract.FounderVaultV2} />}
    </>
  );
}
