import type { SparePart } from "../../../types/Admin";

type LowStockWarningProps = {
  parts: SparePart[];
  buttonText: string;
  onButtonClick: () => void;
};

function LowStockWarning({
  parts,
  buttonText,
  onButtonClick,
}: LowStockWarningProps) {
  if (parts.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-amber-500/10 border border-amber-500/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        <span className="text-2xl">
          🚨
        </span>

        <div className="space-y-2">
          <div>
            <h3 className="font-bold text-amber-400 text-sm sm:text-base">
              Low Stock Refill Warning
            </h3>

            <p className="text-xs text-slate-300">
              {parts.length} product(s) reached or
              fell below 10 units. Please restock
              immediately:
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {parts.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-amber-500/40 rounded-lg text-xs font-semibold text-white"
              >
                <span>{item.name}</span>

                <span className="text-red-400 font-bold">
                  ({item.quantityInStock} left)
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onButtonClick}
        className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer self-start sm:self-center shrink-0"
      >
        {buttonText}
      </button>
    </div>
  );
}

export default LowStockWarning;