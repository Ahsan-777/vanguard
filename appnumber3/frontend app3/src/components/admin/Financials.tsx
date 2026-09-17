// import type { Car } from "../../types/Admin";
// import Pagination from "./common/Pagination";

// type FinancialsProps = {
//   cars: Car[];
//   paginatedCars: Car[];
//   loading: boolean;
//   currentPage: number;
//   totalPages: number;
//   totalActiveInventoryCost: number;
//   totalCarsSoldCost: number;
//   totalProfitEarned: number;
//   availableCarsCount: number;
//   soldCarsCount: number;
//   onPageChange: (page: number) => void;
// };

// function Financials({
//   cars,
//   paginatedCars,
//   loading,
//   currentPage,
//   totalPages,
//   totalActiveInventoryCost,
//   totalCarsSoldCost,
//   totalProfitEarned,
//   availableCarsCount,
//   soldCarsCount,
//   onPageChange,
// }: FinancialsProps) {
//   return (
//     <div className="space-y-8">

//       <div className="mb-2 flex flex-row gap-40">
//         <div className="flex flex-col">
//         <h2 className="sm:text-3xl font-bold text-amber-500">
//           Financial Ledger & Accounts
//         </h2>

//         <p className="text-slate-400 hidden sm:block text-sm mt-1">
//           Real-time breakdown of current stock, revenue,
//           unit counts, and profits (30% fixed margin
//           applied per vehicle).
//         </p>
//         </div>
//          <button
//             onClick={() => window.open("http://localhost:5038/api/accounts/report/view", "_blank")}
//             className="px-3 py-1 ml-18 h-[50px] bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white border border-emerald-500 rounded-xl transition cursor-pointer flex items-center gap-1.5"

//           >
//             <span className="block sm:hidden">📊 Report</span>
//             <span className="hidden sm:block ">📊 Accountant Report</span>
//           </button>
//       </div>

//       {/* KPI CARDS */}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

//         <div className="sm:p-6 p-3 bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-xl backdrop-blur-md">
//           <p className="text-slate-400 font-medium text-xs tracking-wider uppercase">
//             Total Active Stock Value
//           </p>

//           <h3 className="text-3xl font-extrabold text-blue-400 mt-2">
//             $
//             {totalActiveInventoryCost.toLocaleString(
//               undefined,
//               {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               }
//             )}
//           </h3>

//           <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
//             <span>Available Units:</span>

//             <span className="font-bold text-white">
//               {availableCarsCount} Cars
//             </span>
//           </div>
//         </div>

//         <div className="sm:p-6 p-3 bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-xl backdrop-blur-md">
//           <p className="text-slate-400 font-medium text-xs tracking-wider uppercase">
//             Total Cars Sold Revenue
//           </p>

//           <h3 className="text-3xl font-extrabold text-amber-400 mt-2">
//             $
//             {totalCarsSoldCost.toLocaleString(
//               undefined,
//               {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               }
//             )}
//           </h3>

//           <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
//             <span>Sold Units:</span>

//             <span className="font-bold text-white">
//               {soldCarsCount} Cars
//             </span>
//           </div>
//         </div>

//         <div className="sm:p-6 p-3 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900/80 border border-emerald-500/40 rounded-2xl shadow-xl backdrop-blur-md">
//           <p className="text-emerald-400 font-medium text-xs tracking-wider uppercase">
//             Total Profit (30% Fixed)
//           </p>

//           <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
//             $
//             {totalProfitEarned.toLocaleString(
//               undefined,
//               {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//               }
//             )}
//           </h3>

//           <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
//             <span>Profit Margin:</span>

//             <span className="font-bold text-emerald-300">
//               30% per vehicle
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* LEDGER */}

//       <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl sm:p-6 p-3 shadow-2xl backdrop-blur-md">

//         <h3 className="text-xl font-bold text-white mb-4">
//           Vehicle Cost & Profit Ledger
//         </h3>

//         {loading ? (
//           <p className="text-center text-slate-400 py-8">
//             Loading accounting ledger...
//           </p>
//         ) : cars.length === 0 ? (
//           <p className="text-center text-slate-400 py-8">
//             No transaction records found.
//           </p>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse">

//                 <thead>
//                   <tr className="border-b border-slate-700/80 text-slate-400 text-xs uppercase tracking-wider">
//                     <th className="py-3 px-4">
//                       Vehicle
//                     </th>

//                     <th className="py-3 px-4">
//                       Status
//                     </th>

//                     <th className="py-3 px-4">
//                       Vehicle Price
//                     </th>

//                     <th className="py-3 px-4">
//                       30% Profit Portion
//                     </th>

//                     <th className="py-3 px-4">
//                       Base Cost (70%)
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody className="divide-y divide-slate-800 text-sm">
//                   {paginatedCars.map((car) => {
//                     const price =
//                       parseFloat(
//                         String(car.price)
//                       ) || 0;

//                     const carProfit =
//                       price * 0.3;

//                     const baseCost =
//                       price - carProfit;

//                     return (
//                       <tr
//                         key={car.id}
//                         className="hover:bg-slate-800/40 transition"
//                       >
//                         <td className="py-4 px-4 font-semibold text-white">
//                           {car.make}{" "}
//                           {car.model} ({car.year})
//                         </td>

//                         <td className="py-4 px-4">
//                           {car.isSold ? (
//                             <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-2.5 py-1 rounded-lg font-extrabold uppercase">
//                               Sold
//                             </span>
//                           ) : (
//                             <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs px-2.5 py-1 rounded-lg font-extrabold uppercase">
//                               Available
//                             </span>
//                           )}
//                         </td>

//                         <td className="py-4 px-4 font-bold text-white">
//                           $
//                           {price.toLocaleString()}
//                         </td>

//                         <td className="py-4 px-4 font-bold text-emerald-400">
//                           {car.isSold
//                             ? `$${carProfit.toLocaleString()}`
//                             : "$0.00 (Pending)"}
//                         </td>

//                         <td className="py-4 px-4 text-slate-400">
//                           $
//                           {baseCost.toLocaleString()}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>

//               </table>
//             </div>

//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={onPageChange}
//             />
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Financials;
import type { Car } from "../../types/Admin";
import Pagination from "./common/Pagination";

// Dynamic API base URL supporting both local environment and Vercel/Railway production
const API_BASE_URL = 
  (import.meta as any).env.VITE_API_URL || "http://localhost:5038/api";

type FinancialsProps = {
  cars: Car[];
  paginatedCars: Car[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalActiveInventoryCost: number;
  totalCarsSoldCost: number;
  totalProfitEarned: number;
  availableCarsCount: number;
  soldCarsCount: number;
  onPageChange: (page: number) => void;
};

function Financials({
  cars,
  paginatedCars,
  loading,
  currentPage,
  totalPages,
  totalActiveInventoryCost,
  totalCarsSoldCost,
  totalProfitEarned,
  availableCarsCount,
  soldCarsCount,
  onPageChange,
}: FinancialsProps) {
  return (
    <div className="space-y-8">

      <div className="mb-2 flex flex-row gap-40">
        <div className="flex flex-col">
        <h2 className="sm:text-3xl font-bold text-amber-500">
          Financial Ledger & Accounts
        </h2>

        <p className="text-slate-400 hidden sm:block text-sm mt-1">
          Real-time breakdown of current stock, revenue,
          unit counts, and profits (30% fixed margin
          applied per vehicle).
        </p>
        </div>
         <button
            onClick={() => window.open(`${API_BASE_URL}/accounts/report/Carview`, "_blank")}
            className="px-3 py-1 ml-18 h-[50px] bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white border border-emerald-500 rounded-xl transition cursor-pointer flex items-center gap-1.5"

          >
            <span className="block sm:hidden">📊 Report</span>
            <span className="hidden sm:block ">📊 Accountant Report</span>
          </button>
      </div>

      {/* KPI CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="sm:p-6 p-3 bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-xl backdrop-blur-md">
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

        <div className="sm:p-6 p-3 bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-xl backdrop-blur-md">
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

        <div className="sm:p-6 p-3 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900/80 border border-emerald-500/40 rounded-2xl shadow-xl backdrop-blur-md">
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
            <span>Profit Margin:</span>

            <span className="font-bold text-emerald-300">
              30% per vehicle
            </span>
          </div>
        </div>
      </div>

      {/* LEDGER */}

      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl sm:p-6 p-3 shadow-2xl backdrop-blur-md">

        <h3 className="text-xl font-bold text-white mb-4">
          Vehicle Cost & Profit Ledger
        </h3>

        {loading ? (
          <p className="text-center text-slate-400 py-8">
            Loading accounting ledger...
          </p>
        ) : cars.length === 0 ? (
          <p className="text-center text-slate-400 py-8">
            No transaction records found.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">

                <thead>
                  <tr className="border-b border-slate-700/80 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">
                      Vehicle
                    </th>

                    <th className="py-3 px-4">
                      Status
                    </th>

                    <th className="py-3 px-4">
                      Vehicle Price
                    </th>

                    <th className="py-3 px-4">
                      30% Profit Portion
                    </th>

                    <th className="py-3 px-4">
                      Base Cost (70%)
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 text-sm">
                  {paginatedCars.map((car) => {
                    const price =
                      parseFloat(
                        String(car.price)
                      ) || 0;

                    const carProfit =
                      price * 0.3;

                    const baseCost =
                      price - carProfit;

                    return (
                      <tr
                        key={car.id}
                        className="hover:bg-slate-800/40 transition"
                      >
                        <td className="py-4 px-4 font-semibold text-white">
                          {car.make}{" "}
                          {car.model} ({car.year})
                        </td>

                        <td className="py-4 px-4">
                          {car.isSold ? (
                            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-2.5 py-1 rounded-lg font-extrabold uppercase">
                              Sold
                            </span>
                          ) : (
                            <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs px-2.5 py-1 rounded-lg font-extrabold uppercase">
                              Available
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 font-bold text-white">
                          $
                          {price.toLocaleString()}
                        </td>

                        <td className="py-4 px-4 font-bold text-emerald-400">
                          {car.isSold
                            ? `$${carProfit.toLocaleString()}`
                            : "$0.00 (Pending)"}
                        </td>

                        <td className="py-4 px-4 text-slate-400">
                          $
                          {baseCost.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Financials;