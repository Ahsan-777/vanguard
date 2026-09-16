import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import adminBackground from "./assets/admin-icon.jpeg";
import adminIcon from "./assets/react.svg";

import { useAdmin } from "./hooks/useAdmin";

import Dashboard from "./components/admin/Dashboard";
import Inventory from "./components/admin/Inventory";
import Financials from "./components/admin/Financials";
import SpareParts from "./components/admin/SpareParts";
import SalesHistory from "./components/admin/SalesHistory";

import CarDetailsModal from "./components/admin/modals/CarDetailsModal";
import AddVehicleModal from "./components/admin/modals/AddVehicleModal";
import AddPartModal from "./components/admin/modals/AddPartModal";

function AdminPage() {
  const navigate = useNavigate();

  const dropdownRef =
    useRef<HTMLDivElement | null>(null);

  const [isOpen, setIsOpen] =
    useState(false);

  const [showInventorySubmenu, setShowInventorySubmenu] =
    useState(false);

  // =====================================================
  // ADMIN HOOK
  // =====================================================

  const admin = useAdmin();

  // =====================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="relative min-h-screen bg-black text-white overflow-y-auto">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <img
        src={adminBackground}
        alt="Admin Background"
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
      />

      <div className="fixed inset-0 bg-black/75 z-10 pointer-events-none" />

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="fixed top-0 z-40 w-full px-8 py-5 bg-black/40 backdrop-blur-lg border-b border-white/10 flex items-center justify-between">

        {/* MENU */}

        <div
          className="relative"
          ref={dropdownRef}
        >
          <button
            onClick={() =>
              setIsOpen((prev) => !prev)
            }
            className="flex items-center gap-2 py-1 sm:py-2.5 px-4 sm:px-5 bg-slate-900 border border-slate-700 hover:border-amber-500/60 rounded-xl text-white font-semibold shadow-lg transition cursor-pointer"
          >
            <span className="hidden sm:block">
              Menu
            </span>

            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen
                  ? "rotate-180 text-amber-500"
                  : "text-slate-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute left-0 mt-3 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">

              {/* USER */}

              <div className="px-4 py-3">
                <p className="text-xs text-slate-400">
                  Signed in as
                </p>

                <p className="text-sm font-bold text-amber-400 truncate uppercase">
                  {admin.userRole ||
                    "Administrator"}
                </p>
              </div>

              {/* NAVIGATION */}

              <div className="py-1">

                {/* DASHBOARD */}

                <button
                  onClick={() => {
                    admin.setActiveTab(
                      "dashboard"
                    );

                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition cursor-pointer ${
                    admin.activeTab ===
                    "dashboard"
                      ? "text-amber-400 bg-slate-800 font-semibold"
                      : "text-slate-200 hover:bg-slate-800 hover:text-amber-400"
                  }`}
                >
                  Dashboard Overview
                </button>

                {/* INVENTORY */}

                <div className="flex flex-col border-y border-slate-800/60 bg-slate-900/40">

                  <div className="flex items-center justify-between w-full hover:bg-slate-800 transition">

                    <button
                      onClick={() => {
                        admin.handleResetFilters();

                        admin.setActiveTab(
                          "inventory"
                        );

                        setIsOpen(false);
                      }}
                      className={`flex-1 text-left px-4 py-2.5 text-sm transition cursor-pointer ${
                        admin.activeTab ===
                        "inventory"
                          ? "text-amber-400 font-semibold"
                          : "text-slate-200 hover:text-amber-400"
                      }`}
                    >
                      Cars Inventory
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        setShowInventorySubmenu(
                          (prev) => !prev
                        );
                      }}
                      className="px-4 py-2.5 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          showInventorySubmenu
                            ? "rotate-180 text-amber-500"
                            : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  {showInventorySubmenu && (
                    <div className="px-4 pb-3 pt-1 space-y-2 bg-slate-950/60 border-t border-slate-800/80">

                      {/* CONDITION */}

                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                          Condition
                        </label>

                        <select
                          value={
                            admin.selectedCondition
                          }
                          onChange={(e) => {
                            admin.handleConditionChange(
                              e
                            );

                            admin.setActiveTab(
                              "inventory"
                            );

                            setIsOpen(false);
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="All">
                            Categories
                          </option>

                          <option value="New">
                            New Cars
                          </option>

                          <option value="Used">
                            Used Cars
                          </option>
                        </select>
                      </div>

                      {/* TYPE */}

                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                          Vehicle Type
                        </label>

                        <select
                          value={
                            admin.selectedType
                          }
                          onChange={(e) => {
                            admin.handleTypeChange(
                              e
                            );

                            admin.setActiveTab(
                              "inventory"
                            );

                            setIsOpen(false);
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="All">
                            All Types
                          </option>

                          <option value="Sedan">
                            Sedan
                          </option>

                          <option value="SUV">
                            SUV
                          </option>

                          <option value="Crossover SUV">
                            Crossover SUV
                          </option>

                          <option value="Hatchback">
                            Hatchback
                          </option>

                          <option value="Coupe">
                            Coupe
                          </option>

                          <option value="Van">
                            Van
                          </option>

                          <option value="Truck">
                            Truck
                          </option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* FINANCIALS */}

                <button
                  onClick={() => {
                    admin.setActiveTab(
                      "financials"
                    );

                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition cursor-pointer ${
                    admin.activeTab ===
                    "financials"
                      ? "text-amber-400 bg-slate-800 font-semibold"
                      : "text-slate-200 hover:bg-slate-800 hover:text-amber-400"
                  }`}
                >
                  Financial Ledger
                </button>

                {/* PARTS */}

                <button
                  onClick={() => {
                    admin.setActiveTab(
                      "parts"
                    );

                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition cursor-pointer ${
                    admin.activeTab === "parts"
                      ? "text-amber-400 bg-slate-800 font-semibold"
                      : "text-slate-200 hover:bg-slate-800 hover:text-amber-400"
                  }`}
                >
                  Spare Parts
                </button>

                {/* SALES */}

                <button
                  onClick={() => {
                    admin.setActiveTab(
                      "salesHistory"
                    );

                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition cursor-pointer ${
                    admin.activeTab ===
                    "salesHistory"
                      ? "text-amber-400 bg-slate-800 font-semibold"
                      : "text-slate-200 hover:bg-slate-800 hover:text-amber-400"
                  }`}
                >
                  Sales History
                </button>
              </div>

              {/* LOGOUT */}

              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition font-semibold cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TITLE */}

        <h1 className="text-2xl hidden sm:block font-extrabold tracking-wider text-gray-200 uppercase text-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
          Vanguard Drive
        </h1>

        <h1 className="block sm:hidden font-extrabold tracking-wider text-gray-200 uppercase text-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
          Vanguard Drive
        </h1>

        {/* HEADER LOGOUT */}

        <button
          onClick={handleLogout}
          className="ml-auto py-1 sm:py-2.5 px-4 sm:px-6 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-600/30 transition cursor-pointer"
        >
          <span className="hidden sm:block">
            Logout
          </span>

          <p className="block sm:hidden">
            ⏻
          </p>
        </button>
      </nav>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="relative z-20 pt-28 pb-32 px-6 max-w-6xl mx-auto space-y-10">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-700/60 p-6 rounded-2xl backdrop-blur-md">

          <div className="flex items-center gap-4">

            <img
              src={adminIcon}
              alt="Admin Icon"
              className="w-12 h-12 rounded-full border-2 border-blue-400 object-cover shadow-lg"
            />

            <div>
              <h1 className="text-3xl font-extrabold text-amber-500">
                Welcome Admin
              </h1>

              <p className="text-slate-400 text-sm mt-0.5">
                Current View:{" "}
                <span className="text-white capitalize font-semibold">
                  {admin.activeTab}
                </span>
              </p>
            </div>
          </div>

          {admin.activeTab ===
            "inventory" &&
            admin.isDealer && (
              <button
                onClick={() =>
                  admin.setShowAddModal(
                    true
                  )
                }
                className="py-2.5 px-5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-600/30 transition cursor-pointer"
              >
                + Add New Vehicle
              </button>
            )}
        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        {admin.activeTab ===
          "inventory" &&
          admin.isDealer && (
            <form
              onSubmit={
                admin.handleSearchSubmit
              }
              className="mb-6 flex gap-3 max-w-xl"
            >
              <div className="relative flex-1">

                <input
                  type="text"
                  value={admin.searchQuery}
                  onChange={(e) =>
                    admin.setSearchQuery(
                      e.target.value
                    )
                  }
                  placeholder="Search by make, model, or year..."
                  className="w-full h-11 border border-slate-700 rounded-xl px-4 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white bg-slate-800/90 transition"
                />

                {admin.searchQuery && (
                  <button
                    type="button"
                    onClick={
                      admin.handleResetFilters
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={admin.isSearching}
                className="px-6 h-11 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition cursor-pointer"
              >
                {admin.isSearching
                  ? "Searching..."
                  : "Search"}
              </button>
            </form>
          )}

        {/* =================================================
            DASHBOARD
        ================================================= */}

      {/* =================================================
    DASHBOARD
================================================= */}

{admin.activeTab === "dashboard" && (
  <Dashboard
    totalActiveInventoryCost={admin.totalActiveInventoryCost}
    totalCarsSoldCost={admin.totalCarsSoldCost}
    totalProfitEarned={admin.totalProfitEarned}
    availableCarsCount={admin.availableCars.length}
    soldCarsCount={admin.soldCars.length}
    lowStockParts={admin.lowStockParts}
    onGoToParts={() => admin.setActiveTab("parts")}
    currentMonthRevenue={admin.currentMonthRevenue}
    estimatedNextMonthRevenue={admin.estimatedNextMonthRevenue}
    estimatedNextMonthProfit={admin.estimatedNextMonthProfit}
  />
)}

        {/* =================================================
            INVENTORY
        ================================================= */}

        {admin.activeTab ===
          "inventory" && (
            <Inventory
              cars={admin.cars}
              paginatedCars={
                admin.paginatedInventoryCars
              }
              loading={admin.loading}
              currentPage={
                admin.inventoryPage
              }
              totalPages={
                admin.totalInventoryPages
              }
              fallbackImage={
                adminBackground
              }
              onPageChange={
                admin.setInventoryPage
              }
              onSelectCar={
                admin.setSelectedCar
              }
            />
          )}

        {/* =================================================
            FINANCIALS
        ================================================= */}

        {admin.activeTab ===
          "financials" && (
            <Financials
              cars={admin.cars}
              paginatedCars={
                admin.paginatedFinancialCars
              }
              loading={admin.loading}
              currentPage={
                admin.financialPage
              }
              totalPages={
                admin.totalFinancialPages
              }
              totalActiveInventoryCost={
                admin.totalActiveInventoryCost
              }
              totalCarsSoldCost={
                admin.totalCarsSoldCost
              }
              totalProfitEarned={
                admin.totalProfitEarned
              }
              availableCarsCount={
                admin.availableCars.length
              }
              soldCarsCount={
                admin.soldCars.length
              }
              onPageChange={
                admin.setFinancialPage
              }
            />
          )}

        {/* =================================================
            SPARE PARTS
        ================================================= */}

        {admin.activeTab === "parts" && (
          <SpareParts
            parts={admin.parts}
            partsLoading={
              admin.partsLoading
            }
            partsQuery={
              admin.partsQuery
            }
            totalPartsValue={
              admin.totalPartsValue
            }
            totalUnitsStocked={
              admin.totalUnitsStocked
            }
            totalSoldPartsRevenue={
              admin.totalSoldPartsRevenue
            }
            totalCategoriesCount={
              admin.totalCategoriesCount
            }
            lowStockParts={
              admin.lowStockParts
            }
            onQueryChange={
              admin.setPartsQuery
            }
            onAddPart={() =>
              admin.setShowAddPartModal(
                true
              )
            }
            onClearSearch={() =>
              admin.setPartsQuery("")
            }
            onViewSalesHistory={() =>
              admin.setActiveTab(
                "salesHistory"
              )
            }
          />
        )}

        {/* =================================================
            SALES HISTORY
        ================================================= */}

        {admin.activeTab === "salesHistory" && (
  <SalesHistory
    salesHistory={admin.filteredSalesHistory}
    salesLoading={admin.salesLoading}
    onRefresh={admin.fetchSalesHistory}
    startDate={admin.startDate}
    setStartDate={admin.setStartDate}
    endDate={admin.endDate}
    setEndDate={admin.setEndDate}
    onResetDates={admin.handleResetDateFilter}
  />
)}
      </main>

      {/* =================================================
          CAR DETAILS MODAL
      ================================================= */}

      {admin.selectedCar && (
        <CarDetailsModal
          car={admin.selectedCar}
          fallbackImage={
            adminBackground
          }
          onClose={() =>
            admin.setSelectedCar(null)
          }
        />
      )}

      {/* =================================================
          ADD VEHICLE MODAL
      ================================================= */}

      {admin.showAddModal && (
        <AddVehicleModal
          formData={admin.formData}
          setFormData={
            admin.setFormData
          }
          onClose={() =>
            admin.setShowAddModal(false)
          }
          onSubmit={
            admin.handleAddCar
          }
          onImageUpload={
            admin.handleImageUpload
          }
        />
      )}

      {/* =================================================
          ADD SPARE PART MODAL
      ================================================= */}

      {admin.showAddPartModal && (
        <AddPartModal
          formData={
            admin.partFormData
          }
          setFormData={
            admin.setPartFormData
          }
          onClose={() =>
            admin.setShowAddPartModal(
              false
            )
          }
          onSubmit={
            admin.handleAddPart
          }
          onImageUpload={
            admin.handlePartImageUpload
          }
        />
      )}
    </div>
  );
}

export default AdminPage;