import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesRecords();
  }, []);

  const fetchSalesRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get('http://localhost:5038/api/salesrecords', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales records:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading sales history...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-800 text-slate-300 border-b border-slate-700">
                <th className="p-4">ID</th>
                <th className="p-4">Item Type</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Sale Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {sales.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono text-slate-400">{item.id}</td>
                  <td className="p-4 text-amber-400 font-medium">{item.itemType}</td>
                  <td className="p-4 font-semibold text-white">{item.productName}</td>
                  <td className="p-4">{item.quantity}</td>
                  <td className="p-4 text-emerald-400 font-semibold">${item.totalAmount}</td>
                  <td className="p-4">{item.customerName}</td>
                  <td className="p-4 text-slate-400">{item.customerPhone}</td>
                  <td className="p-4 text-slate-400">
                    {new Date(item.saleDate).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;