import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = 
  (import.meta as any).env.VITE_API_URL || "http://localhost:5038/api";
// =====================================================
// TYPES
// =====================================================

type Car = {
  id: number | string;
  make: string;
  model: string;
  year: number;
  price: number | string;
  mileage: number | string;
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

type FormDataState = {
  make: string;
  model: string;
  year: string;
  price: string;
  mileage: string;
  color: string;
  engineSize: string;
  transmission: string;
  imageUrl: string;
  type: string;
  condition: string;
};

type PartFormDataState = {
  name: string;
  partNumber: string;
  category: string;
  price: string;
  quantityInStock: string;
  compatibleModels: string;
  imageUrl: string;
};

// =====================================================
// COMPONENT
// =====================================================

function InventoryPage() {
  const navigate = useNavigate();

  // =====================================================
  // USER ROLE
  // =====================================================

  const storedRole =
    localStorage.getItem("role") ??
    localStorage.getItem("userRole") ??
    "";

  const isDealer = storedRole.toLowerCase() === "dealer";

  // =====================================================
  // TAB STATE
  // =====================================================

  const [activeTab, setActiveTab] = useState<"cars" | "parts">("cars");

  // =====================================================
  // CAR STATES
  // =====================================================

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // =====================================================
  // SPARE PART STATES
  // =====================================================

  const [parts, setParts] = useState<SparePart[]>([]);
  const [partsLoading, setPartsLoading] = useState<boolean>(false);
  const [showAddPartModal, setShowAddPartModal] = useState<boolean>(false);
  const [partsQuery, setPartsQuery] = useState<string>("");

  // =====================================================
  // NAVIGATION / DROPDOWN STATES
  // =====================================================

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // =====================================================
  // FILTER STATES
  // =====================================================

  const [selectedCondition, setSelectedCondition] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // =====================================================
  // CAR FORM
  // =====================================================

  const [formData, setFormData] = useState<FormDataState>({
    make: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    color: "",
    engineSize: "",
    transmission: "Automatic",
    imageUrl: "",
    type: "Sedan",
    condition: "Used",
  });

  // =====================================================
  // SPARE PART FORM
  // =====================================================

  const [partFormData, setPartFormData] = useState<PartFormDataState>({
    name: "",
    partNumber: "",
    category: "Brakes",
    price: "",
    quantityInStock: "",
    compatibleModels: "",
    imageUrl: "",
  });

  // =====================================================
  // DROPDOWN OUTSIDE CLICK
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =====================================================
  // FETCH CARS
  // =====================================================

  const fetchCars = (): void => {
    setLoading(true);

    fetch(`${API_BASE_URL}/cars`)
      .then((res) => res.json())
      .then((data: Car[]) => {
        if (Array.isArray(data)) {
          setCars(data);
        } else {
          setCars([]);
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error("Error fetching cars:", err);
        setCars([]);
        setLoading(false);
      });
  };

  // =====================================================
  // FETCH SPARE PARTS
  // =====================================================

  const fetchParts = (query = ""): void => {
    setPartsLoading(true);

    fetch(
     `${API_BASE_URL}/spareparts?query=${encodeURIComponent(
        query
      )}`
    )
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Server Error (${res.status}): ${errorText}`);
        }
        return res.json();
      })
      .then((data: SparePart[]) => {
        if (Array.isArray(data)) {
          setParts(data);
        } else {
          setParts([]);
        }
        setPartsLoading(false);
      })
      .catch((err: unknown) => {
        console.error("Error fetching parts:", err);
        setParts([]);
        setPartsLoading(false);
      });
  };

  // =====================================================
  // INITIAL CAR FETCH
  // =====================================================

  useEffect(() => {
    fetchCars();
  }, []);

  // =====================================================
  // FETCH PARTS WHEN TAB / SEARCH CHANGES
  // =====================================================

  useEffect(() => {
    if (activeTab === "parts") {
      fetchParts(partsQuery);
    }
  }, [activeTab, partsQuery]);

  // =====================================================
  // IMAGE UPLOAD HANDLERS
  // =====================================================

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePartImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPartFormData((prev) => ({
          ...prev,
          imageUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const handleResetFilters = (): void => {
    setSelectedCondition("All");
    setSelectedType("All");
    setCurrentPage(1);
  };

  // =====================================================
  // ADD CAR
  // =====================================================

  const handleAddCar = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/cars`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          ...formData,
          year: parseInt(formData.year, 10) || 0,
          price: parseFloat(formData.price) || 0,
          mileage: parseInt(formData.mileage, 10) || 0,
        }),
      });

      if (response.ok) {
        alert("Vehicle added to inventory successfully!");
        setShowAddModal(false);
        setFormData({
          make: "",
          model: "",
          year: "",
          price: "",
          mileage: "",
          color: "",
          engineSize: "",
          transmission: "Automatic",
          imageUrl: "",
          type: "Sedan",
          condition: "Used",
        });
        fetchCars();
      } else {
        const errorText = await response.text();
        alert(`Failed to add vehicle: ${errorText || response.statusText}`);
      }
    } catch (err: unknown) {
      console.error("Error adding car:", err);
      alert("Network error: Unable to reach the server.");
    }
  };

  // =====================================================
  // ADD SPARE PART
  // =====================================================

  const handleAddPart = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/spareparts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          ...partFormData,
          price: parseFloat(partFormData.price) || 0,
          quantityInStock: parseInt(partFormData.quantityInStock, 10) || 0,
        }),
      });

      if (response.ok) {
        alert("Spare part added to inventory successfully!");
        setShowAddPartModal(false);
        setPartFormData({
          name: "",
          partNumber: "",
          category: "Brakes",
          price: "",
          quantityInStock: "",
          compatibleModels: "",
          imageUrl: "",
        });
        fetchParts(partsQuery);
      } else {
        const errorText = await response.text();
        alert(`Failed to add spare part: ${errorText || response.statusText}`);
      }
    } catch (err: unknown) {
      console.error("Error adding spare part:", err);
      alert("Network error: Unable to reach the server.");
    }
  };

  // =====================================================
  // CAR FILTERING
  // =====================================================

  const filteredCars = cars.filter((car) => {
    const matchesCondition =
      selectedCondition === "All" ||
      (car.condition || "Used").toLowerCase() ===
        selectedCondition.toLowerCase();

    const matchesType =
      selectedType === "All" ||
      (car.type || "Sedan").toLowerCase() === selectedType.toLowerCase();

    return matchesCondition && matchesType;
  });

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.ceil(filteredCars.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCars = filteredCars.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number): void => {
    if (page < 1 || page > totalPages) {
      return;
    }
    setCurrentPage(page);
  };

  // =====================================================
  // FINANCIAL SUMMARIES
  // =====================================================

  const availableCars: Car[] = cars.filter((car) => !car.isSold);
  const netActiveInventoryPrice: number = availableCars.reduce(
    (sum, car) => sum + (parseFloat(String(car.price)) || 0),
    0
  );

  const soldCars: Car[] = cars.filter((car) => car.isSold);
  const totalDeductedSoldPrice: number = soldCars.reduce(
    (sum, car) => sum + (parseFloat(String(car.price)) || 0),
    0
  );

  const totalPartsStock = parts.reduce(
    (sum, p) => sum + p.quantityInStock,
    0
  );
  const totalPartsValue = parts.reduce(
    (sum, p) => sum + p.price * p.quantityInStock,
    0
  );

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="relative min-h-screen h-screen w-screen bg-black text-white overflow-y-auto">

      {/* =====================================================
          NAVIGATION BAR
      ===================================================== */}

      <nav className="fixed top-0 z-40 w-full px-8 py-5 bg-black/40 backdrop-blur-lg border-b border-white/10 flex items-center justify-between">

          <h1 className="text-2xl hidden sm:block font-extrabold tracking-wider text-gray-200 uppercase text-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
    Vanguard Drive
  </h1>
   <h1 className="block sm:hidden font-extrabold tracking-wider text-gray-200 uppercase text-center absolute left-1/2 -translate-x-1/2 pointer-events-none"> Vanguard Drive</h1>
  
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

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <img
        src="/explore.jpeg"
        alt="Background"
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      <div className="fixed inset-0 bg-black/70 z-10 pointer-events-none" />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="relative z-20 pt-28 pb-32 px-6 max-w-6xl mx-auto">

        {/* =====================================================
            HEADER / TABS
        ===================================================== */}

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-b border-slate-800 pb-4">

          <h2 className="sm:text-3xl font-bold text-amber-500">
            {activeTab === "cars"
              ? "Vehicle Inventory"
              : "Spare Parts Inventory"}
          </h2>
<span className="hidden lg:block">-Inventory Portal-</span>
          <div className="flex items-center gap-3">

            {/* TAB SWITCHER */}

            <div className="flex bg-gray-900/80 p-1.5 rounded-2xl border border-slate-700/60 shadow-xl">

              <button
                onClick={() =>
                  setActiveTab("cars")
                }
                className={`px-1 py-1 sm:px-5 sm:py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  activeTab === "cars"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Vehicles
              </button>

              <button
                onClick={() =>
                  setActiveTab("parts")
                }
                className={`px-1 py-1  sm:px-5 sm:py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  activeTab === "parts"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Spare Parts
              </button>

            </div>

            {/* ACTION BUTTON */}

            {activeTab === "cars" ? (
              <button
                onClick={() =>
                  setShowAddModal(true)
                }
                className="sm:py-3 sm:px-6 bg-amber-600 py-2 text-sm sm:text-lg hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition cursor-pointer"
              >
                + Add New Vehicle
              </button>
            ) : (
              <button
                onClick={() =>
                  setShowAddPartModal(true)
                }
                className="sm:py-3 px-1 sm:px-6 py-2 bg-amber-600 text-sm sm:text-lg  hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition cursor-pointer"
              >
                + Add Spare Part
              </button>
              
            )}
  {activeTab === "cars" ? (
              <button
              onClick={() => window.open(`${API_BASE_URL}/cars/report/view`, "_blank")}
                className="sm:py-3 py-2 sm:px-6 bg-amber-600 hover:bg-amber-500 text-sm sm:text-lg  text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition cursor-pointer"
              >
                View Cars Report
              </button>
            ) : (           
<button
  onClick={() => window.open(`${API_BASE_URL}/spareparts/report/view`, "_blank")}
  className="sm:py-3 py-1 sm:px-6 bg-amber-600 hover:bg-amber-500 ext-sm sm:text-lg text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition cursor-pointer"
  >
   View Parts Report
</button>
)}
          </div>
        </div>

        {/* =====================================================
            TAB 1: VEHICLES
        ===================================================== */}

        {activeTab === "cars" && (
          <>
            {/* DEALER PORTFOLIO */}

            {isDealer && (
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="p-6 bg-gradient-to-r from-amber-900/40 via-slate-900/80 to-slate-900/80 border border-amber-500/30 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between">

                  <div>

                    <p className="text-amber-400 font-semibold text-xs tracking-wider uppercase">
                      Net Active Stock Valuation
                    </p>

                    <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">
                      $
                      {netActiveInventoryPrice.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </h3>

                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-emerald-300 font-medium text-xs">
                    Available:{" "}
                    {availableCars.length}
                  </div>

                </div>

                <div className="p-6 bg-gradient-to-r from-red-950/40 via-slate-900/80 to-slate-900/80 border border-red-500/30 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between">

                  <div>

                    <p className="text-red-400 font-semibold text-xs tracking-wider uppercase">
                      Deducted Revenue (Sold Vehicles)
                    </p>

                    <h3 className="text-3xl font-extrabold text-red-400 mt-1">
                      $
                      {totalDeductedSoldPrice.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </h3>

                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl text-red-300 font-medium text-xs">
                    Sold: {soldCars.length}
                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                FILTER TOOLBAR
            ================================================= */}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-gray-900/80 p-4 border border-slate-700/60 rounded-2xl backdrop-blur-md">

              <div className="flex items-center gap-3">

                <span className="text-xs font-semibold text-slate-400 uppercase">
                  Filters:
                </span>

                {(selectedCondition !== "All" ||
                  selectedType !== "All") && (
                  <button
                    onClick={
                      handleResetFilters
                    }
                    className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-lg hover:bg-amber-500 hover:text-black transition cursor-pointer"
                  >
                    Clear Filters ✕
                  </button>
                )}

              </div>

              <div className="flex gap-3">

                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(
                      e.target.value
                    );
                    setCurrentPage(1);
                  }}
                  className="sm:w-40 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
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

                <select
                  value={selectedCondition}
                  onChange={(e) => {
                    setSelectedCondition(
                      e.target.value
                    );
                    setCurrentPage(1);
                  }}
                  className="sm:w-40 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="All">
                    All Conditions
                  </option>
                  <option value="New">
                    New
                  </option>
                  <option value="Used">
                    Used
                  </option>
                </select>

              </div>
            </div>

            {/* =================================================
                CARS GRID
            ================================================= */}

            {loading ? (
              <p className="text-center text-slate-400 py-12">
                Loading inventory...
              </p>
            ) : filteredCars.length === 0 ? (
              <p className="text-center text-slate-400 py-12">
                No vehicles match your search
                criteria.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

                  {currentCars.map((car) => (
                    <div
                      key={car.id}
                      onClick={() =>
                        setSelectedCar(car)
                      }
                      className={`group cursor-pointer bg-gray-900/80 backdrop-blur-md border ${
                        car.isSold
                          ? "border-red-500/60"
                          : "border-slate-700/60"
                      } rounded-2xl p-4 shadow-xl hover:border-amber-500/80 transition transform hover:-translate-y-1 relative`}
                    >

                      {/* SOLD / AVAILABLE */}

                      <div className="absolute top-8 right-6 z-10">

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

                      {/* CONDITION / TYPE */}

                      <div className="absolute top-2 left-6 z-10 flex gap-2">

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            car.condition === "New"
                              ? "bg-emerald-500 text-slate-950"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {car.condition ||
                            "Used"}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-slate-950">
                          {car.type || "Sedan"}
                        </span>

                      </div>

                      {/* IMAGE */}

                      <div className="overflow-hidden rounded-xl mb-4 h-48 border border-slate-700/50 mt-4">

                        <img
                          src={
                            car.imageUrl ||
                            "/explore.jpeg"
                          }
                          alt={`${car.make} ${car.model}`}
                          className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${
                            car.isSold
                              ? "opacity-60 grayscale-[30%]"
                              : ""
                          }`}
                        />

                      </div>

                      {/* DETAILS */}

                      <div className="text-center">

                        <h3 className="text-xl font-bold text-white">
                          {car.make} {car.model}
                        </h3>

                        <p
                          className={`font-semibold text-lg mt-1 ${
                            car.isSold
                              ? "text-red-400 line-through"
                              : "text-amber-500"
                          }`}
                        >
                          $
                          {Number(
                            car.price
                          ).toLocaleString()}
                        </p>

                      </div>

                    </div>
                  ))}

                </div>

                {/* =================================================
                    PAGINATION
                ================================================= */}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">

                    <button
                      onClick={() =>
                        handlePageChange(
                          currentPage - 1
                        )
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
                    >
                      Previous
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() =>
                          handlePageChange(page)
                        }
                        className={`px-3.5 py-2 rounded-xl text-sm font-bold transition ${
                          currentPage === page
                            ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                            : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        handlePageChange(
                          currentPage + 1
                        )
                      }
                      disabled={
                        currentPage === totalPages
                      }
                      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition"
                    >
                      Next
                    </button>

                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* =====================================================
            TAB 2: SPARE PARTS
        ===================================================== */}

        {activeTab === "parts" && (
          <>
            {/* SPARE PARTS PORTFOLIO */}

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

                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-emerald-300 font-medium text-xs">
                  Categories: {parts.length}
                </div>

              </div>

              <div className="sm:p-6 p-3 bg-gradient-to-r from-slate-900/80 via-slate-900/80 to-amber-950/40 border border-amber-500/30 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between">

                <div>

                  <p className="text-amber-400 font-semibold text-xs tracking-wider uppercase">
                    Total Units Stocked
                  </p>

                  <h3 className="text-3xl font-extrabold text-white mt-1">
                    {totalPartsStock}
                  </h3>

                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-amber-300 font-medium text-xs">
                  Physical Inventory
                </div>

              </div>

            </div>

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="mb-6 flex gap-3 bg-gray-900/80 p-3 rounded-2xl border border-slate-700/60 backdrop-blur-md">

              <input
                type="text"
                placeholder="Search spare parts by name, SKU, or category..."
                value={partsQuery}
                onChange={(e) =>
                  setPartsQuery(
                    e.target.value
                  )
                }
                className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              />

              {partsQuery && (
                <button
                  onClick={() =>
                    setPartsQuery("")
                  }
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-semibold transition"
                >
                  Clear
                </button>
              )}

            </div>

            {/* =================================================
                PARTS TABLE
            ================================================= */}

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
                    </tr>

                  </thead>

                  <tbody>

                    {parts.map((p) => (
                      <tr
                        key={p.id}
                        className="border-t border-slate-800/80 hover:bg-slate-800/40"
                      >

                        <td className="p-4 text-xs font-bold text-white flex items-center gap-3">

                          <img
                            src={
                              p.imageUrl ||
                              "/explore.jpeg"
                            }
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-lg border sm:block hidden border-slate-700"
                          />

                          {p.name}

                        </td>

                        <td className="p-4 font-mono text-xs text-slate-400">
                          {p.partNumber}
                        </td>

                        <td className="p-4">
                          {p.category}
                        </td>

                        <td className="p-4 text-xs text-slate-400">
                          {p.compatibleModels ||
                            "Universal"}
                        </td>

                        <td className="p-4 font-bold text-amber-500">
                          $
                          {p.price.toLocaleString()}
                        </td>

                        <td className="p-4">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              p.quantityInStock >
                              0
                                ? "bg-emerald-500/20  text-emerald-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {p.quantityInStock}{" "}
                            
                          </span>

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}
          </>
        )}

      </main>

      {/* =====================================================
          VEHICLE DETAILS MODAL
      ===================================================== */}

      {selectedCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">

          <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-start border-b border-slate-700/60 pb-3">

              <div>

                <div className="flex items-center gap-2">

                  <h3 className="text-2xl font-bold text-white">
                    {selectedCar.make}{" "}
                    {selectedCar.model}
                  </h3>

                  {selectedCar.isSold ? (
                    <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold uppercase">
                      Sold
                    </span>
                  ) : (
                    <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded font-bold uppercase">
                      In Stock
                    </span>
                  )}

                </div>

                <p
                  className={`font-bold text-xl mt-1 ${
                    selectedCar.isSold
                      ? "text-red-400"
                      : "text-amber-500"
                  }`}
                >
                  $
                  {Number(
                    selectedCar.price
                  ).toLocaleString()}
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedCar(null)
                }
                className="text-slate-400 hover:text-white text-2xl font-bold p-1 transition cursor-pointer"
              >
                ✕
              </button>

            </div>

            {/* IMAGE */}

            <div className="relative">

              <img
                src={
                  selectedCar.imageUrl ||
                  "/explore.jpeg"
                }
                alt={`${selectedCar.make} ${selectedCar.model}`}
                className="w-full h-56 object-cover rounded-xl border border-slate-700/60"
              />

              <div className="absolute top-3 left-3 flex gap-2">

                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    selectedCar.condition ===
                    "New"
                      ? "bg-emerald-500 border-emerald-400 text-slate-950"
                      : "bg-slate-900/80 border-slate-700 text-slate-300"
                  }`}
                >
                  {selectedCar.condition ||
                    "Used"}
                </span>

                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md">
                  {selectedCar.type ||
                    "Sedan"}
                </span>

              </div>

            </div>

            {/* DETAILS */}

            <div className="grid grid-cols-2 gap-3 text-sm pt-2">

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">

                <p className="text-slate-400 text-xs">
                  YEAR
                </p>

                <p className="font-semibold text-white">
                  {selectedCar.year}
                </p>

              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">

                <p className="text-slate-400 text-xs">
                  MILEAGE
                </p>

                <p className="font-semibold text-white">
                  {Number(
                    selectedCar.mileage
                  ).toLocaleString()}{" "}
                  miles
                </p>

              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">

                <p className="text-slate-400 text-xs">
                  COLOR
                </p>

                <p className="font-semibold text-white">
                  {selectedCar.color ||
                    "N/A"}
                </p>

              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">

                <p className="text-slate-400 text-xs">
                  TRANSMISSION
                </p>

                <p className="font-semibold text-white">
                  {selectedCar.transmission ||
                    "N/A"}
                </p>

              </div>

              <div className="col-span-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">

                <p className="text-slate-400 text-xs">
                  ENGINE SIZE
                </p>

                <p className="font-semibold text-white">
                  {selectedCar.engineSize ||
                    "N/A"}
                </p>

              </div>

            </div>

            <button
              onClick={() =>
                setSelectedCar(null)
              }
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition cursor-pointer mt-4"
            >
              Close Details
            </button>

          </div>
        </div>
      )}

      {/* =====================================================
          ADD VEHICLE MODAL
      ===================================================== */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">

          <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">

              <h3 className="text-xl font-bold text-white">
                Add New Vehicle
              </h3>

              <button
                onClick={() =>
                  setShowAddModal(false)
                }
                className="text-slate-400 hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleAddCar}
              className="space-y-3"
            >

              <input
                type="text"
                placeholder="Make (e.g. BMW)"
                required
                value={formData.make}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    make: e.target.value,
                  })
                }
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
              />

              <input
                type="text"
                placeholder="Model (e.g. M4)"
                required
                value={formData.model}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    model: e.target.value,
                  })
                }
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
              />

              <div className="grid grid-cols-2 gap-2">

                <input
                  type="number"
                  placeholder="Year"
                  required
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
                />

                <input
                  type="number"
                  placeholder="Price ($)"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
                />

              </div>

              <div className="grid grid-cols-2 gap-2">

                <input
                  type="number"
                  placeholder="Mileage"
                  required
                  value={formData.mileage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mileage: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
                />

                <input
                  type="text"
                  placeholder="Color"
                  required
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      color: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
                />

              </div>

              <input
                type="text"
                placeholder="Engine Size (e.g. 3.0L)"
                required
                value={formData.engineSize}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    engineSize: e.target.value,
                  })
                }
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
              />

              {/* TRANSMISSION */}

              <div className="flex flex-col gap-1">

                <label className="text-xs font-semibold text-slate-400">
                  Transmission
                </label>

                <select
                  value={
                    formData.transmission
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transmission:
                        e.target.value,
                    })
                  }
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
                >
                  <option value="Automatic">
                    Automatic
                  </option>

                  <option value="Manual">
                    Manual
                  </option>

                  <option value="Dual-Clutch">
                    Dual-Clutch
                  </option>
                </select>

              </div>

              {/* CAR TYPE */}

              <div className="flex flex-col gap-1">

                <label className="text-xs font-semibold text-slate-400">
                  Car Type
                </label>

                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
                >
                  <option value="Sedan">
                    Sedan
                  </option>

                  <option value="SUV">
                    SUV
                  </option>

                  <option value="Crossover SUV">
                    Crossover SUV
                  </option>

                  <option value="Van">
                    Van
                  </option>

                  <option value="Hatchback">
                    Hatchback
                  </option>

                  <option value="Coupe">
                    Coupe
                  </option>

                  <option value="Truck">
                    Truck
                  </option>
                </select>

              </div>

              {/* CONDITION */}

              <div className="flex flex-col gap-1">

                <label className="text-xs font-semibold text-slate-400">
                  Condition
                </label>

                <select
                  value={
                    formData.condition
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      condition:
                        e.target.value,
                    })
                  }
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
                >
                  <option value="Used">
                    Used / Pre-Owned
                  </option>

                  <option value="New">
                    Brand New
                  </option>
                </select>

              </div>

              {/* IMAGE */}

              <div className="space-y-2">

                <label className="block text-xs font-semibold text-slate-400">
                  Upload Vehicle Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageUpload
                  }
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer bg-slate-800 border border-slate-700 rounded-xl p-2"
                />

              </div>

              {/* IMAGE PREVIEW */}

              {formData.imageUrl && (
                <div className="mt-3">

                  <p className="text-xs text-slate-400 mb-1">
                    Preview:
                  </p>

                  <img
                    src={formData.imageUrl}
                    alt="Selected Vehicle Preview"
                    className="w-full h-40 object-cover rounded-xl border border-slate-700"
                  />

                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition cursor-pointer mt-4"
              >
                Save Vehicle
              </button>

            </form>

          </div>
        </div>
      )}

      {/* =====================================================
          ADD SPARE PART MODAL
      ===================================================== */}

      {showAddPartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">

          <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">

              <h3 className="text-xl font-bold text-white">
                Add Spare Part
              </h3>

              <button
                onClick={() =>
                  setShowAddPartModal(false)
                }
                className="text-slate-400 hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleAddPart}
              className="space-y-3"
            >

              {/* PART NAME */}

              <input
                type="text"
                placeholder="Part Name"
                required
                value={partFormData.name}
                onChange={(e) =>
                  setPartFormData({
                    ...partFormData,
                    name: e.target.value,
                  })
                }
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
              />

              {/* PART NUMBER + CATEGORY */}

              <div className="grid grid-cols-2 gap-2">

                <input
                  type="text"
                  placeholder="Part Number (SKU)"
                  required
                  value={
                    partFormData.partNumber
                  }
                  onChange={(e) =>
                    setPartFormData({
                      ...partFormData,
                      partNumber:
                        e.target.value,
                    })
                  }
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
                />

                <select
                  value={
                    partFormData.category
                  }
                  onChange={(e) =>
                    setPartFormData({
                      ...partFormData,
                      category:
                        e.target.value,
                    })
                  }
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
                >
                  <option value="Brakes">
                    Brakes
                  </option>

                  <option value="Engine">
                    Engine
                  </option>

                  <option value="Suspension">
                    Suspension
                  </option>

                  <option value="Electrical">
                    Electrical
                  </option>

                  <option value="Accessories">
                    Accessories
                  </option>
                </select>

              </div>

              {/* PRICE + QUANTITY */}

              <div className="grid grid-cols-2 gap-2">

                <input
                  type="number"
                  placeholder="Price ($)"
                  required
                  value={
                    partFormData.price
                  }
                  onChange={(e) =>
                    setPartFormData({
                      ...partFormData,
                      price: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
                />

                <input
                  type="number"
                  placeholder="Quantity Stock"
                  required
                  value={
                    partFormData.quantityInStock
                  }
                  onChange={(e) =>
                    setPartFormData({
                      ...partFormData,
                      quantityInStock:
                        e.target.value,
                    })
                  }
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
                />

              </div>

              {/* COMPATIBLE MODELS */}

              <input
                type="text"
                placeholder="Compatible Models (e.g. BMW E46, Civic 2020)"
                value={
                  partFormData.compatibleModels
                }
                onChange={(e) =>
                  setPartFormData({
                    ...partFormData,
                    compatibleModels:
                      e.target.value,
                  })
                }
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
              />

              {/* IMAGE UPLOAD */}

             <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400">
                  Upload Spare Part Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePartImageUpload}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer bg-slate-800 border border-slate-700 rounded-xl p-2"
                />
              </div>

              {partFormData.imageUrl && (
                <div className="mt-3">
                  <p className="text-xs text-slate-400 mb-1">Preview:</p>
                  <img
                    src={partFormData.imageUrl}
                    alt="Selected Part Preview"
                    className="w-full h-40 object-cover rounded-xl border border-slate-700"
                  />
                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition cursor-pointer mt-4"
              >
                Save Spare Part
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default InventoryPage;