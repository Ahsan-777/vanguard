type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (
    page: number
  ) => void;
};

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/60">
      <button
        disabled={currentPage === 1}
        onClick={() =>
          onPageChange(
            Math.max(currentPage - 1, 1)
          )
        }
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 rounded-xl text-xs font-semibold text-white transition cursor-pointer"
      >
        ← Previous
      </button>

      <span className="text-xs text-slate-400 font-medium">
        Page{" "}
        <strong className="text-amber-400">
          {currentPage}
        </strong>{" "}
        of{" "}
        <strong className="text-white">
          {totalPages}
        </strong>
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() =>
          onPageChange(
            Math.min(
              currentPage + 1,
              totalPages
            )
          )
        }
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 rounded-xl text-xs font-semibold text-white transition cursor-pointer"
      >
        Next →
      </button>
    </div>
  );
}

export default Pagination;