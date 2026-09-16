import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ContactChat } from "./components/ContactChat";

type Car = {
  id: number | string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  color?: string;
  engineSize?: string;
  transmission?: string;
  imageUrl?: string;
  isSold?: boolean;
  type?: string;
  condition?: "New" | "Used" | string;
};

interface SparePart {
  id: number;
  name: string;
  partNumber: string;
  category: string;
  price: number;
  quantityInStock: number;
  compatibleModels?: string;
  imageUrl?: string;
}

function BuyerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<"cars" | "parts">("cars");

  // Cars State
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [purchasing, setPurchasing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedCondition, setSelectedCondition] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  // Buyer Input Form State
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");

  // Spare Parts State
  const [parts, setParts] = useState<SparePart[]>([]);
  const [partsQuery, setPartsQuery] = useState<string>("");
  const [partsLoading, setPartsLoading] = useState<boolean>(false);
  const [purchasingPartId, setPurchasingPartId] = useState<number | null>(null);

  // Fetch Parts
  const fetchParts = async (search = "") => {
    setPartsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5038/api/spareparts?query=${encodeURIComponent(search)}`
      );
      if (res.ok) {
        const data = await res.json();
        setParts(data);
      } else {
        setParts([]);
      }
    } catch (err) {
      console.error("Error fetching parts:", err);
      setParts([]);
    } finally {
      setPartsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "parts") {
      fetchParts(partsQuery);
    }
  }, [activeTab, partsQuery]);

  const handleBuyPart = async (part: SparePart) => {
    const confirmPurchase = window.confirm(
      `Are you sure you want to purchase ${part.name} for $${part.price}?`
    );

    if (!confirmPurchase) return;

    setPurchasingPartId(part.id);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:5038/api/spareparts/buy/${part.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );

      if (res.ok) {
        alert("Spare part purchased successfully!");
        fetchParts(partsQuery);
      } else {
        const err = await res.json();
        alert(err.message || "Purchase failed.");
      }
    } catch (error) {
      console.error("Error purchasing part:", error);
      alert("Server error occurred while processing part purchase.");
    } finally {
      setPurchasingPartId(null);
    }
  };

  // Client-side filtering function for Cars
  const filterCars = (carList: Car[]): Car[] => {
    return carList.filter((car) => {
      const matchesType =
        selectedType === "All" ||
        (car.type &&
          (car.type.trim().toLowerCase().includes(selectedType.trim().toLowerCase()) ||
            selectedType.trim().toLowerCase().includes(car.type.trim().toLowerCase())));

      const matchesCondition =
        selectedCondition === "All" ||
        (car.condition &&
          car.condition.trim().toLowerCase() === selectedCondition.trim().toLowerCase());

      return matchesType && matchesCondition;
    });
  };

  const displayedCars = filterCars(cars);
  const totalPages = Math.ceil(displayedCars.length / ITEMS_PER_PAGE) || 1;
  const paginatedCars = displayedCars.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Fetch Cars
  const fetchCars = (
    queryTerm: string = searchQuery,
    typeTerm: string = selectedType,
    conditionTerm: string = selectedCondition
  ): void => {
    setLoading(true);

    const params = new URLSearchParams();
    if (queryTerm.trim()) params.append("query", queryTerm.trim());
    if (typeTerm !== "All") params.append("type", typeTerm);
    if (conditionTerm !== "All") params.append("condition", conditionTerm);

    const queryString = params.toString();
    const url = queryString
      ? `http://localhost:5038/api/cars?${queryString}`
      : `http://localhost:5038/api/cars`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cars");
        return res.json();
      })
      .then((data: Car[]) => {
        if (Array.isArray(data)) {
          const availableCars = data.filter((car) => !car.isSold);
          setCars(availableCars);
        } else {
          setCars([]);
        }
        setCurrentPage(1);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error("Error fetching cars:", err);
        setCars([]);
        setLoading(false);
      });
  };

  // Re-run whenever searchParams in the URL change (triggered via ChatBot or route changes)
  useEffect(() => {
    const typeFromUrl = searchParams.get("type") || "All";
    const conditionFromUrl = searchParams.get("condition") || "All";

    setSelectedType(typeFromUrl);
    setSelectedCondition(conditionFromUrl);
    setCurrentPage(1);

    fetchCars(searchQuery, typeFromUrl, conditionFromUrl);
  }, [searchParams]);

  // Update URL state on manual select box changes
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newType = e.target.value;
    setSelectedType(newType);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams);
    if (newType !== "All") {
      params.set("type", newType);
    } else {
      params.delete("type");
    }
    navigate({ search: params.toString() });
  };

  const handleConditionChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const newCondition = e.target.value;
    setSelectedCondition(newCondition);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams);
    if (newCondition !== "All") {
      params.set("condition", newCondition);
    } else {
      params.delete("condition");
    }
    navigate({ search: params.toString() });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetchCars(searchQuery, selectedType, selectedCondition);
  };

  const handleResetFilters = (): void => {
    setSearchQuery("");
    setSelectedType("All");
    setSelectedCondition("All");
    navigate({ search: "" });
  };

  const handleCloseModal = () => {
    setSelectedCar(null);
    setCustomerName("");
    setCustomerPhone("");
  };

  const handleBuyCar = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!selectedCar) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please enter both your Full Name and Contact Phone Number.");
      return;
    }

    setPurchasing(true);

    try {
      const response = await fetch(`http://localhost:5038/api/cars/buy/${selectedCar.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
        }),
      });

      if (response.ok) {
        alert("Congratulations! Your purchase was successful.");
        handleCloseModal();
        fetchCars(searchQuery, selectedType, selectedCondition);
      } else {
        const errorData: { message?: string } = await response.json();
        alert(errorData.message || "Failed to complete purchase process.");
      }
    } catch (err: unknown) {
      console.error("Error processing purchase:", err);
      alert("Server error occurred while processing purchase.");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-black text-white overflow-y-auto">
      {/* Navigation Bar */}
      <nav className="fixed top-0 z-40 w-full px-8 py-5 bg-black/40 backdrop-blur-lg border-b border-white/10 flex items-center justify-between">
        <h1 className="text-2xl hidden sm:block font-extrabold tracking-wider text-gray-200 uppercase text-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
          Vanguard Drive
        </h1>
        <h1 className="block sm:hidden font-extrabold tracking-wider text-gray-200 uppercase text-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
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
        className="fixed inset-0 w-full h-full object-cover z-0"
      />
      <div className="fixed inset-0 bg-black/70 z-10" />

      {/* Main Content Area */}
      <main className="relative z-20 pt-28 pb-12 px-6 max-w-6xl mx-auto">
        {/* Header & Tab Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 border-b border-slate-800 pb-4">
          <h2 className="text-md sm:text-3xl font-bold text-amber-500">
            {activeTab === "cars" ? "Vehicle Inventory" : "Spare Parts Catalog"}
          </h2>

          <div className="flex bg-gray-900/80 p-1.5 rounded-2xl border border-slate-700/60 shadow-xl">
            <button
              onClick={() => setActiveTab("cars")}
              className={`sm:px-5 sm:py-2.5 px-2 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === "cars"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Vehicles
            </button>
            <button
              onClick={() => setActiveTab("parts")}
              className={`sm:px-5 px-2 py-2 sm:py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === "parts"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Spare Parts
            </button>
          </div>
        </div>

        {/* TAB 1: VEHICLES */}
        {activeTab === "cars" && (
          <>
            {/* Filter Bar: Search + Type Dropdown + Condition Dropdown */}
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-center max-w-5xl mx-auto">
              <form
                onSubmit={handleSearchSubmit}
                className="w-full md:flex-1 p-3 bg-gray-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl flex gap-3 items-center shadow-xl"
              >
                <input
                  type="text"
                  placeholder="Search by Make, Model, or Year..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-amber-600/20 cursor-pointer"
                >
                  Search
                </button>
              </form>

              <div className="w-full md:w-auto p-3 bg-gray-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-xl">
                <select
                  value={selectedType}
                  onChange={handleTypeChange}
                  className="w-full md:w-40 px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Crossover SUV">Crossover SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                </select>
              </div>

              <div className="w-full md:w-auto p-3 bg-gray-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-xl">
                <select
                  value={selectedCondition}
                  onChange={handleConditionChange}
                  className="w-full md:w-40 px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="All">All Conditions</option>
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                </select>
              </div>

              {(searchQuery || selectedType !== "All" || selectedCondition !== "All") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full md:w-auto px-5 py-3.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-2xl font-semibold text-sm transition shadow-xl cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-center text-slate-400 py-12">Loading inventory...</p>
            ) : displayedCars.length === 0 ? (
              <p className="text-center text-slate-400 py-12">
                No cars found matching your selected criteria.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {paginatedCars.map((car) => (
                  <div
                    key={car.id}
                    onClick={() => setSelectedCar(car)}
                    className="group cursor-pointer bg-gray-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4 shadow-xl hover:border-amber-500/80 transition transform hover:-translate-y-1 relative"
                  >
                    <div className="overflow-hidden rounded-xl mb-4 h-48 border border-slate-700/50">
                      <img
                        src={car.imageUrl || "/explore.jpeg"}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>

                    <div className="absolute top-6 right-6 z-10">
                      {car.isSold ? (
                        <span className="bg-red-600/90 text-white font-extrabold text-xs px-3 py-1 rounded-lg shadow-md uppercase tracking-wider">
                          Sold
                        </span>
                      ) : (
                        <span className="bg-emerald-600/90 text-white font-extrabold text-xs px-3 py-1 rounded-lg shadow-md uppercase tracking-wider">
                          Available
                        </span>
                      )}
                    </div>

                    <div className="absolute top-6 left-6 z-10 flex gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          car.condition === "New"
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {car.condition || "Used"}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-slate-950">
                        {car.type || "Sedan"}
                      </span>
                    </div>

                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white">
                        {car.make} {car.model}
                      </h3>
                      <p className="text-amber-500 font-semibold text-lg mt-1">
                        ${car.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-700/60 bg-gray-900/60 p-4 rounded-xl backdrop-blur-md">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 rounded-xl text-xs font-semibold text-white transition cursor-pointer"
              >
                ← Previous
              </button>

              <span className="text-xs text-slate-400 font-medium">
                Page <strong className="text-amber-400">{currentPage}</strong> of{" "}
                <strong className="text-white">{totalPages}</strong>
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 rounded-xl text-xs font-semibold text-white transition cursor-pointer"
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* TAB 2: SPARE PARTS */}
        {activeTab === "parts" && (
          <>
            {/* Parts Search Bar */}
            <div className="mb-8 max-w-3xl mx-auto flex gap-3 p-3 bg-gray-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-xl">
              <input
                type="text"
                placeholder="Search spare parts by name, SKU, or category..."
                value={partsQuery}
                onChange={(e) => setPartsQuery(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
              {partsQuery && (
                <button
                  type="button"
                  onClick={() => setPartsQuery("")}
                  className="px-5 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold text-sm transition cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {partsLoading ? (
              <p className="text-center text-slate-400 py-12">Loading spare parts...</p>
            ) : parts.length === 0 ? (
              <p className="text-center text-slate-400 py-12">
                No spare parts found matching your query.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {parts.map((part) => (
                  <div
                    key={part.id}
                    className="bg-gray-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-amber-500/80 transition"
                  >
                    <div>
                      <div className="overflow-hidden rounded-xl mb-4 h-44 border border-slate-700/50 relative">
                        <img
                          src={part.imageUrl || "/explore.jpeg"}
                          alt={part.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 right-3 bg-slate-900/90 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                          {part.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-1">{part.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">
                        SKU: {part.partNumber}
                      </p>
                      {part.compatibleModels && (
                        <p className="text-xs text-slate-300 mt-2">
                          <strong className="text-slate-400">Compatible with:</strong>{" "}
                          {part.compatibleModels}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-amber-500 font-bold text-xl">
                          ${part.price?.toLocaleString()}
                        </p>
                        <p
                          className={`text-xs font-semibold mt-0.5 ${
                            part.quantityInStock > 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {part.quantityInStock > 0
                            ? `In Stock (${part.quantityInStock})`
                            : "Out of Stock"}
                        </p>
                      </div>

                      <button
                        onClick={() => handleBuyPart(part)}
                        disabled={part.quantityInStock <= 0 || purchasingPartId === part.id}
                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border disabled:border-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-amber-600/20 cursor-pointer"
                      >
                        {purchasingPartId === part.id
                          ? "Buying..."
                          : part.quantityInStock > 0
                          ? "Buy Now"
                          : "Sold Out"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Car Details & Buyer Information Modal */}
      {selectedCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-700/60 pb-3">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {selectedCar.make} {selectedCar.model}
                </h3>
                <p className="text-amber-500 font-bold text-xl mt-1">
                  ${selectedCar.price?.toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white text-2xl font-bold p-1 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <img
              src={selectedCar.imageUrl || "/explore.jpeg"}
              alt={`${selectedCar.make} ${selectedCar.model}`}
              className="w-full h-48 object-cover rounded-xl border border-slate-700/60"
            />

            <div className="grid grid-cols-2 gap-3 text-sm pt-2">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                <p className="text-slate-400 text-xs">CONDITION</p>
                <p className="font-semibold text-white">{selectedCar.condition || "Used"}</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                <p className="text-slate-400 text-xs">YEAR</p>
                <p className="font-semibold text-white">{selectedCar.year}</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                <p className="text-slate-400 text-xs">MILEAGE</p>
                <p className="font-semibold text-white">
                  {selectedCar.mileage?.toLocaleString()} miles
                </p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                <p className="text-slate-400 text-xs">COLOR</p>
                <p className="font-semibold text-white">{selectedCar.color || "N/A"}</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                <p className="text-slate-400 text-xs">TRANSMISSION</p>
                <p className="font-semibold text-white">
                  {selectedCar.transmission || "N/A"}
                </p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                <p className="text-slate-400 text-xs">ENGINE SIZE</p>
                <p className="font-semibold text-white">
                  {selectedCar.engineSize || "N/A"}
                </p>
              </div>
            </div>

            {/* Form inputs for Buyer Name & Contact Number */}
            <form onSubmit={handleBuyCar} className="space-y-4 pt-4 border-t border-slate-700/60">
              <h4 className="text-sm font-bold text-amber-500 uppercase tracking-wider">
                Buyer Details Required
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +1 555-0192"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={purchasing}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition cursor-pointer disabled:bg-slate-800"
                >
                  {purchasing ? "Processing Purchase..." : "Confirm & Purchase Vehicle"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Chat Box Component */}
      <ContactChat />
    </div>
  );
}

export default BuyerPage;