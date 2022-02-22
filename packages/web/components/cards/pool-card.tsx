import { ObservablePool } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import { PoolAssetsIcon } from "../assets";
import { MetricLoader } from "../loaders";
import { PoolMetric } from "./types";

export const PoolCard: FunctionComponent<{
  pool: ObservablePool;
  poolMetrics: PoolMetric[];
}> = observer(({ pool, poolMetrics }) => {
  const router = useRouter();
  const poolTitle =
    pool.poolAssets.length >= 3
      ? `${pool.poolAssets.length} Token Pool`
      : pool.poolAssets
          .map((asset) => asset.amount.currency.coinDenom)
          .join(" / ");

  return (
    <div
      className="w-[22.563rem] h-[12.938rem] px-[1.875rem] pt-8 pb-6 bg-card rounded-2xl cursor-pointer hover:ring-1 hover:ring-enabledGold"
      onClick={() => router.push(`/pools/${pool.id}`)}
    >
      <div className="flex items-center">
        <PoolAssetsIcon assets={pool.poolAssets} size="md" />
        <div className="ml-4 flex flex-col">
          {poolTitle.length > 12 ? <h6>{poolTitle}</h6> : <h5>{poolTitle}</h5>}
          <div className="subtitle2 text-white-mid">{`Pool #${pool.id}`}</div>
        </div>
      </div>
      <div className="mt-5 mb-3 w-full bg-secondary-200 h-[1px]" />
      <div className="flex flex-nowrap gap-x-8 place-content-between">
        {poolMetrics.map((poolMetric, index) => (
          <div key={index} className="flex flex-col">
            <div className="subtitle2 text-white-disabled">
              {poolMetric.label}
            </div>
            <MetricLoader isLoading={poolMetric.isLoading}>
              <div className="mt-0.5 subtitle1 text-white-high">
                {poolMetric.value}
              </div>
            </MetricLoader>
          </div>
        ))}
      </div>
    </div>
  );
});
