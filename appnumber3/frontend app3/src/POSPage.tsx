// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// type Vehicle = {
//   id: number;
//   make: string;
//   model: string;
//   year: number;
//   price: number;
//   isSold: boolean;
// };

// type SparePart = {
//   id: number;
//   name: string;
//   partNumber: string;
//   category: string;
//   price: number;
//   quantityInStock: number;
//   soldQuantity: number;
// };

// type PendingSale = {
//   type: "part" | "car";
//   id: number;
//   qtyToSell: number;
//   itemName: string;
//   itemPrice: number;
// } | null;

// function POSPage() {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState<"cars" | "parts">("cars");

//   const [parts, setParts] = useState<SparePart[]>([]);
//   const [cars, setCars] = useState<Vehicle[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [search, setSearch] = useState<string>("");

//   // Quantity States (Allows string for inline typing)
//   const [selectedPartQuantities, setSelectedPartQuantities] = useState<{ [key: number]: number | string }>({});
//   const [pendingSale, setPendingSale] = useState<PendingSale>(null);
//   const [customerName, setCustomerName] = useState<string>("");
//   const [customerPhone, setCustomerPhone] = useState<string>("");
//   const [submittingSale, setSubmittingSale] = useState<boolean>(false);
  
//   // Pagination States
//   const itemsPerPage = 5;
//   const [carsPage, setCarsPage] = useState<number>(1);
//   const [partsPage, setPartsPage] = useState<number>(1);

//   const token = localStorage.getItem("token");

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [partsRes, carsRes] = await Promise.all([
//         fetch(`http://localhost:5038/api/spareparts?query=${encodeURIComponent(search)}`),
//         fetch("http://localhost:5038/api/cars"),
//       ]);

//       if (partsRes.ok) {
//         const partsData = await partsRes.json();
//         setParts(partsData);
//         // Default quantity 1 for each part
//         const initialQty: { [key: number]: number } = {};
//         partsData.forEach((p: SparePart) => {
//           initialQty[p.id] = 1;
//         });
//         setSelectedPartQuantities(initialQty);
//       }
//       if (carsRes.ok) setCars(await carsRes.json());
//     } catch (err) {
//       console.error("Error loading inventory:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     setCarsPage(1);
//     setPartsPage(1);
//   }, [search]);

//   // Filter low stock parts (10 or fewer units available)
//   const lowStockParts = parts.filter((p) => p.quantityInStock <= 10);

//   // Direct typing and button handler
//   const handlePartQtyChange = (
//     id: number,
//     value: number | string,
//     maxQty: number,
//     isDirectInput: boolean = false
//   ) => {
//     if (isDirectInput) {
//       const stringVal = value.toString();
      
//       // Allow empty string so user can freely edit/delete digits
//       if (stringVal === "") {
//         setSelectedPartQuantities((prev) => ({ ...prev, [id]: "" }));
//         return;
//       }

//       // Allow typing numbers only
//       if (/^\d+$/.test(stringVal)) {
//         const parsed = parseInt(stringVal, 10);
//         // Clamp to stock limit
//         const clamped = Math.min(parsed, maxQty);
//         setSelectedPartQuantities((prev) => ({ ...prev, [id]: clamped }));
//       }
//     } else {
//       // + and - buttons handler
//       setSelectedPartQuantities((prev) => {
//         const currentRaw = prev[id];
//         const current = typeof currentRaw === "number" ? currentRaw : parseInt(currentRaw as string, 10) || 1;
//         const updated = current + (value as number);
//         if (updated < 1 || updated > maxQty) return prev;
//         return { ...prev, [id]: updated };
//       });
//     }
//   };

//   // Blur event handles empty values when clicking away
//   const handlePartQtyBlur = (id: number, maxQty: number) => {
//     setSelectedPartQuantities((prev) => {
//       const val = prev[id];
//       let numVal = typeof val === "string" ? parseInt(val, 10) : val;

//       if (isNaN(numVal) || numVal < 1) {
//         numVal = 1;
//       } else if (numVal > maxQty) {
//         numVal = maxQty;
//       }

//       return { ...prev, [id]: numVal };
//     });
//   };

//   // Open Pop-up for Spare Part Sale
//   const initiatePartSale = (item: SparePart) => {
//     const rawQty = selectedPartQuantities[item.id];
//     const parsedQty = typeof rawQty === "string" ? parseInt(rawQty, 10) : rawQty;
//     const qtyToSell = isNaN(parsedQty) || parsedQty < 1 ? 1 : Math.min(parsedQty, item.quantityInStock);

//     setPendingSale({
//       type: "part",
//       id: item.id,
//       qtyToSell,
//       itemName: item.name,
//       itemPrice: item.price,
//     });
//     setCustomerName("");
//     setCustomerPhone("");
//   };

//   // Open Pop-up for Vehicle Sale
//   const initiateCarSale = (car: Vehicle) => {
//     setPendingSale({
//       type: "car",
//       id: car.id,
//       qtyToSell: 1,
//       itemName: `${car.make} ${car.model} (${car.year})`,
//       itemPrice: car.price,
//     });
//     setCustomerName("");
//     setCustomerPhone("");
//   };

//   // Final Submit Action on Confirming Pop-up
//   const handleConfirmSale = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!pendingSale) return;

//     if (!customerName.trim() || !customerPhone.trim()) {
//       alert("Please enter customer name and phone number.");
//       return;
//     }

//     setSubmittingSale(true);

//     try {
//       const endpoint =
//         pendingSale.type === "part"
//           ? `http://localhost:5038/api/spareparts/buy/${pendingSale.id}`
//           : `http://localhost:5038/api/cars/buy/${pendingSale.id}`;

//       const payload =
//         pendingSale.type === "part"
//           ? {
//               quantity: pendingSale.qtyToSell,
//               customerName: customerName.trim(),
//               customerPhone: customerPhone.trim(),
//             }
//           : {
//               customerName: customerName.trim(),
//               customerPhone: customerPhone.trim(),
//             };

//       const res = await fetch(endpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         alert(data.message || "Sold successfully!");

//         const wantBill = window.confirm("Do you want to generate bill?");

//         if (wantBill && data.saleId) {
//           const receiptUrl =
//             pendingSale.type === "part"
//               ? `http://localhost:5038/api/spareparts/receipt/${data.saleId}/preview`
//               : `http://localhost:5038/api/cars/receipt/${data.saleId}/preview`;

//           window.open(receiptUrl, "_blank");
//         }

//         setPendingSale(null);
//         fetchData();
//       } else {
//         alert(data.message || "Failed to complete sale.");
//       }
//     } catch (err) {
//       console.error("Sale error:", err);
//       alert("An error occurred while processing the sale.");
//     } finally {
//       setSubmittingSale(false);
//     }
//   };

//   // Search & Pagination Calculations: Cars
//   const filteredCars = cars.filter(
//     (car) =>
//       car.make.toLowerCase().includes(search.toLowerCase()) ||
//       car.model.toLowerCase().includes(search.toLowerCase()) ||
//       car.year.toString().includes(search)
//   );

//   const totalCarsPages = Math.ceil(filteredCars.length / itemsPerPage) || 1;
//   const currentCars = filteredCars.slice(
//     (carsPage - 1) * itemsPerPage,
//     carsPage * itemsPerPage
//   );

//   // Pagination Calculations: Parts
//   const totalPartsPages = Math.ceil(parts.length / itemsPerPage) || 1;
//   const currentParts = parts.slice(
//     (partsPage - 1) * itemsPerPage,
//     partsPage * itemsPerPage
//   );

//   return (
//     <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans">
//       <div className="max-w-7xl mx-auto space-y-6">
        
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
//           <div>
//             <h1 className="text-2xl font-bold tracking-wide text-white uppercase">
//               VANGUARD DRIVE
//             </h1>
//             <p className="text-slate-400 text-sm mt-1">
//               POS Counter - Quantity Selection & Sales
//             </p>
//           </div>
//           <button
//             onClick={() => {
//               localStorage.clear();
//               navigate("/login");
//             }}
//             className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm rounded-xl transition cursor-pointer"
//           >
//             Logout
//           </button>
//         </div>

//         {/* LOW STOCK ALERT BANNER (NO REFILL BUTTON) */}
//         {lowStockParts.length > 0 && (
//           <div className="p-4 bg-amber-500/10 border border-amber-500/50 rounded-2xl flex items-start gap-3 shadow-lg">
//             <span className="text-2xl">🚨</span>
//             <div className="space-y-1.5">
//               <h3 className="font-bold text-amber-400 text-sm sm:text-base">
//                 Low Stock Warning
//               </h3>
//               <p className="text-xs text-slate-300">
//                 {lowStockParts.length} product(s) have reached or fallen below 10 units in stock:
//               </p>

//               {/* Product Badges with remaining quantity */}
//               <div className="flex flex-wrap gap-2 pt-1">
//                 {lowStockParts.map((item) => (
//                   <span
//                     key={item.id}
//                     className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-amber-500/40 rounded-lg text-xs font-semibold text-white"
//                   >
//                     <span>{item.name}</span>
//                     <span className="text-red-400 font-bold">
//                       ({item.quantityInStock} left)
//                     </span>
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Tab Controls & Search */}
//         <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/80 p-4 rounded-2xl border border-slate-800 gap-4">
//           <div className="flex bg-slate-800 p-1.5 rounded-xl border border-slate-700/60 w-full sm:w-auto">
//             <button
//               onClick={() => setActiveTab("cars")}
//               className={`flex-1 sm:flex-initial px-6 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
//                 activeTab === "cars" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white"
//               }`}
//             >
//               Vehicles Inventory
//             </button>
//             <button
//               onClick={() => setActiveTab("parts")}
//               className={`flex-1 sm:flex-initial px-6 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
//                 activeTab === "parts" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white"
//               }`}
//             >
//               Spare Parts Inventory
//             </button>
//           </div>

//           <input
//             type="text"
//             placeholder="Search inventory..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full sm:w-80 px-4 py-2 bg-slate-800/90 text-white border border-slate-700 rounded-xl outline-none focus:border-orange-500 text-sm"
//           />
//         </div>

//         {loading ? (
//           <div className="text-center py-20 text-slate-400">Loading inventory data...</div>
//         ) : (
//           <div>
//             {/* CARS TAB */}
//             {activeTab === "cars" && (
//               <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto">
//                 <table className="w-full text-left border-collapse text-sm">
//                   <thead>
//                     <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
//                       <th className="p-4">Vehicle</th>
//                       <th className="p-4">Year</th>
//                       <th className="p-4">Price</th>
//                       <th className="p-4">Status</th>
//                       <th className="p-4 text-center">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-800 text-slate-200">
//                     {currentCars.map((car) => (
//                       <tr key={car.id} className="hover:bg-slate-800/40">
//                         <td className="p-4 font-semibold text-white">{car.make} {car.model}</td>
//                         <td className="p-4 text-slate-400">{car.year}</td>
//                         <td className="p-4 text-orange-400 font-bold">${Number(car.price).toLocaleString()}</td>
//                         <td className="p-4">
//                           <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${car.isSold ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
//                             {car.isSold ? "Sold" : "Available"}
//                           </span>
//                         </td>
//                         <td className="p-4 text-center">
//                           <button
//                             disabled={car.isSold}
//                             onClick={() => initiateCarSale(car)}
//                             className={`px-4 py-2 text-xs font-bold rounded-lg transition ${!car.isSold ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}
//                           >
//                             {!car.isSold ? "Sell Vehicle" : "Sold Out"}
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>

//                 {/* Cars Pagination */}
//                 {totalCarsPages > 1 && (
//                   <div className="flex justify-between items-center p-4 w-full border-t border-slate-800 text-sm text-slate-400">
//                     <span>
//                       Page <strong className="text-white">{carsPage}</strong> of <strong className="text-white">{totalCarsPages}</strong>
//                     </span>
//                     <div className="flex gap-2">
//                       <button
//                         disabled={carsPage === 1}
//                         onClick={() => setCarsPage((p) => Math.max(p - 1, 1))}
//                         className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
//                       >
//                         Previous
//                       </button>
//                       <button
//                         disabled={carsPage === totalCarsPages}
//                         onClick={() => setCarsPage((p) => Math.min(p + 1, totalCarsPages))}
//                         className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
//                       >
//                         Next
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* SPARE PARTS TAB */}
//             {activeTab === "parts" && (
//               <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto">
//                 <table className="w-full text-left border-collapse text-sm">
//                   <thead>
//                     <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
//                       <th className="p-4">Item Name</th>
//                       <th className="p-4">Part #</th>
//                       <th className="p-4">Price</th>
//                       <th className="p-4">Stock</th>
//                       <th className="p-4 text-center">Select Qty</th>
//                       <th className="p-4 text-center">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-800 text-slate-200">
//                     {currentParts.map((item) => {
//                       const rawQty = selectedPartQuantities[item.id];
//                       const qty = rawQty ?? 1;
//                       const displayQty = typeof qty === "number" ? qty : parseInt(qty, 10) || 1;

//                       return (
//                         <tr key={item.id} className="hover:bg-slate-800/40">
//                           <td className="p-4 font-semibold text-white">{item.name}</td>
//                           <td className="p-4 text-slate-400">{item.partNumber}</td>
//                           <td className="p-4 text-orange-400 font-bold">${item.price.toLocaleString()}</td>
//                           <td className="p-4">
//                             <div className="flex items-center gap-2">
//                               <span>{item.quantityInStock}</span>
//                               {item.quantityInStock <= 10 && item.quantityInStock > 0 && (
//                                 <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
//                                   Low Stock
//                                 </span>
//                               )}
//                             </div>
//                           </td>

//                           {/* QUANTITY COUNTER COLUMN */}
//                           <td className="p-4">
//                             <div className="flex items-center justify-center gap-1.5">
//                               <button
//                                 type="button"
//                                 disabled={item.quantityInStock <= 0 || displayQty <= 1}
//                                 onClick={() => handlePartQtyChange(item.id, -1, item.quantityInStock, false)}
//                                 className="w-8 h-8 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30 rounded-lg text-white font-bold border border-slate-700 transition cursor-pointer flex items-center justify-center"
//                               >
//                                 -
//                               </button>

//                               <input
//                                 type="text"
//                                 inputMode="numeric"
//                                 disabled={item.quantityInStock <= 0}
//                                 value={qty}
//                                 onFocus={(e) => e.target.select()}
//                                 onChange={(e) =>
//                                   handlePartQtyChange(item.id, e.target.value, item.quantityInStock, true)
//                                 }
//                                 onBlur={() => handlePartQtyBlur(item.id, item.quantityInStock)}
//                                 className="w-14 h-8 bg-slate-900 border border-slate-700 text-orange-400 font-bold text-center rounded-lg text-sm outline-none focus:border-orange-500 transition"
//                               />

//                               <button
//                                 type="button"
//                                 disabled={item.quantityInStock <= 0 || displayQty >= item.quantityInStock}
//                                 onClick={() => handlePartQtyChange(item.id, 1, item.quantityInStock, false)}
//                                 className="w-8 h-8 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30 rounded-lg text-white font-bold border border-slate-700 transition cursor-pointer flex items-center justify-center"
//                               >
//                                 +
//                               </button>
//                             </div>
//                           </td>

//                           <td className="p-4 text-center">
//                             <button
//                               disabled={item.quantityInStock <= 0}
//                               onClick={() => initiatePartSale(item)}
//                               className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
//                                 item.quantityInStock > 0
//                                   ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
//                                   : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
//                               }`}
//                             >
//                               {item.quantityInStock > 0 ? `Sell (${displayQty})` : "Out of Stock"}
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>

//                 {/* Spare Parts Pagination */}
//                 {totalPartsPages > 1 && (
//                   <div className="flex justify-between items-center p-4 bg-slate-800/30 border-t border-slate-800 text-sm text-slate-400">
//                     <span>
//                       Page <strong className="text-white">{partsPage}</strong> of <strong className="text-white">{totalPartsPages}</strong>
//                     </span>
//                     <div className="flex gap-2">
//                       <button
//                         disabled={partsPage === 1}
//                         onClick={() => setPartsPage((p) => Math.max(p - 1, 1))}
//                         className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
//                       >
//                         Previous
//                       </button>
//                       <button
//                         disabled={partsPage === totalPartsPages}
//                         onClick={() => setPartsPage((p) => Math.min(p + 1, totalPartsPages))}
//                         className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
//                       >
//                         Next
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* CUSTOMER DETAILS POPUP MODAL */}
//       {pendingSale && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
//           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
            
//             <div className="flex justify-between items-center border-b border-slate-800 pb-3">
//               <h2 className="text-lg font-bold text-white">Customer Sale Details</h2>
//               <button
//                 onClick={() => setPendingSale(null)}
//                 className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Order Summary */}
//             <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
//               <p className="text-sm text-slate-400">
//                 Item: <strong className="text-white">{pendingSale.itemName}</strong>
//               </p>
//               <p className="text-sm text-slate-400">
//                 Quantity: <strong className="text-orange-400">{pendingSale.qtyToSell}</strong>
//               </p>
//               <p className="text-sm text-slate-400">
//                 Total Price:{" "}
//                 <strong className="text-emerald-400">
//                   ${(pendingSale.itemPrice * pendingSale.qtyToSell).toLocaleString()}
//                 </strong>
//               </p>
//             </div>

//             {/* Form */}
//             <form onSubmit={handleConfirmSale} className="space-y-4">
//               <div>
//                 <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
//                   Customer Name
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="Enter name"
//                   value={customerName}
//                   onChange={(e) => setCustomerName(e.target.value)}
//                   className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-orange-500 transition"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
//                   Customer Phone Number
//                 </label>
//                 <input
//                   type="number"
//                   required
//                   placeholder="Enter phone number"
//                   value={customerPhone}
//                   onChange={(e) => setCustomerPhone(e.target.value)}
//                   className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-orange-500 transition"
//                 />
//               </div>

//               <div className="flex gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={() => setPendingSale(null)}
//                   className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition cursor-pointer"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submittingSale}
//                   className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition cursor-pointer"
//                 >
//                   {submittingSale ? "Processing..." : "Confirm Sale"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default POSPage;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Dynamic API base URL supporting both local environment and Vercel/Railway production
const API_BASE_URL = 
  (import.meta as any).env.VITE_API_URL || "http://localhost:5038/api";

type Vehicle = {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  isSold: boolean;
};

type SparePart = {
  id: number;
  name: string;
  partNumber: string;
  category: string;
  price: number;
  quantityInStock: number;
  soldQuantity: number;
};

type PendingSale = {
  type: "part" | "car";
  id: number;
  qtyToSell: number;
  itemName: string;
  itemPrice: number;
} | null;

function POSPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"cars" | "parts">("cars");

  const [parts, setParts] = useState<SparePart[]>([]);
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  // Quantity States (Allows string for inline typing)
  const [selectedPartQuantities, setSelectedPartQuantities] = useState<{ [key: number]: number | string }>({});
  const [pendingSale, setPendingSale] = useState<PendingSale>(null);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [submittingSale, setSubmittingSale] = useState<boolean>(false);
  
  // Pagination States
  const itemsPerPage = 5;
  const [carsPage, setCarsPage] = useState<number>(1);
  const [partsPage, setPartsPage] = useState<number>(1);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [partsRes, carsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/spareparts?query=${encodeURIComponent(search)}`),
        fetch(`${API_BASE_URL}/cars`),
      ]);

      if (partsRes.ok) {
        const partsData = await partsRes.json();
        setParts(partsData);
        // Default quantity 1 for each part
        const initialQty: { [key: number]: number } = {};
        partsData.forEach((p: SparePart) => {
          initialQty[p.id] = 1;
        });
        setSelectedPartQuantities(initialQty);
      }
      if (carsRes.ok) setCars(await carsRes.json());
    } catch (err) {
      console.error("Error loading inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setCarsPage(1);
    setPartsPage(1);
  }, [search]);

  // Filter low stock parts (10 or fewer units available)
  const lowStockParts = parts.filter((p) => p.quantityInStock <= 10);

  // Direct typing and button handler
  const handlePartQtyChange = (
    id: number,
    value: number | string,
    maxQty: number,
    isDirectInput: boolean = false
  ) => {
    if (isDirectInput) {
      const stringVal = value.toString();
      
      // Allow empty string so user can freely edit/delete digits
      if (stringVal === "") {
        setSelectedPartQuantities((prev) => ({ ...prev, [id]: "" }));
        return;
      }

      // Allow typing numbers only
      if (/^\d+$/.test(stringVal)) {
        const parsed = parseInt(stringVal, 10);
        // Clamp to stock limit
        const clamped = Math.min(parsed, maxQty);
        setSelectedPartQuantities((prev) => ({ ...prev, [id]: clamped }));
      }
    } else {
      // + and - buttons handler
      setSelectedPartQuantities((prev) => {
        const currentRaw = prev[id];
        const current = typeof currentRaw === "number" ? currentRaw : parseInt(currentRaw as string, 10) || 1;
        const updated = current + (value as number);
        if (updated < 1 || updated > maxQty) return prev;
        return { ...prev, [id]: updated };
      });
    }
  };

  // Blur event handles empty values when clicking away
  const handlePartQtyBlur = (id: number, maxQty: number) => {
    setSelectedPartQuantities((prev) => {
      const val = prev[id];
      let numVal = typeof val === "string" ? parseInt(val, 10) : val;

      if (isNaN(numVal) || numVal < 1) {
        numVal = 1;
      } else if (numVal > maxQty) {
        numVal = maxQty;
      }

      return { ...prev, [id]: numVal };
    });
  };

  // Open Pop-up for Spare Part Sale
  const initiatePartSale = (item: SparePart) => {
    const rawQty = selectedPartQuantities[item.id];
    const parsedQty = typeof rawQty === "string" ? parseInt(rawQty, 10) : rawQty;
    const qtyToSell = isNaN(parsedQty) || parsedQty < 1 ? 1 : Math.min(parsedQty, item.quantityInStock);

    setPendingSale({
      type: "part",
      id: item.id,
      qtyToSell,
      itemName: item.name,
      itemPrice: item.price,
    });
    setCustomerName("");
    setCustomerPhone("");
  };

  // Open Pop-up for Vehicle Sale
  const initiateCarSale = (car: Vehicle) => {
    setPendingSale({
      type: "car",
      id: car.id,
      qtyToSell: 1,
      itemName: `${car.make} ${car.model} (${car.year})`,
      itemPrice: car.price,
    });
    setCustomerName("");
    setCustomerPhone("");
  };

  // Final Submit Action on Confirming Pop-up
  const handleConfirmSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingSale) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please enter customer name and phone number.");
      return;
    }

    setSubmittingSale(true);

    try {
      const endpoint =
        pendingSale.type === "part"
          ? `${API_BASE_URL}/spareparts/buy/${pendingSale.id}`
          : `${API_BASE_URL}/cars/buy/${pendingSale.id}`;

      const payload =
        pendingSale.type === "part"
          ? {
              quantity: pendingSale.qtyToSell,
              customerName: customerName.trim(),
              customerPhone: customerPhone.trim(),
            }
          : {
              customerName: customerName.trim(),
              customerPhone: customerPhone.trim(),
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Sold successfully!");

        const wantBill = window.confirm("Do you want to generate bill?");

        if (wantBill && data.saleId) {
          const receiptUrl =
            pendingSale.type === "part"
              ? `${API_BASE_URL}/spareparts/receipt/${data.saleId}/preview`
              : `${API_BASE_URL}/cars/receipt/${data.saleId}/preview`;

          window.open(receiptUrl, "_blank");
        }

        setPendingSale(null);
        fetchData();
      } else {
        alert(data.message || "Failed to complete sale.");
      }
    } catch (err) {
      console.error("Sale error:", err);
      alert("An error occurred while processing the sale.");
    } finally {
      setSubmittingSale(false);
    }
  };

  // Search & Pagination Calculations: Cars
  const filteredCars = cars.filter(
    (car) =>
      car.make.toLowerCase().includes(search.toLowerCase()) ||
      car.model.toLowerCase().includes(search.toLowerCase()) ||
      car.year.toString().includes(search)
  );

  const totalCarsPages = Math.ceil(filteredCars.length / itemsPerPage) || 1;
  const currentCars = filteredCars.slice(
    (carsPage - 1) * itemsPerPage,
    carsPage * itemsPerPage
  );

  // Pagination Calculations: Parts
  const totalPartsPages = Math.ceil(parts.length / itemsPerPage) || 1;
  const currentParts = parts.slice(
    (partsPage - 1) * itemsPerPage,
    partsPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-wide text-white uppercase">
              VANGUARD DRIVE
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              POS Counter - Quantity Selection & Sales
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm rounded-xl transition cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* LOW STOCK ALERT BANNER */}
        {lowStockParts.length > 0 && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/50 rounded-2xl flex items-start gap-3 shadow-lg">
            <span className="text-2xl">🚨</span>
            <div className="space-y-1.5">
              <h3 className="font-bold text-amber-400 text-sm sm:text-base">
                Low Stock Warning
              </h3>
              <p className="text-xs text-slate-300">
                {lowStockParts.length} product(s) have reached or fallen below 10 units in stock:
              </p>

              {/* Product Badges with remaining quantity */}
              <div className="flex flex-wrap gap-2 pt-1">
                {lowStockParts.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-amber-500/40 rounded-lg text-xs font-semibold text-white"
                  >
                    <span>{item.name}</span>
                    <span className="text-red-400 font-bold">
                      ({item.quantityInStock} left)
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Controls & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/80 p-4 rounded-2xl border border-slate-800 gap-4">
          <div className="flex bg-slate-800 p-1.5 rounded-xl border border-slate-700/60 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("cars")}
              className={`flex-1 sm:flex-initial px-6 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
                activeTab === "cars" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Vehicles Inventory
            </button>
            <button
              onClick={() => setActiveTab("parts")}
              className={`flex-1 sm:flex-initial px-6 py-2 text-sm font-semibold rounded-lg transition cursor-pointer ${
                activeTab === "parts" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Spare Parts Inventory
            </button>
          </div>

          <input
            type="text"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 bg-slate-800/90 text-white border border-slate-700 rounded-xl outline-none focus:border-orange-500 text-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading inventory data...</div>
        ) : (
          <div>
            {/* CARS TAB */}
            {activeTab === "cars" && (
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                      <th className="p-4">Vehicle</th>
                      <th className="p-4">Year</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {currentCars.map((car) => (
                      <tr key={car.id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-semibold text-white">{car.make} {car.model}</td>
                        <td className="p-4 text-slate-400">{car.year}</td>
                        <td className="p-4 text-orange-400 font-bold">${Number(car.price).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${car.isSold ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                            {car.isSold ? "Sold" : "Available"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            disabled={car.isSold}
                            onClick={() => initiateCarSale(car)}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${!car.isSold ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}
                          >
                            {!car.isSold ? "Sell Vehicle" : "Sold Out"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Cars Pagination */}
                {totalCarsPages > 1 && (
                  <div className="flex justify-between items-center p-4 w-full border-t border-slate-800 text-sm text-slate-400">
                    <span>
                      Page <strong className="text-white">{carsPage}</strong> of <strong className="text-white">{totalCarsPages}</strong>
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={carsPage === 1}
                        onClick={() => setCarsPage((p) => Math.max(p - 1, 1))}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        Previous
                      </button>
                      <button
                        disabled={carsPage === totalCarsPages}
                        onClick={() => setCarsPage((p) => Math.min(p + 1, totalCarsPages))}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SPARE PARTS TAB */}
            {activeTab === "parts" && (
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                      <th className="p-4">Item Name</th>
                      <th className="p-4">Part #</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4 text-center">Select Qty</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {currentParts.map((item) => {
                      const rawQty = selectedPartQuantities[item.id];
                      const qty = rawQty ?? 1;
                      const displayQty = typeof qty === "number" ? qty : parseInt(qty, 10) || 1;

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40">
                          <td className="p-4 font-semibold text-white">{item.name}</td>
                          <td className="p-4 text-slate-400">{item.partNumber}</td>
                          <td className="p-4 text-orange-400 font-bold">${item.price.toLocaleString()}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span>{item.quantityInStock}</span>
                              {item.quantityInStock <= 10 && item.quantityInStock > 0 && (
                                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                                  Low Stock
                                </span>
                              )}
                            </div>
                          </td>

                          {/* QUANTITY COUNTER COLUMN */}
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                disabled={item.quantityInStock <= 0 || displayQty <= 1}
                                onClick={() => handlePartQtyChange(item.id, -1, item.quantityInStock, false)}
                                className="w-8 h-8 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30 rounded-lg text-white font-bold border border-slate-700 transition cursor-pointer flex items-center justify-center"
                              >
                                -
                              </button>

                              <input
                                type="text"
                                inputMode="numeric"
                                disabled={item.quantityInStock <= 0}
                                value={qty}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) =>
                                  handlePartQtyChange(item.id, e.target.value, item.quantityInStock, true)
                                }
                                onBlur={() => handlePartQtyBlur(item.id, item.quantityInStock)}
                                className="w-14 h-8 bg-slate-900 border border-slate-700 text-orange-400 font-bold text-center rounded-lg text-sm outline-none focus:border-orange-500 transition"
                              />

                              <button
                                type="button"
                                disabled={item.quantityInStock <= 0 || displayQty >= item.quantityInStock}
                                onClick={() => handlePartQtyChange(item.id, 1, item.quantityInStock, false)}
                                className="w-8 h-8 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30 rounded-lg text-white font-bold border border-slate-700 transition cursor-pointer flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            <button
                              disabled={item.quantityInStock <= 0}
                              onClick={() => initiatePartSale(item)}
                              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                                item.quantityInStock > 0
                                  ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                              }`}
                            >
                              {item.quantityInStock > 0 ? `Sell (${displayQty})` : "Out of Stock"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Spare Parts Pagination */}
                {totalPartsPages > 1 && (
                  <div className="flex justify-between items-center p-4 bg-slate-800/30 border-t border-slate-800 text-sm text-slate-400">
                    <span>
                      Page <strong className="text-white">{partsPage}</strong> of <strong className="text-white">{totalPartsPages}</strong>
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={partsPage === 1}
                        onClick={() => setPartsPage((p) => Math.max(p - 1, 1))}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        Previous
                      </button>
                      <button
                        disabled={partsPage === totalPartsPages}
                        onClick={() => setPartsPage((p) => Math.min(p + 1, totalPartsPages))}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CUSTOMER DETAILS POPUP MODAL */}
      {pendingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Customer Sale Details</h2>
              <button
                onClick={() => setPendingSale(null)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <p className="text-sm text-slate-400">
                Item: <strong className="text-white">{pendingSale.itemName}</strong>
              </p>
              <p className="text-sm text-slate-400">
                Quantity: <strong className="text-orange-400">{pendingSale.qtyToSell}</strong>
              </p>
              <p className="text-sm text-slate-400">
                Total Price:{" "}
                <strong className="text-emerald-400">
                  ${(pendingSale.itemPrice * pendingSale.qtyToSell).toLocaleString()}
                </strong>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmSale} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                  Customer Phone Number
                </label>
                <input
                  type="number"
                  required
                  placeholder="Enter phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-orange-500 transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingSale(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSale}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition cursor-pointer"
                >
                  {submittingSale ? "Processing..." : "Confirm Sale"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default POSPage;