import type { Car } from "../../types/Admin";
import Pagination from "./common/Pagination";

type InventoryProps = {
  cars: Car[];
  paginatedCars: Car[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  fallbackImage: string;
  onPageChange: (page: number) => void;
  onSelectCar: (car: Car) => void;
};

function Inventory({
  cars,
  paginatedCars,
  loading,
  currentPage,
  totalPages,
  fallbackImage,
  onPageChange,
  onSelectCar,
}: InventoryProps) {
  return (
    <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-md shadow-2xl space-y-6 mb-9">

      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-amber-500">
            Vehicle Inventory
          </h2>

          <p className="text-slate-400 text-xs mt-1">
            Browse and inspect active stock and sold units.
          </p>
        </div>

        <span className="text-sm bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl text-slate-300">
          Total Vehicles:{" "}
          <strong className="text-white">
            {cars.length}
          </strong>
        </span>
      </div>

      {loading ? (
        <p className="text-center text-slate-400 py-12">
          Loading inventory...
        </p>
      ) : cars.length === 0 ? (
        <p className="text-center text-slate-400 py-12">
          No vehicles found in inventory.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCars.map((car) => (
              <div
                key={car.id}
                onClick={() => onSelectCar(car)}
                className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden hover:border-amber-500/60 transition cursor-pointer shadow-lg group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={
                        car.imageUrl ||
                        fallbackImage
                      }
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />

                    {car.isSold ? (
                      <span className="absolute top-3 right-3 bg-red-600/90 text-white text-xs px-2.5 py-1 rounded-lg font-extrabold uppercase backdrop-blur-md">
                        Sold
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 bg-emerald-600/90 text-white text-xs px-2.5 py-1 rounded-lg font-extrabold uppercase backdrop-blur-md">
                        In Stock
                      </span>
                    )}

                    <div className="absolute top-3 left-3 z-10 flex gap-2">
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
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition">
                      {car.make} {car.model}
                    </h3>

                    <p className="text-xs text-slate-400">
                      {car.year} •{" "}
                      {car.mileage?.toLocaleString()}{" "}
                      miles • {car.transmission}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex justify-between items-center border-t border-slate-700/40 mt-3">
                  <span className="text-xs text-slate-400">
                    Price
                  </span>

                  <span
                    className={`font-extrabold text-lg ${
                      car.isSold
                        ? "text-red-400"
                        : "text-amber-400"
                    }`}
                  >
                    $
                    {parseFloat(
                      String(car.price || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
}

export default Inventory;