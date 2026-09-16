import type { Car } from "../../../types/Admin";
import React from "react";
type CarDetailsModalProps = {
  car: Car;
  fallbackImage: string;
  onClose: () => void;
};

function CarDetailsModal({
  car,
  fallbackImage,
  onClose,
}: CarDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">

      <div className="relative z-10 w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-start border-b border-slate-700/60 pb-3">

          <div>
            <div className="flex items-center gap-2">

              <h3 className="text-2xl font-bold text-white">
                {car.make} {car.model}
              </h3>

              {car.isSold ? (
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
                car.isSold
                  ? "text-red-400"
                  : "text-amber-500"
              }`}
            >
              $
              {parseFloat(
                String(car.price || 0)
              ).toLocaleString()}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-bold p-1 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <img
          src={
            car.imageUrl ||
            fallbackImage
          }
          alt={`${car.make} ${car.model}`}
          className="w-full h-56 object-cover rounded-xl border border-slate-700/60"
        />

        <div className="grid grid-cols-2 gap-3 text-sm pt-2">

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
            <p className="text-slate-400 text-xs">
              YEAR
            </p>

            <p className="font-semibold text-white">
              {car.year}
            </p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
            <p className="text-slate-400 text-xs">
              MILEAGE
            </p>

            <p className="font-semibold text-white">
              {car.mileage?.toLocaleString()} miles
            </p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
            <p className="text-slate-400 text-xs">
              COLOR
            </p>

            <p className="font-semibold text-white">
              {car.color}
            </p>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
            <p className="text-slate-400 text-xs">
              TRANSMISSION
            </p>

            <p className="font-semibold text-white">
              {car.transmission}
            </p>
          </div>

          <div className="col-span-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
            <p className="text-slate-400 text-xs">
              ENGINE SIZE
            </p>

            <p className="font-semibold text-white">
              {car.engineSize}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition cursor-pointer mt-4"
        >
          Close Details
        </button>
      </div>
    </div>
  );
}

export default CarDetailsModal;