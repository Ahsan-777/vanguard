import React from "react";
import type {
  PartFormDataState,
} from "../../../types/Admin";

type AddPartModalProps = {
  formData: PartFormDataState;
  setFormData: React.Dispatch<
    React.SetStateAction<PartFormDataState>
  >;
  onClose: () => void;
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>
  ) => void;
  onImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
};

function AddPartModal({
  formData,
  setFormData,
  onClose,
  onSubmit,
  onImageUpload,
}: AddPartModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">

      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">

          <h3 className="text-xl font-bold text-white">
            Add Spare Part
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
            placeholder="Part Name"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
          />

          <div className="grid grid-cols-2 gap-2">

            <input
              type="text"
              placeholder="Part Number (SKU)"
              required
              value={formData.partNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  partNumber: e.target.value,
                })
              }
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
            />

            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value,
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

          <div className="grid grid-cols-2 gap-2">

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

            <input
              type="number"
              placeholder="Quantity Stock"
              required
              value={formData.quantityInStock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantityInStock:
                    e.target.value,
                })
              }
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
            />
          </div>

          <input
            type="text"
            placeholder="Compatible Models (e.g. BMW E46, Civic 2020)"
            value={formData.compatibleModels}
            onChange={(e) =>
              setFormData({
                ...formData,
                compatibleModels:
                  e.target.value,
              })
            }
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-500 text-sm"
          />

          {/* IMAGE */}

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400">
              Upload Spare Part Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer bg-slate-800 border border-slate-700 rounded-xl p-2"
            />
          </div>

          {formData.imageUrl && (
            <div className="mt-3">
              <p className="text-xs text-slate-400 mb-1">
                Preview:
              </p>

              <img
                src={formData.imageUrl}
                alt="Selected Part Preview"
                className="w-full h-40 object-cover rounded-xl border border-slate-700"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 transition cursor-pointer mt-4"
          >
            Save Spare Part
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddPartModal;