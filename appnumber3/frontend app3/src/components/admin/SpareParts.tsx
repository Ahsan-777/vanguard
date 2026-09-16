import type { SparePart } from "../../types/Admin";
import LowStockWarning from "./common/LowStockWarning";

type SparePartsProps = {
  parts: SparePart[];
  partsLoading: boolean;
  partsQuery: string;
  totalPartsValue: number;
  totalUnitsStocked: number;
  totalSoldPartsRevenue: number;
  totalCategoriesCount: number;
  lowStockParts: SparePart[];
  onQueryChange: (value: string) => void;
  onAddPart: () => void;
  onClearSearch: () => void;
  onViewSalesHistory: () => void;
};

function SpareParts({
  parts,
  partsLoading,
  partsQuery,
  totalPartsValue,
  totalUnitsStocked,
  totalSoldPartsRevenue,
  totalCategoriesCount,
  lowStockParts,
  onQueryChange,
  onAddPart,
  onClearSearch,
  onViewSalesHistory,
}: SparePartsProps) {
  return (
    <>
      {/* PORTFOLIO */}

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="sm:p-6 p-3 bg-gradient-to-r from-amber-900/40 via-slate-900/80 to-slate-900/80 border border-amber-500/30 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-amber-400 font-semibold text-xs tracking-wider uppercase">
              Spare Parts Stock Value
            </p>

            <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">
              $
              {totalPartsValue.toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </h3>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 sm:px-3 py-1.5 rounded-xl text-emerald-300 font-medium text-xs">
            Categories: {totalCategoriesCount}
          </div>
        </div>

        <div className="sm:p-6 p-3 bg-gradient-to-r from-slate-900/80 via-slate-900/80 to-amber-950/40 border border-amber-500/30 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-amber-400 font-semibold text-xs tracking-wider uppercase">
              Total Units Stocked
            </p>

            <h3 className="text-3xl font-extrabold text-white mt-1">
              {totalUnitsStocked}
            </h3>

            <p className="text-xs text-amber-400/90 mt-2 font-medium">
              Sold Revenue:{" "}
              <span className="font-bold text-emerald-400">
                $
                {totalSoldPartsRevenue.toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </span>
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-amber-300 font-medium text-xs">
            Physical Inventory
          </div>
        </div>
      </div>

      <LowStockWarning
        parts={lowStockParts}
        buttonText="📋 View Sales History"
        onButtonClick={onViewSalesHistory}
      />

      {/* SEARCH */}

      <div className="mb-6 flex gap-3 bg-gray-900/80 p-3 rounded-2xl border border-slate-700/60 backdrop-blur-md">

        <input
          type="text"
          placeholder=" Search spare parts by name..."
          value={partsQuery}
          onChange={(e) =>
            onQueryChange(e.target.value)
          }
          className="flex-1 sm:px-4 sm:py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
        />

        <button
          onClick={onAddPart}
          className="sm:py-3 sm:px-6 px-2 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition cursor-pointer"
        >
          <span className="hidden sm:block">
            + Add Spare Part
          </span>

          <span className="block sm:hidden">
            + Parts
          </span>
        </button>

        {partsQuery && (
          <button
            onClick={onClearSearch}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-semibold transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* TABLE */}

      {partsLoading ? (
        <p className="text-center text-slate-400 py-12">
          Loading spare parts...
        </p>
      ) : parts.length === 0 ? (
        <p className="text-center text-slate-400 py-12">
          No spare parts found in stock.
        </p>
      ) : (
        <div className="bg-gray-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl overflow-x-auto shadow-xl">

          <table className="w-full text-left text-sm text-slate-300">

            <thead className="bg-slate-800/80 text-slate-400 uppercase text-xs">
              <tr>
                <th className="p-4">
                  Item
                </th>

                <th className="p-4">
                  SKU / Part #
                </th>

                <th className="p-4">
                  Category
                </th>

                <th className="p-4">
                  Compatible Models
                </th>

                <th className="p-4">
                  Price
                </th>

                <th className="p-4">
                  In Stock
                </th>

                <th className="p-4 text-center">
                  Units Sold
                </th>
              </tr>
            </thead>

            <tbody>
              {parts.map((part) => (
                <tr
                  key={part.id}
                  className="border-t border-slate-800/80 hover:bg-slate-800/40"
                >
                  <td className="p-4 font-bold text-white flex items-center gap-3">
                    <img
                      src={
                        part.imageUrl ||
                        "/explore.jpeg"
                      }
                      alt={part.name}
                      className="w-10 h-10 object-cover hidden sm:block rounded-lg border border-slate-700"
                    />

                    {part.name}
                  </td>

                  <td className="p-4 font-mono text-xs text-slate-400">
                    {part.partNumber}
                  </td>

                  <td className="p-4">
                    {part.category}
                  </td>

                  <td className="p-4 text-xs text-slate-400">
                    {part.compatibleModels ||
                      "Universal"}
                  </td>

                  <td className="p-4 font-bold text-amber-500">
                    $
                    {part.price.toLocaleString()}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        part.quantityInStock > 0
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {part.quantityInStock}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {part.soldQuantity || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </>
  );
}

export default SpareParts;