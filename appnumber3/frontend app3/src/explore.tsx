import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    type: string;
  condition: "New" | "Used";
};
function Explore() {
  const navigate = useNavigate();
 const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(cars.length / ITEMS_PER_PAGE) || 1;
  const paginatedCars = cars.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
useEffect(() => {
  fetch("http://localhost:5038/api/cars")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch cars");
      return res.json();
    })
    .then((data: Car[]) => {
      if (Array.isArray(data)) {
        setCars(data); // Stores all cars (including sold ones)
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
}, []);
  return (
    <div className="relative min-h-screen w-screen bg-black text-white overflow-y-auto">
      {/* Navigation Bar */}
      <nav className="fixed top-0 z-40 w-full px-8 py-5 bg-black/40 backdrop-blur-lg border-b border-white/10 flex items-center justify-between">
        <div className="w-24 hidden md:block" />
        <h1 className="text-2xl font-extrabold tracking-wider text-gray-200 uppercase text-center absolute left-1/2 -translate-x-1/2">
          Vanguard Drive
        </h1>
        <button
          onClick={() => navigate("/login")}
          className="ml-auto py-2.5 px-6 bg-gray-900 hover:bg-red-900 text-white rounded-xl font-semibold shadow-lg shadow-red-900/60 transition cursor-pointer"
        >
          Login
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
  <h2 className="text-3xl font-bold mb-8 text-center text-amber-500">
    Inventory
  </h2>

  {loading ? (
    <p className="text-center text-slate-400">Loading cars...</p>
  ) : cars.length === 0 ? (
    <p className="text-center text-slate-400">No cars available right now.</p>
  ) : (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {paginatedCars.map((car) => (
          <div
            key={car.id}
            onClick={() => !car.isSold && setSelectedCar(car)}
            className={`group relative bg-gray-900/80 backdrop-blur-md border rounded-2xl p-4 shadow-xl transition transform ${
              car.isSold
                ? "border-red-900/40 opacity-75 cursor-not-allowed"
                : "border-slate-700/60 hover:border-purple-500/80 hover:-translate-y-1 cursor-pointer"
            }`}
          >
            {/* Vehicle Image Container */}
            <div className="relative overflow-hidden rounded-xl mb-4 h-48 border border-slate-700/50">
              <img
                src={car.imageUrl || "/explore.jpeg"}
                alt={`${car.make} ${car.model}`}
                className={`w-full h-full object-cover transition duration-300 ${
                  car.isSold ? "grayscale" : "group-hover:scale-105"
                }`}
              />
<div className="absolute top-2 right-6 z-10">
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

                {/* Condition and Type Badges */}
                <div className="absolute top-3 left-3 z-10 flex gap-2 ">
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

            {/* Card Header */}
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
</main>

      {/* Modal Popup for Full Details */}
      {selectedCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
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
                onClick={() => setSelectedCar(null)}
                className="text-slate-400 hover:text-white text-2xl font-bold p-1 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Vehicle Image */}
            <img
              src={selectedCar.imageUrl || "/explore.jpeg"}
              alt={`${selectedCar.make} ${selectedCar.model}`}
              className="w-full h-56 object-cover rounded-xl border border-slate-700/60"
            />

            {/* Detailed Specifications List */}
            <div className="grid grid-cols-2 gap-3 text-sm pt-2">
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
                <p className="font-semibold text-white">{selectedCar.color}</p>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                <p className="text-slate-400 text-xs">TRANSMISSION</p>
                <p className="font-semibold text-white">
                  {selectedCar.transmission}
                </p>
              </div>
              <div className="col-span-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                <p className="text-slate-400 text-xs">ENGINE SIZE</p>
                <p className="font-semibold text-white">
                  {selectedCar.engineSize}
                </p>
              </div>
            </div>

            {/* Action / Close Button */}
            <div className="flex flex-col gap-3 mt-4">
             
              <button
                onClick={() => setSelectedCar(null)}
                className="w-full py-3 bg-gray-600 text-white font-semibold rounded-xl shadow-lg transition cursor-pointer mt-4"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Explore;