import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function AdminKpiPage({ authFetch }) {
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  // Comparison Selection State
  const [agent1Name, setAgent1Name] = useState("");
  const [agent2Name, setAgent2Name] = useState("");

  // Helper function to calculate percentages safely (SIRF EK BAAR DEFINITION)
  const calculateRates = (kpi) => {
    if (!kpi) return { onTime: 0, late: 0, totalResolved: 0, totalHandled: 0, onTimeRate: 0, overallRate: 0 };
    
    const onTime = kpi.resolvedWithinTime || 0;
    const late = kpi.resolvedAfterTime || 0;
    const totalResolved = onTime + late;

    const active = kpi.activeTickets || 0;
    const pending = kpi.pendingTickets || 0;
    const closed = kpi.closedTickets || 0;
    const totalHandled = active + pending + closed + totalResolved;

    const onTimeRate = totalResolved > 0 ? Math.round((onTime / totalResolved) * 100) : 0;
    const overallRate = totalHandled > 0 ? Math.round((totalResolved / totalHandled) * 100) : 0;

    return { onTime, late, totalResolved, totalHandled, onTimeRate, overallRate };
  };

  useEffect(() => {
    fetchKpis();
  }, []);

  const fetchKpis = async () => {
    try {
      const res = await authFetch('/Tickets/user-kpis');
      if (res.ok) {
        const data = await res.json();
        setKpiData(data);
      }
    } catch (err) {
      console.error('Error fetching KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Find dynamic agents & calculate their metrics
  const agent1Obj = kpiData.find((user) => user.username === agent1Name);
  const agent2Obj = kpiData.find((user) => user.username === agent2Name);

  const agent1Metrics = agent1Obj ? { ...agent1Obj, ...calculateRates(agent1Obj) } : null;
  const agent2Metrics = agent2Obj ? { ...agent2Obj, ...calculateRates(agent2Obj) } : null;

  // Configuration schema for comparison table
  const comparisonRows = [
    { label: "Active Tickets", key: "activeTickets" },
    { label: "Pending Tickets", key: "pendingTickets" },
    { label: "Closed Tickets", key: "closedTickets" },
    { label: "Resolved On-Time", key: "onTime", higherIsBetter: true },
    { label: "Resolved Late", key: "late", higherIsBetter: false },
    { label: "Total Overdue", key: "totalOverdue", higherIsBetter: false },
    { label: "On-Time Rate (%)", key: "onTimeRate", isPercentage: true, higherIsBetter: true },
    { label: "Overall Resolution Rate (%)", key: "overallRate", isPercentage: true, higherIsBetter: true },
  ];

  // Overall Aggregations
  const overall = kpiData.reduce(
    (acc, user) => ({
      active: acc.active + (user.activeTickets || 0),
      pending: acc.pending + (user.pendingTickets || 0),
      closed: acc.closed + (user.closedTickets || 0),
      withinTime: acc.withinTime + (user.resolvedWithinTime || 0),
      afterTime: acc.afterTime + (user.resolvedAfterTime || 0),
      overdue: acc.overdue + (user.totalOverdue || 0),
    }),
    { active: 0, pending: 0, closed: 0, withinTime: 0, afterTime: 0, overdue: 0 }
  );

  // User-Specific Chart Data Generator for Modal
  const getUserPieData = (user) => {
    if (!user) return [];
    return [
      { name: 'Active', value: user.activeTickets || 0, color: '#facc15' },
      { name: 'Pending', value: user.pendingTickets || 0, color: '#60a5fa' },
      { name: 'Closed', value: user.closedTickets || 0, color: '#c084fc' },
      { name: 'On-Time', value: user.resolvedWithinTime || 0, color: '#4ade80' },
      { name: 'Late', value: user.resolvedAfterTime || 0, color: '#fb923c' },
      { name: 'Overdue', value: user.totalOverdue || 0, color: '#ef4444' },
    ].filter((item) => item.value > 0);
  };

  const getUserBarData = (user) => {
    if (!user) return [];
    return [
      {
        name: user.username,
        'On-Time': user.resolvedWithinTime || 0,
        'Late': user.resolvedAfterTime || 0,
        'Overdue': user.totalOverdue || 0,
      },
    ];
  };

  if (loading) return <div className="p-6 text-white">Loading KPI Dashboard...</div>;

  return (
    <div className="p-6 text-white max-w-7xl mx-auto space-y-6 relative">
      <h1 className="text-2xl font-bold">Admin KPI & Performance Dashboard</h1>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-xs text-gray-400">Active (In Progress)</p>
          <p className="text-2xl font-bold text-yellow-400">{overall.active}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-xs text-gray-400">Pending (Waiting)</p>
          <p className="text-2xl font-bold text-blue-400">{overall.pending}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-xs text-gray-400">Closed Tickets</p>
          <p className="text-2xl font-bold text-purple-400">{overall.closed}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-xs text-gray-400">Resolved On-Time</p>
          <p className="text-2xl font-bold text-green-400">{overall.withinTime}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-xs text-gray-400">Resolved Late</p>
          <p className="text-2xl font-bold text-orange-400">{overall.afterTime}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-xs text-gray-400">Total Overdue</p>
          <p className="text-2xl font-bold text-red-500">{overall.overdue}</p>
        </div>
      </div>

      {/* User / Agent Small Div Cards Grid */}
     
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Agent Performance Cards</h2>

        {kpiData.length === 0 ? (
          <p className="text-gray-400">No user performance data found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {kpiData.map((user) => {
              const { onTimeRate } = calculateRates(user);
              return (
                <div
                  key={user.username}
                  onClick={() => setSelectedUser(user)}
                  className="bg-slate-800 border border-slate-700 hover:border-purple-500 rounded-xl p-5 text-white shadow-md hover:shadow-2xl cursor-pointer transition transform hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl">👤</span>
                    <span className="text-xs bg-emerald-950/80 text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-500/30">
                      {onTimeRate}% On-Time
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white truncate">{user.username}</h3>

                  <p className="text-xs text-purple-400 mt-4 flex items-center justify-between font-medium">
                    <span>View KPI Popup</span>
                    <span>→</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
<div className='sm:mb-2 mb-10'>
    <div className='sm:flex'>
    <h2>⚖️ Agent Comparsion</h2>
    <div >
            {/* <label className="block text-xs text-gray-400 mb-1 font-medium">Select Agent 1</label> */}
            <select
              value={agent1Name}
              onChange={(e) => setAgent1Name(e.target.value)}
              className="sm:w-[400px] w-full mt-2 sm:mt-15 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-purple-500"
            >
              <option value="">-- Choose First Agent --</option>
              {kpiData.map((u) => (
                <option key={u.username} value={u.username} disabled={u.username === agent2Name}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>
          <div>
            {/* <label className="block text-xs text-gray-400 mb-1 font-medium">Select Agent 2</label> */}
            <select
              value={agent2Name}
              onChange={(e) => setAgent2Name(e.target.value)}
              className="sm:w-[400px] w-full sm:ml-2 mt-2 mb-2 sm:mt-15 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-purple-500"
            >
              <option value="">-- Choose Second Agent --</option>
              {kpiData.map((u) => (
                <option key={u.username} value={u.username} disabled={u.username === agent1Name}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>
          </div>

{!agent1Metrics || !agent2Metrics ? (
          <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-8 text-center text-gray-400 text-sm">
            Please select two agents above to view side-by-side metric comparison.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-700 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/80">
                  <th className="p-3.5 text-gray-400 text-xs font-semibold uppercase tracking-wider">Metric</th>
                  <th className="p-3.5 text-purple-300 font-bold text-sm bg-purple-950/20">{agent1Name}</th>
                  <th className="p-3.5 text-purple-300 font-bold text-sm bg-purple-950/20">{agent2Name}</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => {
                  const val1 = agent1Metrics[row.key] || 0;
                  const val2 = agent2Metrics[row.key] || 0;

                  let isVal1Better = false;
                  let isVal2Better = false;

                  if (val1 !== val2 && row.higherIsBetter !== undefined) {
                    if (row.higherIsBetter) {
                      isVal1Better = val1 > val2;
                      isVal2Better = val2 > val1;
                    } else {
                      isVal1Better = val1 < val2;
                      isVal2Better = val2 < val1;
                    }
                  }

                  return (
                    <tr key={row.key} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                      <td className="p-3 text-gray-300 font-medium text-sm">{row.label}</td>
                      <td className={`p-3 font-bold text-sm ${
                        isVal1Better ? "text-emerald-400 bg-emerald-950/30 border-l-2 border-emerald-500" : "text-white"
                      }`}>
                        {val1}{row.isPercentage ? "%" : ""}
                      </td>
                      <td className={`p-3 font-bold text-sm ${
                        isVal2Better ? "text-emerald-400 bg-emerald-950/30 border-l-2 border-emerald-500" : "text-white"
                      }`}>
                        {val2}{row.isPercentage ? "%" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}


</div>
    {/* Big KPI Performance Pop-up Modal */}
{selectedUser && (() => {
  const { onTime, late, totalResolved, totalHandled, onTimeRate, overallRate } = calculateRates(selectedUser);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-4 sm:p-6 w-full max-w-5xl text-white shadow-2xl relative space-y-4 sm:space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedUser(null)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition shadow-md z-10"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="pr-8">
          <h2 className="text-lg sm:text-2xl font-bold text-purple-400 flex items-center gap-2 truncate">
            👤 Performance Stats: {selectedUser.username}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Detailed ticket metrics, success percentages, and status breakdown
          </p>
        </div>

        {/* Top Percentage Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 sm:p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                On-Time Rate
              </p>
              <p className="text-[11px] sm:text-xs text-emerald-300/70 mt-0.5">
                ({onTime} of {totalResolved} resolved on time)
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{onTimeRate}%</p>
          </div>

          <div className="bg-purple-950/40 border border-purple-500/40 p-3 sm:p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-purple-400 font-semibold uppercase tracking-wider">
                Resolution Rate
              </p>
              <p className="text-[11px] sm:text-xs text-purple-300/70 mt-0.5">
                ({totalResolved} of {totalHandled} total handled)
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-300">{overallRate}%</p>
          </div>
        </div>

        {/* MODAL BODY: LEFT STATS & RIGHT CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Left Column: Numeric KPI Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2.5 sm:gap-3">
            <div className="bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-700 flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <span className="text-[11px] sm:text-xs text-gray-400">Active Tickets</span>
              <span className="text-base sm:text-xl font-bold text-yellow-400">{selectedUser.activeTickets || 0}</span>
            </div>
            <div className="bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-700 flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <span className="text-[11px] sm:text-xs text-gray-400">Pending Tickets</span>
              <span className="text-base sm:text-xl font-bold text-blue-400">{selectedUser.pendingTickets || 0}</span>
            </div>
            <div className="bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-700 flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <span className="text-[11px] sm:text-xs text-gray-400">Closed Tickets</span>
              <span className="text-base sm:text-xl font-bold text-purple-400">{selectedUser.closedTickets || 0}</span>
            </div>
            <div className="bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-700 flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <span className="text-[11px] sm:text-xs text-gray-400">Resolved On-Time</span>
              <span className="text-base sm:text-xl font-bold text-green-400">{selectedUser.resolvedWithinTime || 0}</span>
            </div>
            <div className="bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-700 flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <span className="text-[11px] sm:text-xs text-gray-400">Resolved Late</span>
              <span className="text-base sm:text-xl font-bold text-orange-400">{selectedUser.resolvedAfterTime || 0}</span>
            </div>
            <div className="bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-700 flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <span className="text-[11px] sm:text-xs text-gray-400">Total Overdue</span>
              <span className="text-base sm:text-xl font-bold text-red-500">{selectedUser.totalOverdue || 0}</span>
            </div>
          </div>

          {/* Right Column: User Charts Section */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* BAR CHART */}
            <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
              <h3 className="text-xs sm:text-sm font-semibold text-purple-300 mb-2 text-center">Resolution Breakdown</h3>
              <div className="h-48 sm:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getUserBarData(selectedUser)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="On-Time" fill="#4ade80" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Late" fill="#fb923c" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PIE CHART */}
            <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
              <h3 className="text-xs sm:text-sm font-semibold text-purple-300 mb-2 text-center">Status Distribution</h3>
              <div className="h-48 sm:h-64 w-full">
                {getUserPieData(selectedUser).length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                    No active/resolved tickets to display.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getUserPieData(selectedUser)}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {getUserPieData(selectedUser).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
})()}   </div>
  );
}