import React from "react";
import type {
  FormData,
} from "../../../types/Admin";

type AddVehicleModalProps = {
  formData: FormData;
  setFormData: React.Dispatch<
    React.SetStateAction<FormData>
  >;
  onClose: () => void;
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>
  ) => void;
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
};

function AddVehicleModal({
  formData,
  setFormData,
  onClose,
  onSubmit,
  onImageUpload,
}: AddVehicleModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">

      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">

          <h3 className="text-xl font-bold text-white">
            Add New Vehicle
          </h3>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={onSubmit}
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
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500"
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
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500"
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
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500"
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
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500"
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
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500"
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
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">

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
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500"
            />

            <select
              value={formData.transmission}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  transmission: e.target.value,
                })
              }
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500"
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

          {/* TYPE */}

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
              className="bg-slate-800 border border-slate-700 text-white p-2.5 rounded-lg"
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
              value={formData.condition}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  condition: e.target.value,
                })
              }
              className="bg-slate-800 border border-slate-700 text-white p-2.5 rounded-lg"
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

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Vehicle Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition cursor-pointer mt-4"
          >
            Add Vehicle
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddVehicleModal;