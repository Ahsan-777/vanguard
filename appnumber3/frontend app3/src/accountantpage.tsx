import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SalesHistory from "./SalesHistory";

// Define the Car type matching API response
type Car = {
  id: number | string;
  make: string;
  model: string;
  year: number;
  price: number | string;
  mileage?: number;
  color?: string;
  engineSize?: string;
  transmission?: string;
  imageUrl?: string;
  isSold: boolean;
};

// Define the SparePart type matching API response
type SparePart = {
  id: number | string;
  name: string;
  partNumber: string;
  category: string;
  price: number;
  quantityInStock: number;
  soldQuantity: number;
  compatibleModels?: string;
  imageUrl?: string;
};

// Dynamic API URL for production (Vercel) & local development
const API_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:5038/api";

function AccountantPage() {
  const navigate = useNavigate();

  // State Hooks
  const [cars, setCars] = useState<Car[]>([]);
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"ledger" | "salesHistory">("ledger");
  
  // Pagination States (Limit 5)
  const ITEMS_PER_PAGE = 5;
  const [carsPage, setCarsPage] = useState<number>(1);
  const [partsPage, setPartsPage] = useState<number>(1);

  const fetchCarsAndParts = (): void => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/cars`).then((res) => res.json()),
      fetch(`${API_URL}/spareparts`).then((res) => res.json()),
    ])
      .then(([carsData, partsData]) => {
        if (Array.isArray(carsData)) {
          setCars(carsData);
        } else {
          setCars([]);
        }

        if (Array.isArray(partsData)) {
          setParts(partsData);
        } else {
          setParts([]);
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error("Error fetching financial data:", err);
        setCars([]);
        setParts([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCarsAndParts();
  }, []);

  // --- Financial Calculations: Vehicles ---
  const availableCars: Car[] = cars.filter((car) => !car.isSold);
  const totalActiveInventoryCost: number = availableCars.reduce(
    (sum, car) => sum + (parseFloat(String(car.price)) || 0),
    0
  );

  const soldCars: Car[] = cars.filter((car) => car.isSold);
  const totalCarsSoldCost: number = soldCars.reduce(
    (sum, car) => sum + (parseFloat(String(car.price)) || 0),
    0
  );

  const CAR_PROFIT_MARGIN = 0.30;
  const totalCarProfitEarned: number = totalCarsSoldCost * CAR_PROFIT_MARGIN;

  // --- Financial Calculations: Spare Parts ---
  const totalPartsStockValue: number = parts.reduce(
    (sum, part) => sum + part.price * part.quantityInStock,
    0
  );

  const totalPartsRevenue: number = parts.reduce(
    (sum, part) => sum + part.price * (part.soldQuantity || 0),
    0
  );

  const totalPartsUnitsSold: number = parts.reduce(
    (sum, part) => sum + (part.soldQuantity || 0),
    0
  );

  // --- Total Grand Summaries ---
  const grandTotalActiveStockValue: number =
    totalActiveInventoryCost + totalPartsStockValue;
  const grandTotalRevenue: number = totalCarsSoldCost + totalPartsRevenue;

  // --- Pagination Logic: Cars ---
  const totalCarsPages = Math.ceil(cars.length / ITEMS_PER_PAGE) || 1;
  const paginatedCars = cars.slice(
    (carsPage - 1) * ITEMS_PER_PAGE,
    carsPage * ITEMS_PER_PAGE
  );

  // --- Pagination Logic: Parts ---
  const totalPartsPages = Math.ceil(parts.length / ITEMS_PER_PAGE) || 1;
  const paginatedParts = parts.slice(
    (partsPage - 1) * ITEMS_PER_PAGE,
    partsPage * ITEMS_PER_PAGE
  );

  return (
    <div className="relative min-h-screen h-screen w-screen bg-black text-white overflow-y-auto">
      {/* Navigation Bar */}
      <nav className="fixed top-0 z-40 w-full px-8 py-5 bg-black/40 backdrop-blur-lg border-b border-white/10 flex items-center justify-between">
        <div className="w-24 hidden md:block" />
        
        <h1 className="text-2xl hidden md:block font-extrabold tracking-wider text-gray-200 uppercase text-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
          Vanguard Drive - Financial & Accounting Portal
        </h1>
        <h1 className="block md:hidden font-extrabold tracking-wider text-gray-200 uppercase text-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
          Vanguard Drive
        </h1>

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="ml-auto py-1 sm:py-2.5 px-4 sm:px-6 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-600/30 transition cursor-pointer"
        >
          <span className="hidden sm:block"> Logout</span>
          <p className="block sm:hidden ">⏻</p>
        </button>
      </nav>

      {/* Background Image & Overlay */}
      <img
        src="/explore.jpeg"
        alt="Background"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />
      <div className="fixed inset-0 bg-black/80 z-10 pointer-events-none" />

      {/* Main Content Area */}
      <main className="relative z-20 pt-28 pb-32 px-6 max-w-6xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-bold text-amber-500">
              Financial Ledger & Accounts
            </h2>
            <p className="text-slate-400 text-sm hidden sm:block mt-1">
              Real-time breakdown of current stock values, sold revenue, unit counts, and vehicle profit margins.
            </p>
          </div>
          <div>
            <button
              onClick={() => window.open(`${API_URL}/accounts/report/Carview`, "_blank")}
              className="sm:px-4 sm:py-2 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-orange-400 font-semibold text-sm rounded-xl transition cursor-pointer"
            >
              <span className="block sm:hidden">📊 Report</span>
              <span className="hidden sm:block">📊 View Accountant PDF Report</span>
            </button>
          </div>
        </div>

        {/* Navigation View Toggles */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeTab === "ledger"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                : "bg-slate-900/80 border border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            📈 Financial Ledger
          </button>
          <button
            onClick={() => setActiveTab("salesHistory")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeTab === "salesHistory"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                : "bg-slate-900/80 border border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            📋 Sales History
          </button>
        </div>

        {/* Conditionally Render Content Views */}
        {activeTab === "salesHistory" ? (
          <SalesHistory />
        ) : (
          <>
            {/* Combined Overall Summary Bar */}
            <div className="sm:p-6 p-4 mb-2 sm:mb-8 bg-gradient-to-r from-slate-900/90 via-amber-950/30 to-slate-900/90 border border-amber-500/40 rounded-2xl shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-amber-400 font-semibold text-xs tracking-wider uppercase">
                  Combined Total Active Stock Value
                </p>
                <h3 className="text-3xl font-extrabold text-white mt-1">
                  ${grandTotalActiveStockValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
              </div>
              <div>
                <p className="text-emerald-400 font-semibold text-xs tracking-wider uppercase">
                  Combined Total Sales Revenue
                </p>
                <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">
                  ${grandTotalRevenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
              </div>
            </div>

            {/* Vehicle KPI Summary Cards */}
            <h3 className="text-lg font-bold text-slate-300 mb-3 uppercase tracking-wider">
              Vehicle Finances
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 sm:mb-10">
              <div className="sm:p-6 p-4 bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-xl backdrop-blur-md">
                <p className="text-slate-400 font-medium text-xs tracking-wider uppercase">
                  Active Vehicle Stock Value
                </p>
                <h3 className="text-3xl font-extrabold text-blue-400 mt-2">
                  ${totalActiveInventoryCost.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                  <span>Available Units:</span>
                  <span className="font-bold text-white">{availableCars.length} Cars</span>
                </div>
              </div>

              <div className="sm:p-6 p-4 bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-xl backdrop-blur-md">
                <p className="text-slate-400 font-medium text-xs tracking-wider uppercase">
                  Cars Sold Revenue
                </p>
                <h3 className="text-3xl font-extrabold text-amber-400 mt-2">
                  ${totalCarsSoldCost.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                  <span>Sold Units:</span>
                  <span className="font-bold text-white">{soldCars.length} Cars</span>
                </div>
              </div>

              <div className="sm:p-6 p-4 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900/80 border border-emerald-500/40 rounded-2xl shadow-xl backdrop-blur-md">
                <p className="text-emerald-400 font-medium text-xs tracking-wider uppercase">
                  Vehicle Profit (30% Margin)
                </p>
                <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
                  ${totalCarProfitEarned.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h3>
                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs text-slate-300">
                  <span>Profit Margin:</span>
                  <span className="font-bold text-emerald-300">30% per vehicle</span>
                </div>
              </div>
            </div>

            {/* Spare Parts KPI Summary Cards */}
            <h3 className="text-lg font-bold text-slate-300 mb-3 uppercase tracking-wider">
              Spare Parts Finances
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="sm:p-6 p-4 bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between">
                <div>
                  <p className="text-slate-400 font-medium text-xs tracking-wider uppercase">
                    Parts Stock Value
                  </p>
                  <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
                    ${totalPartsStockValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h3>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-emerald-300 font-medium text-xs">
                  Categories: {parts.length}
                </div>
              </div>

              <div className="sm:p-6 p-4 bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between">
                <div>
                  <p className="text-slate-400 font-medium text-xs tracking-wider uppercase">
                    Parts Revenue Earned
                  </p>
                  <h3 className="text-3xl font-extrabold text-amber-400 mt-2">
                    ${totalPartsRevenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h3>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-amber-300 font-medium text-xs">
                  Units Sold: {totalPartsUnitsSold}
                </div>
              </div>
            </div>

            {/* Vehicle Financial Breakdown Table */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md mb-10">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
                Vehicle Cost & Profit Ledger
              </h3>

              {loading ? (
                <p className="text-center text-slate-400 py-8">Loading vehicle ledger...</p>
              ) : cars.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No vehicle transaction records found.</p>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {paginatedCars.map((car) => {
                      const price = parseFloat(String(car.price)) || 0;
                      const carProfit = price * CAR_PROFIT_MARGIN;
                      const baseCost = price - carProfit;
                      return (
                        <div key={car.id} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-white">
                                {car.make} {car.model} ({car.year})
                              </h4>
                            </div>
                            {car.isSold ? (
                              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-2.5 py-1 rounded-lg font-extrabold uppercase">
                                Sold
                              </span>
                            ) : (
                              <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs px-2.5 py-1 rounded-lg font-extrabold uppercase">
                                Available
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-700/50 pt-3">
                            <div>
                              <p className="text-slate-400">Vehicle Price</p>
                              <p className="font-bold text-white text-sm">${price.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">30% Profit Portion</p>
                              <p className="font-bold text-emerald-400 text-sm">
                                {car.isSold ? `$${carProfit.toLocaleString()}` : "$0.00"}
                              </p>
                            </div>
                            <div className="col-span-2 pt-1">
                              <p className="text-slate-400">Base Cost (70%)</p>
                              <p className="font-semibold text-slate-300">${baseCost.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop & Tablet Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-700/80 text-slate-400 text-xs uppercase tracking-wider">
                          <th className="py-3 px-4">Vehicle</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Vehicle Price</th>
                          <th className="py-3 px-4">30% Profit Portion</th>
                          <th className="py-3 px-4">Base Cost (70%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-sm">
                        {paginatedCars.map((car) => {
                          const price = parseFloat(String(car.price)) || 0;
                          const carProfit = price * CAR_PROFIT_MARGIN;
                          const baseCost = price - carProfit;
                          return (
                            <tr key={car.id} className="hover:bg-slate-800/40 transition">
                              <td className="py-4 px-4 font-semibold text-white">
                                {car.make} {car.model} ({car.year})
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
                                ${price.toLocaleString()}
                              </td>
                              <td className="py-4 px-4 font-bold text-emerald-400">
                                {car.isSold ? `$${carProfit.toLocaleString()}` : "$0.00 (Pending)"}
                              </td>
                              <td className="py-4 px-4 text-slate-400">
                                ${baseCost.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Cars Pagination Controls */}
                  {totalCarsPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4 text-xs text-slate-400">
                      <span>
                        Page <strong className="text-white">{carsPage}</strong> of <strong className="text-white">{totalCarsPages}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={carsPage === 1}
                          onClick={() => setCarsPage((prev) => Math.max(prev - 1, 1))}
                          className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
                        >
                          Previous
                        </button>
                        <button
                          disabled={carsPage === totalCarsPages}
                          onClick={() => setCarsPage((prev) => Math.min(prev + 1, totalCarsPages))}
                          className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Spare Parts Financial Breakdown Table */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
                Spare Parts Inventory & Revenue Ledger
              </h3>

              {loading ? (
                <p className="text-center text-slate-400 py-8">Loading spare parts ledger...</p>
              ) : parts.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No spare parts records found.</p>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {paginatedParts.map((part) => {
                      const stockVal = part.price * part.quantityInStock;
                      const soldRev = part.price * (part.soldQuantity || 0);
                      return (
                        <div key={part.id} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-white">{part.name}</h4>
                              <p className="text-xs font-mono text-slate-400">{part.partNumber} • {part.category}</p>
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                part.quantityInStock > 0
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : "bg-red-500/10 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {part.quantityInStock} left
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-700/50 pt-3">
                            <div>
                              <p className="text-slate-400">Unit Price</p>
                              <p className="font-bold text-amber-400">${part.price.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Stock Value</p>
                              <p className="font-bold text-white">${stockVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Units Sold</p>
                              <p className="font-bold text-amber-300">{part.soldQuantity || 0} sold</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Sold Revenue</p>
                              <p className="font-bold text-emerald-400">${soldRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-700/80 text-slate-400 text-xs uppercase tracking-wider">
                          <th className="py-3 px-4">Part Name</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Unit Price</th>
                          <th className="py-3 px-4">In Stock</th>
                          <th className="py-3 px-4">Stock Value</th>
                          <th className="py-3 px-4">Units Sold</th>
                          <th className="py-3 px-4">Sold Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-sm">
                        {paginatedParts.map((part) => {
                          const stockVal = part.price * part.quantityInStock;
                          const soldRev = part.price * (part.soldQuantity || 0);
                          return (
                            <tr key={part.id} className="hover:bg-slate-800/40 transition">
                              <td className="py-4 px-4 font-semibold text-white">
                                {part.name} <span className="text-xs font-mono text-slate-400">({part.partNumber})</span>
                              </td>
                              <td className="py-4 px-4 text-slate-300">
                                {part.category}
                              </td>
                              <td className="py-4 px-4 font-bold text-amber-400">
                                ${part.price.toLocaleString()}
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                    part.quantityInStock > 0
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                      : "bg-red-500/10 text-red-400 border border-red-500/30"
                                  }`}
                                >
                                  {part.quantityInStock} units
                                </span>
                              </td>
                              <td className="py-4 px-4 font-bold text-white">
                                ${stockVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-4 px-4 font-bold text-amber-300">
                                {part.soldQuantity || 0} sold
                              </td>
                              <td className="py-4 px-4 font-bold text-emerald-400">
                                ${soldRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Spare Parts Pagination Controls */}
                  {totalPartsPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4 text-xs text-slate-400">
                      <span>
                        Page <strong className="text-white">{partsPage}</strong> of <strong className="text-white">{totalPartsPages}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={partsPage === 1}
                          onClick={() => setPartsPage((prev) => Math.max(prev - 1, 1))}
                          className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
                        >
                          Previous
                        </button>
                        <button
                          disabled={partsPage === totalPartsPages}
                          onClick={() => setPartsPage((prev) => Math.min(prev + 1, totalPartsPages))}
                          className="px-3 py-1.5 bg-slate-800 border border-slate-700 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AccountantPage;