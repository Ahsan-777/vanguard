import type { SaleRecord } from "../../types/Admin";
import { useState, useMemo } from "react";

type SalesHistoryProps = {
  salesHistory: SaleRecord[];
  salesLoading: boolean;
  onRefresh: () => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  onResetDates: () => void;
};

function SalesHistory({
  salesHistory,
  salesLoading,
  onRefresh,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onResetDates,
}: SalesHistoryProps) {
  const [searchProduct, setSearchProduct] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleOpenPdf = () => {
    const token = localStorage.getItem("token");
    let pdfUrl = `http://localhost:5038/api/salesrecords/report/pdf?token=${token}`;

    if (selectedType !== "All") {
      pdfUrl += `&itemType=${encodeURIComponent(selectedType)}`;
    }

    if (searchProduct.trim()) {
      pdfUrl += `&productName=${encodeURIComponent(searchProduct.trim())}`;
    }

    if (startDate) {
      pdfUrl += `&startDate=${encodeURIComponent(startDate)}`;
    }

    if (endDate) {
      pdfUrl += `&endDate=${encodeURIComponent(endDate)}`;
    }

    window.open(pdfUrl, "_blank");
  };

  // 1. FILTER SALES HISTORY
  const filteredSales = useMemo(() => {
    return salesHistory.filter((sale: any) => {
      const itemType =
        sale.itemType ||
        sale.type ||
        (sale.carId ? "Car" : sale.partId ? "SparePart" : "N/A");

      const matchesType =
        selectedType === "All" ||
        itemType.toLowerCase() === selectedType.toLowerCase();

      const productName =
        sale.productName ||
        sale.carName ||
        `${sale.make || ""} ${sale.model || ""}`.trim();

      const matchesProduct =
        !searchProduct.trim() ||
        productName
          .toLowerCase()
          .includes(searchProduct.trim().toLowerCase());

      return matchesType && matchesProduct;
    });
  }, [salesHistory, selectedType, searchProduct]);

  // 2. PAGINATION CALCULATIONS
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSales = filteredSales.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to page 1 whenever filters change
  const handleFilterTypeChange = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchProduct(query);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & TOP CONTROLS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/80 p-4 border border-slate-800 rounded-2xl">
        <h2 className="text-xl font-bold text-amber-400">
          Sales History Ledger
        </h2>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* FROM DATE */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            />
          </div>

          {/* TO DATE */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={() => {
                onResetDates();
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs text-white rounded-xl focus:outline-none bg-slate-700 hover:text-amber-300 font-semibold cursor-pointer"
            >
              Reset Dates
            </button>
          )}

          {/* TYPE FILTER */}
          <select
            value={selectedType}
            onChange={(e) => handleFilterTypeChange(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="All">All Items</option>
            <option value="Car">Cars</option>
            <option value="SparePart">Spare Parts</option>
          </select>

          {/* PDF BUTTON */}
          <button
            onClick={handleOpenPdf}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white border border-emerald-500 rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            📄 View PDF Report
          </button>

          {/* REFRESH BUTTON */}
          <button
            onClick={onRefresh}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 rounded-xl transition cursor-pointer"
          >
            🔄
          </button>

          {/* SEARCH INPUT */}
          <input
            type="text"
            placeholder="Filter by Product Name..."
            value={searchProduct}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="px-3 py-2 w-full lg:w-48 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-x-auto">
        {salesLoading ? (
          <p className="text-center py-12 text-slate-400">
            Loading sales records...
          </p>
        ) : filteredSales.length === 0 ? (
          <p className="text-center py-12 text-slate-400">
            No sales transactions found.
          </p>
        ) : (
          <>
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Item Type</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Sale Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800 text-sm">
                {paginatedSales.map((sale: any) => {
                  const productName =
                    sale.productName ||
                    sale.carName ||
                    `${sale.make || ""} ${sale.model || ""}`.trim() ||
                    "N/A";

                  const totalAmount =
                    sale.totalAmount ?? sale.salePrice ?? 0;

                  const itemType =
                    sale.itemType ||
                    sale.type ||
                    (sale.carId ? "Car" : sale.partId ? "SparePart" : "N/A");

                  return (
                    <tr
                      key={sale.id}
                      className="hover:bg-slate-800/40 transition"
                    >
                      <td className="p-3 font-mono text-xs text-slate-500">
                        #{sale.id}
                      </td>

                      <td className="p-3 font-semibold text-amber-400">
                        {itemType}
                      </td>

                      <td className="p-3 font-medium text-white">
                        {productName}
                      </td>

                      <td className="p-3 text-slate-300">
                        {sale.quantity ?? 1}
                      </td>

                      <td className="p-3 text-emerald-400 font-bold">
                        ${Number(totalAmount).toLocaleString()}
                      </td>

                      <td className="p-3 text-slate-200">
                        {sale.customerName || sale.buyerName || "N/A"}
                      </td>

                      <td className="p-3 text-slate-400">
                        {sale.phone || sale.customerPhone || "N/A"}
                      </td>

                      <td className="p-3 text-xs text-slate-400 whitespace-nowrap">
                        {sale.saleDate
                          ? new Date(sale.saleDate).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* PAGINATION FOOTER */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
              {/* PAGE SIZE SELECTOR & ITEM COUNT */}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  Show:
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  per page
                </span>

                <span>
                  Showing{" "}
                  <strong className="text-white">
                    {startIndex + 1}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-white">
                    {Math.min(
                      startIndex + itemsPerPage,
                      filteredSales.length
                    )}
                  </strong>{" "}
                  of{" "}
                  <strong className="text-white">
                    {filteredSales.length}
                  </strong>{" "}
                  entries
                </span>
              </div>

              {/* NAVIGATION BUTTONS */}
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition font-medium"
                >
                  Previous
                </button>

                <span className="px-3 py-1 text-white font-semibold bg-slate-950 border border-slate-800 rounded-lg">
                  {currentPage} / {totalPages}
                </span>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SalesHistory;