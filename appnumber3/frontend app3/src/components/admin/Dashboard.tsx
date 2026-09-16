import type { SparePart } from "../../types/Admin";
import LowStockWarning from "./common/LowStockWarning";

type DashboardProps = {
  totalActiveInventoryCost: number;
  totalCarsSoldCost: number;
  totalProfitEarned: number;
  availableCarsCount: number;
  soldCarsCount: number;
  lowStockParts: SparePart[];
  onGoToParts: () => void;
  // Estimated Profit Metrics
  currentMonthRevenue: number;
  estimatedNextMonthRevenue: number;
  estimatedNextMonthProfit: number;
};

function Dashboard({
  totalActiveInventoryCost,
  totalCarsSoldCost,
  totalProfitEarned,
  availableCarsCount,
  soldCarsCount,
  lowStockParts,
  onGoToParts,
  currentMonthRevenue,
  estimatedNextMonthRevenue,
  estimatedNextMonthProfit,
}: DashboardProps) {
  return (
    <div className="space-y-8">
      {/* =====================================================
          ESTIMATED NEXT MONTH PROFIT METRICS
      ===================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Month Sales */}
        <div className="p-6 bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-xl backdrop-blur-md">
          <p className="text-slate-400 font-medium text-xs tracking-wider uppercase">
            Current Month Sales
          </p>

          <h3 className="text-3xl font-extrabold text-white mt-2">
            $
            {currentMonthRevenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h3>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
            <span>Status:</span>
            <span className="font-bold text-amber-400">Actual (This Month)</span>
          </div>
        </div>

        {/* Projected Next Month Sales */}
        <div className="p-6 bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-xl backdrop-blur-md">
          <p className="text-slate-400 font-medium text-xs tracking-wider uppercase">
            Expected Next Month Sales
          </p>

          <h3 className="text-3xl font-extrabold text-amber-400 mt-2">
            $
            {Math.round(estimatedNextMonthRevenue).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h3>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
            <span>Growth Assumption:</span>
            <span className="font-bold text-amber-300">+5% Projected</span>
          </div>
        </div>

        {/* Estimated Next Month Profit */}
        <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900/80 border border-emerald-500/40 rounded-2xl shadow-xl backdrop-blur-md">
          <p className="text-emerald-400 font-medium text-xs tracking-wider uppercase">
            Estimated Next Month Profit
          </p>

          <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
            $
            {Math.round(estimatedNextMonthProfit).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h3>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
            <span>Expected Margin:</span>
            <span className="font-bold text-emerald-300">30% Profit Rate</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          HISTORICAL OVERVIEW METRICS
      ===================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Active Stock */}
        <div className="p-6 bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-xl backdrop-blur-md">
          <p className="text-slate-400 font-medium text-xs tracking-wider uppercase">
            Total Active Stock Value
          </p>

          <h3 className="text-3xl font-extrabold text-blue-400 mt-2">
            $
            {totalActiveInventoryCost.toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </h3>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
            <span>Available Units:</span>

            <span className="font-bold text-white">
              {availableCarsCount} Cars
            </span>
          </div>
        </div>

        {/* Sold Revenue */}
        <div className="p-6 bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-xl backdrop-blur-md">
          <p className="text-slate-400 font-medium text-xs tracking-wider uppercase">
            Total Cars Sold Revenue
          </p>

          <h3 className="text-3xl font-extrabold text-amber-400 mt-2">
            $
            {totalCarsSoldCost.toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </h3>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
            <span>Sold Units:</span>

            <span className="font-bold text-white">
              {soldCarsCount} Cars
            </span>
          </div>
        </div>

        {/* Profit */}
        <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900/80 border border-emerald-500/40 rounded-2xl shadow-xl backdrop-blur-md">
          <p className="text-emerald-400 font-medium text-xs tracking-wider uppercase">
            Total Profit (30% Fixed)
          </p>

          <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
            $
            {totalProfitEarned.toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </h3>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
            <span>Margin Rate:</span>

            <span className="font-bold text-emerald-300">
              30% per sale
            </span>
          </div>
        </div>
      </div>

      <LowStockWarning
        parts={lowStockParts}
        buttonText="Refill Product"
        onButtonClick={onGoToParts}
      />
    </div>
  );
}

export default Dashboard;