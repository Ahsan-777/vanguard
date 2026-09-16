// import { useEffect, useState } from "react";
// import { authFetch } from "./api";
// import logo from "./assets/logo.jpeg";
// import TicketTimer from "./TicketTimer"; // Timer Component Imported
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
// } from "recharts";
// function AgentMainPage() {
//   const [tickets, setTickets] = useState([]);
//   const [messages, setMessages] = useState({});
//   const [newMessage, setNewMessage] = useState({});
//   const [viewMode, setViewMode] = useState("cards");

//   // Filter & Search State
//   const [searchText, setSearchText] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [sortOrder, setSortOrder] = useState("newest");
//   const [conversationTicket, setConversationTicket] = useState(null);

//   // Navigation State
//   const [activePage, setActivePage] = useState("welcome");

//   // Pagination State
//   const [currentPage, setCurrentPage] = useState(1);
//   const ticketsPerPage = 6;
// // Personal Agent KPI State
//   const [agentKpi, setAgentKpi] = useState(null);
//   const [kpiLoading, setKpiLoading] = useState(true);
  
//   const [stats, setStats] = useState({
//     totalAssigned: 0,
//     resolved: 0,
//     pending: 0,
//   });

//   const username = localStorage.getItem("username");

//   useEffect(() => {
//     getTickets();
//   fetchAgentKpi();
//   }, []);

//   const fetchAgentKpi = async () => {
//     try {
//       setKpiLoading(true);
//       const response = await authFetch("/Tickets/user-kpis");

//       if (response.ok) {
//         const data = await response.json();
//         // Logged-in user ki specific KPI find karen
//         const currentUserKpi = data.find(
//           (u) => u.username?.toLowerCase() === username?.toLowerCase()
//         );
//         setAgentKpi(currentUserKpi || null);
//       }
//     } catch (error) {
//       console.error("Error fetching agent KPI:", error);
//     } finally {
//       setKpiLoading(false);
//     }
//   };

//   // Dynamic Chart Data Formatter for Logged-In Agent
//   const getAgentBarData = () => {
//     if (!agentKpi) return [];
//     return [
//       {
//         name: agentKpi.username || username,
//         "On-Time": agentKpi.resolvedWithinTime || 0,
//         Late: agentKpi.resolvedAfterTime || 0,
//         Overdue: agentKpi.totalOverdue || 0,
//       },
//     ];
//   };

//   const getAgentPieData = () => {
//     if (!agentKpi) return [];
//     return [
//       { name: "Active", value: agentKpi.activeTickets || 0, color: "#facc15" },
//       { name: "Pending", value: agentKpi.pendingTickets || 0, color: "#60a5fa" },
//       { name: "Closed", value: agentKpi.closedTickets || 0, color: "#c084fc" },
//       { name: "On-Time", value: agentKpi.resolvedWithinTime || 0, color: "#4ade80" },
//       { name: "Late", value: agentKpi.resolvedAfterTime || 0, color: "#fb923c" },
//       { name: "Overdue", value: agentKpi.totalOverdue || 0, color: "#ef4444" },
//     ].filter((item) => item.value > 0);
//   };
//   // =========================
//   // GET TICKETS
//   // =========================
//   const getTickets = async () => {
//     try {
//       const response = await authFetch("/Tickets");

//       if (!response.ok) {
//         console.error("Failed to fetch tickets:", response.status);
//         return;
//       }

//       const data = await response.json();
//       setTickets(data);
//     } catch (error) {
//       console.error("Fetch tickets error:", error);
//     }
//   };

//   // =========================
//   // GET MESSAGES
//   // =========================
//   const getMessages = async (ticketId) => {
//     try {
//       const response = await authFetch(`/Tickets/${ticketId}/messages`);

//       if (!response.ok) {
//         console.error("Failed to get messages");
//         return;
//       }

//       const data = await response.json();

//       setMessages((previous) => ({
//         ...previous,
//         [ticketId]: data,
//       }));
//     } catch (error) {
//       console.error("Get messages error:", error);
//     }
//   };

//   // =========================
//   // SEND QUESTION / REPLY
//   // =========================
//   const sendQuestion = async (ticketId) => {
//     const message = newMessage[ticketId];

//     if (!message || !message.trim()) {
//       alert("Please enter a question/reply");
//       return;
//     }

//     try {
//       const response = await authFetch(`/Tickets/${ticketId}/messages`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           ticketId: ticketId,
//           senderUsername: username,
//           senderRole: "Agent",
//           message: message,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         alert(errorData.message || "Failed to send message");
//         return;
//       }

//       setNewMessage((previous) => ({
//         ...previous,
//         [ticketId]: "",
//       }));

//       getMessages(ticketId);
//     } catch (error) {
//       console.error("Send message error:", error);
//     }
//   };

//   // =========================
//   // CLAIM TICKET
//   // =========================
//   const claimTicket = async (ticketId) => {
//     try {
//       const response = await authFetch(`/Tickets/${ticketId}/claim`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           agentUsername: username,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         alert(data.message || "Failed to claim ticket");
//         return;
//       }

//       alert("Ticket claimed successfully!");

//       getTickets();
//       getAgentStats();
//     } catch (error) {
//       console.error("Claim ticket error:", error);
//     }
//   };

//   // =========================
//   // ACKNOWLEDGE TICKET ("NOTED")
//   // =========================
//   const acknowledgeTicket = async (ticketId) => {
//     try {
//       const response = await authFetch(`/Tickets/${ticketId}/acknowledge`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           agentUsername: username,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         alert(data.message || "Failed to acknowledge ticket");
//         return;
//       }

//       alert("Ticket is now In Progress!");

//       getTickets();
//       getAgentStats();
//     } catch (error) {
//       console.error("Acknowledge ticket error:", error);
//       alert("Could not connect to backend");
//     }
//   };

//   // =========================
//   // RESOLVE TICKET
//   // =========================
//   const resolveTicket = async (ticketId) => {
//     try {
//       const response = await authFetch(`/Tickets/${ticketId}/resolve`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           agentUsername: username,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         alert(data.message || "Failed to resolve ticket");
//         return;
//       }

//       alert("Ticket resolved successfully!");

//       getTickets();
//       getAgentStats();
//     } catch (error) {
//       console.error("Resolve ticket error:", error);
//       alert("Could not connect to backend");
//     }
//   };

//   // =========================
//   // LOGOUT
//   // =========================
//   const handleLogout = () => {
//     localStorage.clear();
//     window.location.href = "/";
//   };

//   // =========================
//   // SEARCH, FILTER & PAGINATION LOGIC
//   // =========================
//   const filteredTickets = tickets
//     .filter((ticket) => {
//       const search = searchText.toLowerCase();
//       const matchesSearch =
//         (ticket.ticketNumber || "").toLowerCase().includes(search) ||
//         (ticket.title || "").toLowerCase().includes(search);

//       const matchesStatus =
//         statusFilter === "all" ||
//         (ticket.status || "").toLowerCase() === statusFilter.toLowerCase();

//       return matchesSearch && matchesStatus;
//     })
//     .sort((a, b) => {
//       const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
//       const dateB = new Date(b.createdAt || b.created_at || 0).getTime();

//       if (sortOrder === "newest") {
//         return dateB - dateA;
//       }
//       if (sortOrder === "oldest") {
//         return dateA - dateB;
//       }

//       return 0;
//     });

//   const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
//   const startIndex = (currentPage - 1) * ticketsPerPage;
//   const currentTickets = filteredTickets.slice(
//     startIndex,
//     startIndex + ticketsPerPage
//   );

//   const openConversationPopup = async (ticket) => {
//     setConversationTicket(ticket);

//     try {
//       const response = await authFetch(`/Tickets/${ticket.id}/messages`);

//       if (!response.ok) {
//         alert("Failed to load conversation");
//         return;
//       }

//       const data = await response.json();

//       setMessages((previous) => ({
//         ...previous,
//         [ticket.id]: data,
//       }));
//     } catch (error) {
//       console.error("Get conversation error:", error);
//     }
//   };

//   // =========================
//   // DATE FORMATTER
//   // =========================
//   const formatDate = (dateValue) => {
//     if (!dateValue) return "N/A";
//     const date = new Date(dateValue);
//     if (isNaN(date.getTime())) return "N/A";
//     return date.toLocaleString();
//   };

//   return (
//     <div
//       className="min-h-screen bg-cover bg-center bg-fixed relative"
//       style={{ backgroundImage: `url(${logo})` }}
//     >
//       <div className="absolute inset-0 bg-black/40"></div>

//       {/* ================= MAIN LAYOUT ================= */}
//       <div className="relative z-10 flex min-h-screen">
//         {/* ================= SIDEBAR ================= */}
//         <nav className="w-64 min-h-screen backdrop-blur-xl bg-black/40 border-r border-white/20 text-white p-6 flex flex-col justify-between shadow-2xl">
//           <div>
//             <div className="mb-10">
//               <h1 className="text-2xl font-bold">Mini Help Desk</h1>
//               <p className="text-gray-400 text-sm mt-1">Agent Panel</p>
//             </div>

//             <div className="flex flex-col gap-3">
//               <button
//                 onClick={() => setActivePage("welcome")}
//                 className={`text-left px-4 py-3 rounded-lg font-medium transition ${
//                   activePage === "welcome"
//                     ? "bg-purple-800 shadow-lg"
//                     : "hover:bg-purple-900"
//                 }`}
//               >
//                 🏠 Overview
//               </button>

//               <button
//                 onClick={() => setActivePage("tickets")}
//                 className={`text-left px-4 py-3 rounded-lg font-medium transition ${
//                   activePage === "tickets"
//                     ? "bg-purple-800 shadow-lg"
//                     : "hover:bg-purple-900"
//                 }`}
//               >
//                 🎫 Tickets
//               </button>

//               <button
//                 onClick={() => setActivePage("profile")}
//                 className={`text-left px-4 py-3 rounded-lg font-medium transition ${
//                   activePage === "profile"
//                     ? "bg-purple-800 shadow-lg"
//                     : "hover:bg-purple-900"
//                 }`}
//               >
//                 👤 Profile
//               </button>
//             </div>
//           </div>

//           <button
//             onClick={handleLogout}
//             className="w-full bg-purple-800 hover:bg-red-600 px-4 py-3 rounded-lg font-medium transition text-center"
//           >
//             Logout
//           </button>
//         </nav>

//         {/* ================= CONTENT ================= */}
//         <main className="flex-1 p-8 overflow-y-auto">
//           {/* WELCOME / OVERVIEW PAGE WITH PERSONAL AGENT CHARTS */}
//           {activePage === "welcome" && (
//             <div className="max-w-6xl mx-auto space-y-6">
//               <div className="backdrop-blur-lg bg-black/40 border border-white/10 rounded-2xl shadow-xl p-8 text-white space-y-6">
//                 <div>
//                   <h1 className="text-3xl font-bold text-purple-300">
//                     Welcome back, {username}! 👋
//                   </h1>
//                   <p className="text-gray-300 text-sm mt-1">
//                     Here is your personal ticket performance and analytics matrix.
//                   </p>
//                 </div>

//                 {kpiLoading ? (
//                   <p className="text-gray-400">Loading your performance metrics...</p>
//                 ) : !agentKpi ? (
//                   <p className="text-gray-400">No performance records found for your account.</p>
//                 ) : (
//                   <>
//                     {/* Top KPI Metric Badges */}
//                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
//                       <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
//                         <p className="text-xs text-gray-400">Active</p>
//                         <p className="text-2xl font-bold text-yellow-400">
//                           {agentKpi.activeTickets || 0}
//                         </p>
//                       </div>
//                       <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
//                         <p className="text-xs text-gray-400">Pending</p>
//                         <p className="text-2xl font-bold text-blue-400">
//                           {agentKpi.pendingTickets || 0}
//                         </p>
//                       </div>
//                       <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
//                         <p className="text-xs text-gray-400">Closed</p>
//                         <p className="text-2xl font-bold text-purple-400">
//                           {agentKpi.closedTickets || 0}
//                         </p>
//                       </div>
//                       <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
//                         <p className="text-xs text-gray-400">On-Time</p>
//                         <p className="text-2xl font-bold text-green-400">
//                           {agentKpi.resolvedWithinTime || 0}
//                         </p>
//                       </div>
//                       <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
//                         <p className="text-xs text-gray-400">Late</p>
//                         <p className="text-2xl font-bold text-orange-400">
//                           {agentKpi.resolvedAfterTime || 0}
//                         </p>
//                       </div>
//                       <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
//                         <p className="text-xs text-gray-400">Overdue</p>
//                         <p className="text-2xl font-bold text-red-500">
//                           {agentKpi.totalOverdue || 0}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Agent Visual Analytics Section */}
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
//                       {/* BAR CHART */}
//                       <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-xl">
//                         <h2 className="text-md font-bold mb-4 text-purple-400">
//                           Resolution Performance
//                         </h2>
//                         <div className="h-64 w-full">
//                           <ResponsiveContainer width="100%" height="100%">
//                             <BarChart data={getAgentBarData()}>
//                               <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
//                               <XAxis dataKey="name" stroke="#94a3b8" />
//                               <YAxis stroke="#94a3b8" />
//                               <Tooltip
//                                 contentStyle={{
//                                   backgroundColor: "#0f172a",
//                                   borderColor: "#475569",
//                                   borderRadius: "8px",
//                                 }}
//                                 itemStyle={{ color: "#fff" }}
//                               />
//                               <Legend wrapperStyle={{ fontSize: "12px" }} />
//                               <Bar dataKey="On-Time" fill="#4ade80" radius={[4, 4, 0, 0]} />
//                               <Bar dataKey="Late" fill="#fb923c" radius={[4, 4, 0, 0]} />
//                               <Bar dataKey="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
//                             </BarChart>
//                           </ResponsiveContainer>
//                         </div>
//                       </div>

//                       {/* PIE CHART */}
//                       <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-xl">
//                         <h2 className="text-md font-bold mb-4 text-purple-400">
//                           Status Distribution
//                         </h2>
//                         <div className="h-64 w-full">
//                           {pieData.length === 0 ? (
//                             <div className="h-full flex items-center justify-center text-gray-400 text-xs">
//                               No ticket activity records to display.
//                             </div>
//                           ) : (
//                             <ResponsiveContainer width="100%" height="100%">
//                               <PieChart>
//                                 <Pie
//                                   data={pieData}
//                                   cx="50%"
//                                   cy="50%"
//                                   innerRadius={50}
//                                   outerRadius={80}
//                                   paddingAngle={4}
//                                   dataKey="value"
//                                 >
//                                   {pieData.map((entry, index) => (
//                                     <Cell key={`cell-${index}`} fill={entry.color} />
//                                   ))}
//                                 </Pie>
//                                 <Tooltip
//                                   contentStyle={{
//                                     backgroundColor: "#0f172a",
//                                     borderColor: "#475569",
//                                     borderRadius: "8px",
//                                   }}
//                                 />
//                                 <Legend wrapperStyle={{ fontSize: "12px" }} />
//                               </PieChart>
//                             </ResponsiveContainer>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}
//           {/* PROFILE PAGE */}
//           {activePage === "profile" && (
//             <div className="max-w-4xl mx-auto">
//               <div className="backdrop-blur-lg bg-black/30 border border-white/10 rounded-2xl shadow-xl p-10 text-white">
//                 <h1 className="text-3xl font-bold mb-8">My Profile</h1>

//                 <div className="flex items-center gap-6 mb-8">
//                   <div className="w-20 h-20 rounded-full bg-purple-700 flex items-center justify-center text-3xl">
//                     👤
//                   </div>
//                   <div>
//                     <h2 className="text-2xl font-bold">{username}</h2>
//                     <p className="text-gray-400">Agent</p>
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   <div className="bg-white/10 rounded-lg p-4 border border-white/5">
//                     <p className="text-gray-400 text-sm">Username</p>
//                     <p className="text-lg font-semibold">{username}</p>
//                   </div>

//                   <div className="bg-white/10 rounded-lg p-4 border border-white/5">
//                     <p className="text-gray-400 text-sm">Role</p>
//                     <p className="text-lg font-semibold">Agent</p>
//                   </div>

//                   <div className="bg-white/10 rounded-lg p-4 border border-white/5">
//                     <p className="text-gray-400 text-sm">Assigned Tickets</p>
//                     <p className="text-lg font-semibold">
//                       {stats.totalAssigned}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* TICKETS PAGE */}
//           {activePage === "tickets" && (
//             <div className="max-w-7xl mx-auto">
//               <h1 className="text-3xl font-bold text-white mb-6">Tickets</h1>

//               {/* SEARCH & FILTERS BAR */}
//               <div className="flex flex-col md:flex-row gap-4 mb-8">
//                 <input
//                   type="text"
//                   placeholder="Search by Ticket Number or Title..."
//                   value={searchText}
//                   onChange={(e) => {
//                     setSearchText(e.target.value);
//                     setCurrentPage(1);
//                   }}
//                   className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-3 text-black bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
//                 />

//                 <select
//                   value={statusFilter}
//                   onChange={(e) => {
//                     setStatusFilter(e.target.value);
//                     setCurrentPage(1);
//                   }}
//                   className="px-4 py-3 rounded-lg text-black bg-white border border-gray-300 outline-none focus:border-purple-500"
//                 >
//                   <option value="all">All Statuses</option>
//                   <option value="waiting">Waiting</option>
//                   <option value="in progress">In Progress</option>
//                   <option value="closed">Closed / Resolved</option>
//                 </select>

//                 <select
//                   value={sortOrder}
//                   onChange={(e) => setSortOrder(e.target.value)}
//                   className="px-4 py-3 rounded-lg text-black bg-white border border-gray-300 outline-none focus:border-purple-500"
//                 >
//                   <option value="newest">Newest First</option>
//                   <option value="oldest">Oldest First</option>
//                 </select>

//                 <button
//                   onClick={() =>
//                     setViewMode((previous) =>
//                       previous === "cards" ? "table" : "cards"
//                     )
//                   }
//                   className="px-4 py-3 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-medium transition"
//                 >
//                   {viewMode === "cards" ? "📋 Table View" : "🎫 Card View"}
//                 </button>
//               </div>

//               {filteredTickets.length === 0 ? (
//                 <p className="text-gray-300">No tickets available.</p>
//               ) : (
//                 <>
//                   {viewMode === "cards" ? (
//                     // CARD VIEW
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//                       {currentTickets.map((ticket) => {
//                         const isAssignedToMe =
//                           ticket.assignedTo?.toLowerCase() ===
//                           username?.toLowerCase();

//                         const isClosed = ticket.status === "Closed";
//                         const conversationVisible =
//                           messages[ticket.id] !== undefined;

//                         return (
//                           <div
//                             key={ticket.id}
//                             className="backdrop-blur-lg bg-black/30 rounded-xl shadow-lg p-5 border border-white/10 hover:shadow-2xl transition"
//                           >
//                             <h3 className="text-lg font-bold text-white">
//                               [{ticket.ticketNumber || ticket.id}]
//                             </h3>

//                             <h4 className="text-md font-semibold text-gray-300 mt-2">
//                               {ticket.title}
//                             </h4>

//                             <p className="text-gray-400 text-sm mt-3">
//                               <b>Description:</b> {ticket.description}
//                             </p>

//                             <p className="text-sm text-gray-400 mt-3">
//                               <b>Created By:</b> {ticket.createdBy}
//                             </p>
//                             <p className="text-sm text-gray-400 mt-2">
//                               <b>Created At:</b>{" "}
//                               <span className="text-white">
//                                 {formatDate(ticket.createdAt || ticket.created_at)}
//                               </span>
//                             </p>

//                             {/* STATUS WITH LIVE TIMER */}
//                             <p className="text-sm text-gray-400 mt-2 flex items-center flex-wrap gap-1">
//                               <b>Status:</b>{" "}
//                               <span className="font-bold text-purple-400">
//                                 {ticket.status}
//                               </span>
//                               <TicketTimer 
//                                 inProgressAt={ticket.inProgressAt || ticket.InProgressAt || ticket.in_progress_at} 
//                                 status={ticket.status} 
//                                 isOverdue={ticket.isOverdue || ticket.IsOverdue || ticket.is_overdue} 
//                               />
//                             </p>

//                             <p className="text-sm text-gray-400 mt-2">
//                               <b>Assigned To:</b>{" "}
//                               {ticket.assignedTo || "Not claimed"}
//                             </p>

//                             {isClosed && ticket.resolvedBy && (
//                               <p className="text-sm text-gray-400 mt-2">
//                                 <b>Resolved By:</b>{" "}
//                                 <span className="font-bold text-green-400">
//                                   {ticket.resolvedBy}
//                                 </span>
//                               </p>
//                             )}

//                             {/* ACTION BUTTONS */}
//                             <div className="flex flex-wrap gap-2 mt-5">
//                               {!ticket.assignedTo && !isClosed && (
//                                 <button
//                                   type="button"
//                                   onClick={() => claimTicket(ticket.id)}
//                                   className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
//                                 >
//                                   Claim Ticket
//                                 </button>
//                               )}

//                               {isAssignedToMe && ticket.status === "Waiting" && (
//                                 <button
//                                   type="button"
//                                   onClick={() => acknowledgeTicket(ticket.id)}
//                                   className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
//                                 >
//                                   Noted
//                                 </button>
//                               )}

//                               {isAssignedToMe &&
//                                 ticket.status === "In Progress" && (
//                                   <button
//                                     type="button"
//                                     onClick={() => resolveTicket(ticket.id)}
//                                     className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
//                                   >
//                                     Resolved
//                                   </button>
//                                 )}

//                               <button
//                                 type="button"
//                                 onClick={() => {
//                                   if (conversationVisible) {
//                                     setMessages((previous) => {
//                                       const updated = { ...previous };
//                                       delete updated[ticket.id];
//                                       return updated;
//                                     });
//                                   } else {
//                                     getMessages(ticket.id);
//                                   }
//                                 }}
//                                 className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition"
//                               >
//                                 {conversationVisible
//                                   ? "Hide Conversation"
//                                   : "View Conversation"}
//                               </button>
//                             </div>

//                             {/* CONVERSATION (IN-CARD) */}
//                             {conversationVisible && (
//                               <div className="mt-5 pt-4 border-t border-white/10">
//                                 <h4 className="font-bold text-white mb-3">
//                                   Conversation
//                                 </h4>

//                                 <div className="space-y-3 bg-[#0b141a] p-3 rounded-xl max-h-60 overflow-y-auto">
//                                   {(messages[ticket.id] || []).length === 0 ? (
//                                     <p className="text-gray-400 text-xs text-center py-4">
//                                       No messages yet.
//                                     </p>
//                                   ) : (
//                                     (messages[ticket.id] || []).map((msg) => {
//                                       const isMe =
//                                         msg.senderUsername?.toLowerCase() ===
//                                         username?.toLowerCase();

//                                       return (
//                                         <div
//                                           key={msg.id || Math.random()}
//                                           className={`flex flex-col ${
//                                             isMe ? "items-start" : "items-end"
//                                           }`}
//                                         >
//                                           <div
//                                             className={`max-w-[80%] p-3 text-sm shadow-md transition-all ${
//                                               isMe
//                                                 ? "bg-[#005c4b] text-white rounded-2xl rounded-tl-none"
//                                                 : "bg-white text-gray-900 rounded-2xl rounded-tr-none"
//                                             }`}
//                                           >
//                                             <div
//                                               className={`flex items-center gap-2 mb-1 ${
//                                                 isMe ? "justify-start" : "justify-end"
//                                               }`}
//                                             >
//                                               <span
//                                                 className={`font-bold text-xs ${
//                                                   isMe ? "text-emerald-300" : "text-blue-600"
//                                                 }`}
//                                               >
//                                                 {msg.senderUsername}
//                                               </span>
//                                               <span className="text-[10px] bg-black/10 text-gray-600 px-1.5 py-0.5 rounded">
//                                                 {msg.senderRole}
//                                               </span>
//                                             </div>

//                                             <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
//                                               {msg.message}
//                                             </p>

//                                             <div
//                                               className={`flex items-center gap-1 mt-1 text-[10px] ${
//                                                 isMe ? "text-gray-200 justify-start" : "text-gray-500 justify-end"
//                                               }`}
//                                             >
//                                               <span>
//                                                 {msg.createdAt
//                                                   ? new Date(msg.createdAt).toLocaleTimeString([], {
//                                                       hour: "2-digit",
//                                                       minute: "2-digit",
//                                                     })
//                                                   : ""}
//                                               </span>
//                                               {isMe && (
//                                                 <span className="text-[#53bdeb] font-bold text-xs">
//                                                   ✓✓
//                                                 </span>
//                                               )}
//                                             </div>
//                                           </div>
//                                         </div>
//                                       );
//                                     })
//                                   )}
//                                 </div>

//                                 {isAssignedToMe && !isClosed && (
//                                   <div className="mt-4">
//                                     <textarea
//                                       placeholder="Ask the user a question..."
//                                       value={newMessage[ticket.id] || ""}
//                                       onChange={(e) =>
//                                         setNewMessage((previous) => ({
//                                           ...previous,
//                                           [ticket.id]: e.target.value,
//                                         }))
//                                       }
//                                       className="w-full h-20 p-3 rounded-lg text-black bg-white border border-gray-300 resize-none outline-none focus:ring-2 focus:ring-blue-500"
//                                     />

//                                     <button
//                                       onClick={() => sendQuestion(ticket.id)}
//                                       className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
//                                     >
//                                       Send Message
//                                     </button>
//                                   </div>
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   ) : (
//                     // TABLE VIEW
//                     <div className="overflow-x-auto rounded-xl border border-white/10 shadow-xl">
//                       <table className="w-full text-left text-white bg-black/30">
//                         <thead className="bg-purple-900/70">
//                           <tr>
//                             <th className="px-5 py-4">Ticket</th>
//                             <th className="px-5 py-4">Title</th>
//                             <th className="px-5 py-4">Created By</th>
//                             <th className="px-5 py-4">Created At</th>
//                             <th className="px-5 py-4">Status</th>
//                             <th className="px-5 py-4">Assigned To</th>
//                             <th className="px-5 py-4">Action</th>
//                           </tr>
//                         </thead>

//                         <tbody>
//                           {currentTickets.map((ticket) => {
//                             const isAssignedToMe =
//                               ticket.assignedTo?.toLowerCase() ===
//                               username?.toLowerCase();

//                             const isClosed = ticket.status === "Closed";

//                             return (
//                               <tr
//                                 key={ticket.id}
//                                 className="border-t border-white/10 hover:bg-white/5"
//                               >
//                                 <td className="px-5 py-4 font-semibold">
//                                   {ticket.ticketNumber || ticket.id}
//                                 </td>

//                                 <td className="px-5 py-4">{ticket.title}</td>

//                                 <td className="px-5 py-4 text-gray-300">
//                                   {ticket.createdBy}
//                                 </td>
//                                 <td className="px-5 py-4 text-gray-300">
//                                   {formatDate(ticket.createdAt || ticket.created_at)}
//                                 </td>

//                                 {/* STATUS CELL WITH TIMER */}
//                                 <td className="px-5 py-4">
//                                   <div className="flex items-center gap-1">
//                                     <span className="font-semibold text-purple-400">
//                                       {ticket.status}
//                                     </span>
//                                     <TicketTimer 
//                                       inProgressAt={ticket.inProgressAt || ticket.InProgressAt || ticket.in_progress_at} 
//                                       status={ticket.status} 
//                                       isOverdue={ticket.isOverdue || ticket.IsOverdue || ticket.is_overdue} 
//                                     />
//                                   </div>
//                                 </td>

//                                 <td className="px-5 py-4 text-gray-300">
//                                   {ticket.assignedTo || "Not claimed"}
//                                 </td>

//                                 <td className="px-5 py-4">
//                                   <div className="flex flex-wrap gap-2">
//                                     {!ticket.assignedTo && !isClosed && (
//                                       <button
//                                         onClick={() => claimTicket(ticket.id)}
//                                         className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
//                                       >
//                                         Claim
//                                       </button>
//                                     )}

//                                     {isAssignedToMe &&
//                                       ticket.status === "Waiting" && (
//                                         <button
//                                           onClick={() =>
//                                             acknowledgeTicket(ticket.id)
//                                           }
//                                           className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
//                                         >
//                                           Noted
//                                         </button>
//                                       )}

//                                     {isAssignedToMe &&
//                                       ticket.status === "In Progress" && (
//                                         <button
//                                           onClick={() =>
//                                             resolveTicket(ticket.id)
//                                           }
//                                           className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm"
//                                         >
//                                           Resolve
//                                         </button>
//                                       )}
//                                   </div>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

// export default AgentMainPage;
import { useEffect, useState } from "react";
import { authFetch } from "./api";
import logo from "./assets/logo.jpeg";
import TicketTimer from "./TicketTimer";
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
} from "recharts";

function AgentMainPage() {
  const [tickets, setTickets] = useState([]);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState({});
  const [viewMode, setViewMode] = useState("cards");

  // Filter & Search State
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [conversationTicket, setConversationTicket] = useState(null);

  // Navigation State
  const [activePage, setActivePage] = useState("welcome");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 6;

  // Personal Agent KPI State
  const [agentKpi, setAgentKpi] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  const username = localStorage.getItem("username");

  useEffect(() => {
    getTickets();
    fetchAgentKpi();
  }, []);

  // =========================
  // FETCH PERSONAL AGENT KPI
  // =========================
  const fetchAgentKpi = async () => {
    try {
      setKpiLoading(true);
      const response = await authFetch("/Tickets/user-kpis");

      if (response.ok) {
        const data = await response.json();
        // Find logged-in user KPI metrics
        const currentUserKpi = data.find(
          (u) => u.username?.toLowerCase() === username?.toLowerCase()
        );
        setAgentKpi(currentUserKpi || null);
      }
    } catch (error) {
      console.error("Error fetching agent KPI:", error);
    } finally {
      setKpiLoading(false);
    }
  };

  // Dynamic Chart Data Formatter for Logged-In Agent
  const getAgentBarData = () => {
    if (!agentKpi) return [];
    return [
      {
        name: agentKpi.username || username,
        "On-Time": agentKpi.resolvedWithinTime || 0,
        Late: agentKpi.resolvedAfterTime || 0,
        Overdue: agentKpi.totalOverdue || 0,
      },
    ];
  };

  const getAgentPieData = () => {
    if (!agentKpi) return [];
    return [
      { name: "Active", value: agentKpi.activeTickets || 0, color: "#facc15" },
      { name: "Pending", value: agentKpi.pendingTickets || 0, color: "#60a5fa" },
      { name: "Closed", value: agentKpi.closedTickets || 0, color: "#c084fc" },
      { name: "On-Time", value: agentKpi.resolvedWithinTime || 0, color: "#4ade80" },
      { name: "Late", value: agentKpi.resolvedAfterTime || 0, color: "#fb923c" },
      { name: "Overdue", value: agentKpi.totalOverdue || 0, color: "#ef4444" },
    ].filter((item) => item.value > 0);
  };
 // Calculate Total Resolved Tickets
const totalResolved = (agentKpi?.resolvedWithinTime || 0) + (agentKpi?.resolvedAfterTime || 0);

// Calculate Total Assigned / Handled Tickets
const totalHandled = (agentKpi?.activeTickets || 0) + 
                     (agentKpi?.pendingTickets || 0) + 
                     (agentKpi?.closedTickets || 0) + 
                     totalResolved;

// 1. On-Time Resolution Percentage (On-Time / Total Resolved)
const onTimeRate = totalResolved > 0 
  ? Math.round(((agentKpi?.resolvedWithinTime || 0) / totalResolved) * 100) 
  : 0;

// 2. Total Resolution Percentage (Closed & Resolved / Total Tickets Handled)
const overallResolutionRate = totalHandled > 0 
  ? Math.round((totalResolved / totalHandled) * 100) 
  : 0;
  // =========================
  // GET TICKETS
  // =========================
  const getTickets = async () => {
    try {
      const response = await authFetch("/Tickets");

      if (!response.ok) {
        console.error("Failed to fetch tickets:", response.status);
        return;
      }

      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error("Fetch tickets error:", error);
    }
  };

  // =========================
  // GET MESSAGES
  // =========================
  const getMessages = async (ticketId) => {
    try {
      const response = await authFetch(`/Tickets/${ticketId}/messages`);

      if (!response.ok) {
        console.error("Failed to get messages");
        return;
      }

      const data = await response.json();

      setMessages((previous) => ({
        ...previous,
        [ticketId]: data,
      }));
    } catch (error) {
      console.error("Get messages error:", error);
    }
  };

  // =========================
  // SEND QUESTION / REPLY
  // =========================
  const sendQuestion = async (ticketId) => {
    const message = newMessage[ticketId];

    if (!message || !message.trim()) {
      alert("Please enter a question/reply");
      return;
    }

    try {
      const response = await authFetch(`/Tickets/${ticketId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: ticketId,
          senderUsername: username,
          senderRole: "Agent",
          message: message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || "Failed to send message");
        return;
      }

      setNewMessage((previous) => ({
        ...previous,
        [ticketId]: "",
      }));

      getMessages(ticketId);
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  // =========================
  // CLAIM TICKET
  // =========================
  const claimTicket = async (ticketId) => {
    try {
      const response = await authFetch(`/Tickets/${ticketId}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentUsername: username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to claim ticket");
        return;
      }

      alert("Ticket claimed successfully!");

      getTickets();
      fetchAgentKpi();
    } catch (error) {
      console.error("Claim ticket error:", error);
    }
  };

  // =========================
  // ACKNOWLEDGE TICKET ("NOTED")
  // =========================
  const acknowledgeTicket = async (ticketId) => {
    try {
      const response = await authFetch(`/Tickets/${ticketId}/acknowledge`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentUsername: username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to acknowledge ticket");
        return;
      }

      alert("Ticket is now In Progress!");

      getTickets();
      fetchAgentKpi();
    } catch (error) {
      console.error("Acknowledge ticket error:", error);
      alert("Could not connect to backend");
    }
  };

  // =========================
  // RESOLVE TICKET
  // =========================
  const resolveTicket = async (ticketId) => {
    try {
      const response = await authFetch(`/Tickets/${ticketId}/resolve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentUsername: username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to resolve ticket");
        return;
      }

      alert("Ticket resolved successfully!");

      getTickets();
      fetchAgentKpi();
    } catch (error) {
      console.error("Resolve ticket error:", error);
      alert("Could not connect to backend");
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // =========================
  // SEARCH, FILTER & PAGINATION LOGIC
  // =========================
  const filteredTickets = tickets
    .filter((ticket) => {
      const search = searchText.toLowerCase();
      const matchesSearch =
        (ticket.ticketNumber || "").toLowerCase().includes(search) ||
        (ticket.title || "").toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (ticket.status || "").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
      const dateB = new Date(b.createdAt || b.created_at || 0).getTime();

      if (sortOrder === "newest") {
        return dateB - dateA;
      }
      if (sortOrder === "oldest") {
        return dateA - dateB;
      }

      return 0;
    });

  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const currentTickets = filteredTickets.slice(
    startIndex,
    startIndex + ticketsPerPage
  );

  // =========================
  // DATE FORMATTER
  // =========================
  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString();
  };

  const pieData = getAgentPieData();

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${logo})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
       <div className="mb-4nlock sm:hidden text-center ">
              <h1 className="text-2xl font-bold text-white mt-4">Mini Help Desk</h1>
              <p className="text-yellow-300 text-sm mt-1">Agent Panel</p>
            </div>

      {/* ================= MAIN LAYOUT ================= */}
      <div className="relative z-10 flex min-h-screen">
        {/* ================= SIDEBAR ================= */}
        <nav className="hidden sm:block md:w-74 sm:w-64min-h-screen backdrop-blur-xl bg-black/40 border-r border-white/20 text-white p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="mb-10">
              <h1 className="text-2xl font-bold">Mini Help Desk</h1>
              <p className="text-gray-400 text-sm mt-1">Agent Panel</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setActivePage("welcome")}
                className={`text-left px-4 py-3 rounded-lg font-medium transition ${
                  activePage === "welcome"
                    ? "bg-purple-800 shadow-lg"
                    : "hover:bg-purple-900"
                }`}
              >
                🏠 Overview
              </button>

              <button
                onClick={() => setActivePage("tickets")}
                className={`text-left px-4 py-3 rounded-lg font-medium transition ${
                  activePage === "tickets"
                    ? "bg-purple-800 shadow-lg"
                    : "hover:bg-purple-900"
                }`}
              >
                🎫 Tickets
              </button>

              <button
                onClick={() => setActivePage("profile")}
                className={`text-left px-4 py-3 rounded-lg font-medium transition ${
                  activePage === "profile"
                    ? "bg-purple-800 shadow-lg"
                    : "hover:bg-purple-900"
                }`}
              >
                👤 Profile
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-purple-800 hover:bg-red-600 px-4 py-3 rounded-lg font-medium transition text-center"
          >
            Logout
          </button>
        </nav>



       <nav className="block sm:hidden fixed bottom-0 left-0 right-0 z-50 w-full h-16 backdrop-blur-xl bg-black/90 border-t border-white/20 text-white px-3 py-2 flex flex-row items-center justify-around shadow-2xl">

          {/* <div> */}
           

            <div className="flex flex-row  ">
              <button
                onClick={() => setActivePage("welcome")}
                className={`text-left rounded-lg px-6 py-4 flex flex-col transition text-center ${
                  activePage === "welcome"
                    ? "bg-purple-800 shadow-lg"
                    : "hover:bg-purple-900"
                }`}
              >
               <span className="text-base">🏠</span>
    <span className="text-[10px] font-medium mt-0.5">Home</span>
              </button>

              <button
                onClick={() => setActivePage("tickets")}
                className={`text-left px-6 py-4 ml-2 flex flex-col rounded-lg transition text-center ${
                  activePage === "tickets"
                    ? "bg-purple-800 shadow-lg"
                    : "hover:bg-purple-900"
                }`}
              >
               <span className="text-base">🎫</span>
    <span className="text-[10px] font-medium mt-0.5">Tickets</span>
              </button>

              <button
                onClick={() => setActivePage("profile")}
                className={`text-left px-6 py-4 rounded-lg ml-2 flex flex-col transition text-center ${
                  activePage === "profile"
                    ? "bg-purple-800 shadow-lg"
                    : "hover:bg-purple-900"
                }`}
              >
                <span className="text-base">👤</span>
    <span className="text-[10px] font-medium mt-0.5">Profile</span>
              </button>
            {/* </div> */}
         

          <button
            onClick={handleLogout}
            className=" bg-red-900 hover:bg-red-600 px-2 py-4 ml-2 rounded-lg font-medium transition text-center"
          >
            Logout
          </button>
           </div>
        </nav>

        {/* ================= CONTENT ================= */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* WELCOME / OVERVIEW PAGE WITH PERSONAL AGENT CHARTS */}
          {activePage === "welcome" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="backdrop-blur-lg bg-black/40 border border-white/10 rounded-2xl shadow-xl p-8 text-white space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-purple-300">
                    Welcome back, {username}! 👋
                  </h1>
                  <p className="text-gray-300 text-sm mt-1">
                    Here is your personal ticket performance and analytics matrix.
                  </p>
                </div>

                {kpiLoading ? (
                  <p className="text-gray-400">Loading your performance metrics...</p>
                ) : !agentKpi ? (
                  <p className="text-gray-400">No performance records found for your account.</p>
                ) : (
                  <>
                    {/* Top KPI Metric Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                        <p className="text-xs text-gray-400">Active</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {agentKpi.activeTickets || 0}
                        </p>
                      </div>
                      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                        <p className="text-xs text-gray-400">Pending</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {agentKpi.pendingTickets || 0}
                        </p>
                      </div>
                      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                        <p className="text-xs text-gray-400">Closed</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {agentKpi.closedTickets || 0}
                        </p>
                      </div>
                      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                        <p className="text-xs text-gray-400">On-Time</p>
                        <p className="text-2xl font-bold text-green-400">
                          {agentKpi.resolvedWithinTime || 0}
                        </p>
                      </div>
                      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                        <p className="text-xs text-gray-400">Late</p>
                        <p className="text-2xl font-bold text-orange-400">
                          {agentKpi.resolvedAfterTime || 0}
                        </p>
                      </div>
                      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                        <p className="text-xs text-gray-400">Overdue</p>
                        <p className="text-2xl font-bold text-red-500">
                          {agentKpi.totalOverdue || 0}
                        </p>
                      </div>
                  {/* NEW: On-Time Resolution Rate Percentage */}
  <div className="bg-slate-800/80 p-4 rounded-xl border border-emerald-500/30">
    <p className="text-xs text-emerald-400 font-medium">On-Time Rate</p>
    <p className="text-2xl font-bold text-emerald-400">
      {onTimeRate}%
    </p>
  </div>

  {/* NEW: Overall Resolution Rate Percentage */}
  <div className="bg-slate-800/80 p-4 rounded-xl border border-purple-500/30">
    <p className="text-xs text-purple-400 font-medium">Resolution Rate</p>
    <p className="text-2xl font-bold text-purple-300">
      {overallResolutionRate}%
    </p>
  </div>
                    </div>

                    {/* Agent Visual Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                      {/* BAR CHART */}
                      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-xl">
                        <h2 className="text-md font-bold mb-4 text-purple-400">
                          Resolution Performance
                        </h2>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getAgentBarData()}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis dataKey="name" stroke="#94a3b8" />
                              <YAxis stroke="#94a3b8" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#0f172a",
                                  borderColor: "#475569",
                                  borderRadius: "8px",
                                }}
                                itemStyle={{ color: "#fff" }}
                              />
                              <Legend wrapperStyle={{ fontSize: "12px" }} />
                              <Bar dataKey="On-Time" fill="#4ade80" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="Late" fill="#fb923c" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* PIE CHART */}
                      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-xl">
                        <h2 className="text-md font-bold mb-4 text-purple-400">
                          Status Distribution
                        </h2>
                        <div className="h-64 w-full">
                          {pieData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                              No ticket activity records to display.
                            </div>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={pieData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={80}
                                  paddingAngle={4}
                                  dataKey="value"
                                >
                                  {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#0f172a",
                                    borderColor: "#475569",
                                    borderRadius: "8px",
                                  }}
                                />
                                <Legend wrapperStyle={{ fontSize: "12px" }} />
                              </PieChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* PROFILE PAGE */}
          {activePage === "profile" && (
            <div className="max-w-4xl mx-auto">
              <div className="backdrop-blur-lg bg-black/30 border border-white/10 rounded-2xl shadow-xl p-10 text-white">
                <h1 className="text-3xl font-bold mb-8">My Profile</h1>

                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-purple-700 flex items-center justify-center text-3xl">
                    👤
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{username}</h2>
                    <p className="text-gray-400">Agent</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4 border border-white/5">
                    <p className="text-gray-400 text-sm">Username</p>
                    <p className="text-lg font-semibold">{username}</p>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4 border border-white/5">
                    <p className="text-gray-400 text-sm">Role</p>
                    <p className="text-lg font-semibold">Agent</p>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4 border border-white/5">
                    <p className="text-gray-400 text-sm">Active Tickets</p>
                    <p className="text-lg font-semibold">
                      {agentKpi ? agentKpi.activeTickets : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TICKETS PAGE */}
          {activePage === "tickets" && (
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-white mb-6">Tickets</h1>

              {/* SEARCH & FILTERS BAR */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <input
                  type="text"
                  placeholder="Search by Ticket Number or Title..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-3 text-black bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 rounded-lg text-black bg-white border border-gray-300 outline-none focus:border-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="waiting">Waiting</option>
                  <option value="in progress">In Progress</option>
                  <option value="closed">Closed / Resolved</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-4 py-3 rounded-lg text-black bg-white border border-gray-300 outline-none focus:border-purple-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>

                <button
                  onClick={() =>
                    setViewMode((previous) =>
                      previous === "cards" ? "table" : "cards"
                    )
                  }
                  className="px-4 py-3 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-medium transition"
                >
                  {viewMode === "cards" ? "📋 Table View" : "🎫 Card View"}
                </button>
              </div>

              {filteredTickets.length === 0 ? (
                <p className="text-gray-300">No tickets available.</p>
              ) : (
                <>
                  {viewMode === "cards" ? (
                    // CARD VIEW
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {currentTickets.map((ticket) => {
                        const isAssignedToMe =
                          ticket.assignedTo?.toLowerCase() ===
                          username?.toLowerCase();

                        const isClosed = ticket.status === "Closed";
                        const conversationVisible =
                          messages[ticket.id] !== undefined;

                        return (
                          <div
                            key={ticket.id}
                            className="backdrop-blur-lg bg-black/30 rounded-xl shadow-lg p-5 border border-white/10 hover:shadow-2xl transition"
                          >
                            <h3 className="text-lg font-bold text-white">
                              [{ticket.ticketNumber || ticket.id}]
                            </h3>

                            <h4 className="text-md font-semibold text-gray-300 mt-2">
                              {ticket.title}
                            </h4>

                            <p className="text-gray-400 text-sm mt-3">
                              <b>Description:</b> {ticket.description}
                            </p>

                            <p className="text-sm text-gray-400 mt-3">
                              <b>Created By:</b> {ticket.createdBy}
                            </p>
                            <p className="text-sm text-gray-400 mt-2">
                              <b>Created At:</b>{" "}
                              <span className="text-white">
                                {formatDate(ticket.createdAt || ticket.created_at)}
                              </span>
                            </p>

                            {/* STATUS WITH LIVE TIMER */}
                            <p className="text-sm text-gray-400 mt-2 flex items-center flex-wrap gap-1">
                              <b>Status:</b>{" "}
                              <span className="font-bold text-purple-400">
                                {ticket.status}
                              </span>
                              <TicketTimer
                                inProgressAt={
                                  ticket.inProgressAt ||
                                  ticket.InProgressAt ||
                                  ticket.in_progress_at
                                }
                                status={ticket.status}
                                isOverdue={
                                  ticket.isOverdue ||
                                  ticket.IsOverdue ||
                                  ticket.is_overdue
                                }
                              />
                            </p>

                            <p className="text-sm text-gray-400 mt-2">
                              <b>Assigned To:</b>{" "}
                              {ticket.assignedTo || "Not claimed"}
                            </p>

                            {isClosed && ticket.resolvedBy && (
                              <p className="text-sm text-gray-400 mt-2">
                                <b>Resolved By:</b>{" "}
                                <span className="font-bold text-green-400">
                                  {ticket.resolvedBy}
                                </span>
                              </p>
                            )}

                            {/* ACTION BUTTONS */}
                            <div className="flex flex-wrap gap-2 mt-5">
                              {!ticket.assignedTo && !isClosed && (
                                <button
                                  type="button"
                                  onClick={() => claimTicket(ticket.id)}
                                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                                >
                                  Claim Ticket
                                </button>
                              )}

                              {isAssignedToMe && ticket.status === "Waiting" && (
                                <button
                                  type="button"
                                  onClick={() => acknowledgeTicket(ticket.id)}
                                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                                >
                                  Noted
                                </button>
                              )}

                              {isAssignedToMe &&
                                ticket.status === "In Progress" && (
                                  <button
                                    type="button"
                                    onClick={() => resolveTicket(ticket.id)}
                                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                                  >
                                    Resolved
                                  </button>
                                )}

                              <button
                                type="button"
                                onClick={() => {
                                  if (conversationVisible) {
                                    setMessages((previous) => {
                                      const updated = { ...previous };
                                      delete updated[ticket.id];
                                      return updated;
                                    });
                                  } else {
                                    getMessages(ticket.id);
                                  }
                                }}
                                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition"
                              >
                                {conversationVisible
                                  ? "Hide Conversation"
                                  : "View Conversation"}
                              </button>
                            </div>

                            {/* CONVERSATION (IN-CARD) */}
                            {conversationVisible && (
                              <div className="mt-5 pt-4 border-t border-white/10">
                                <h4 className="font-bold text-white mb-3">
                                  Conversation
                                </h4>

                                <div className="space-y-3 bg-[#0b141a] p-3 rounded-xl max-h-60 overflow-y-auto">
                                  {(messages[ticket.id] || []).length === 0 ? (
                                    <p className="text-gray-400 text-xs text-center py-4">
                                      No messages yet.
                                    </p>
                                  ) : (
                                    (messages[ticket.id] || []).map((msg) => {
                                      const isMe =
                                        msg.senderUsername?.toLowerCase() ===
                                        username?.toLowerCase();

                                      return (
                                        <div
                                          key={msg.id || Math.random()}
                                          className={`flex flex-col ${
                                            isMe ? "items-start" : "items-end"
                                          }`}
                                        >
                                          <div
                                            className={`max-w-[80%] p-3 text-sm shadow-md transition-all ${
                                              isMe
                                                ? "bg-[#005c4b] text-white rounded-2xl rounded-tl-none"
                                                : "bg-white text-gray-900 rounded-2xl rounded-tr-none"
                                            }`}
                                          >
                                            <div
                                              className={`flex items-center gap-2 mb-1 ${
                                                isMe ? "text-green-200" : "text-gray-500"
                                              }`}
                                            >
                                              <span className="font-semibold text-xs">
                                                {msg.senderUsername}
                                              </span>
                                              <span className="text-[10px] opacity-75">
                                                ({msg.senderRole})
                                              </span>
                                            </div>
                                            <p className="leading-relaxed text-sm">
                                              {msg.message}
                                            </p>
                                            <p
                                              className={`text-[10px] text-right mt-1 ${
                                                isMe ? "text-green-200" : "text-gray-400"
                                              }`}
                                            >
                                              {formatDate(msg.createdAt || msg.created_at)}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>

                                {/* MESSAGE INPUT */}
                                {!isClosed && (
                                  <div className="flex gap-2 mt-3">
                                    <input
                                      type="text"
                                      placeholder="Type a message..."
                                      value={newMessage[ticket.id] || ""}
                                      onChange={(e) =>
                                        setNewMessage((previous) => ({
                                          ...previous,
                                          [ticket.id]: e.target.value,
                                        }))
                                      }
                                      className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg text-sm outline-none focus:border-purple-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => sendQuestion(ticket.id)}
                                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                                    >
                                      Send
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // TABLE VIEW
                    <div className="overflow-x-auto bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 shadow-xl sm:mb-2 mb-[100px]">
                      <table className="w-full text-left text-white border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5">
                            <th className="p-4 font-semibold">Ticket #</th>
                            <th className="p-4 font-semibold">Title</th>
                            <th className="p-4 font-semibold">Created By</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Assigned To</th>
                            <th className="p-4 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentTickets.map((ticket) => {
                            const isAssignedToMe =
                              ticket.assignedTo?.toLowerCase() ===
                              username?.toLowerCase();
                            const isClosed = ticket.status === "Closed";

                            return (
                              <tr
                                key={ticket.id}
                                className="border-b border-white/5 hover:bg-white/5 transition"
                              >
                                <td className="p-4 font-bold">
                                  {ticket.ticketNumber || ticket.id}
                                </td>
                                <td className="p-4">{ticket.title}</td>
                                <td className="p-4">{ticket.createdBy}</td>
                                <td className="p-4">
                                  <span className="font-bold text-purple-400">
                                    {ticket.status}
                                  </span>
                                </td>
                                <td className="p-4">
                                  {ticket.assignedTo || "Not claimed"}
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-2">
                                    {!ticket.assignedTo && !isClosed && (
                                      <button
                                        type="button"
                                        onClick={() => claimTicket(ticket.id)}
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition"
                                      >
                                        Claim
                                      </button>
                                    )}

                                    {isAssignedToMe &&
                                      ticket.status === "Waiting" && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            acknowledgeTicket(ticket.id)
                                          }
                                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition"
                                        >
                                          Noted
                                        </button>
                                      )}

                                    {isAssignedToMe &&
                                      ticket.status === "In Progress" && (
                                        <button
                                          type="button"
                                          onClick={() => resolveTicket(ticket.id)}
                                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition"
                                        >
                                          Resolve
                                        </button>
                                      )}

                                    <button
                                      type="button"
                                      onClick={() => setConversationTicket(ticket)}
                                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition"
                                    >
                                      Chat
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

               
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ================= TABLE VIEW CONVERSATION MODAL ================= */}
      {conversationTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 ]">
          <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-xl p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setConversationTicket(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold mb-1">
              [{conversationTicket.ticketNumber || conversationTicket.id}] - Conversation
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {conversationTicket.title}
            </p>

            <div className="space-y-3 bg-[#0b141a] p-4 rounded-xl max-h-80 overflow-y-auto mb-4">
              {(messages[conversationTicket.id] || []).length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-4">
                  No messages yet or conversation not loaded. Click send to start chatting.
                </p>
              ) : (
                (messages[conversationTicket.id] || []).map((msg) => {
                  const isMe =
                    msg.senderUsername?.toLowerCase() === username?.toLowerCase();

                  return (
                    <div
                      key={msg.id || Math.random()}
                      className={`flex flex-col ${
                        isMe ? "items-start" : "items-end"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] p-3 text-sm shadow-md transition-all ${
                          isMe
                            ? "bg-[#005c4b] text-white rounded-2xl rounded-tl-none"
                            : "bg-white text-gray-900 rounded-2xl rounded-tr-none"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 mb-1 ${
                            isMe ? "text-green-200" : "text-gray-500"
                          }`}
                        >
                          <span className="font-semibold text-xs">
                            {msg.senderUsername}
                          </span>
                          <span className="text-[10px] opacity-75">
                            ({msg.senderRole})
                          </span>
                        </div>
                        <p className="leading-relaxed text-sm">{msg.message}</p>
                        <p
                          className={`text-[10px] text-right mt-1 ${
                            isMe ? "text-green-200" : "text-gray-400"
                          }`}
                        >
                          {formatDate(msg.createdAt || msg.created_at)}
                        </p>
                           <button
                  type="button"
                  onClick={() => sendQuestion(conversationTicket.id)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                >
                  Send
                </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
   {/* PAGINATION CONTROLS */}
                  {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mb-[50px] sm:mb-2 mt-[20px] sm:mt-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
                      >
                        Previous
                      </button>

                      <span className="text-white text-sm">
                        Page <b>{currentPage}</b> of <b>{totalPages}</b>
                      </span>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
                      >
                        Next
                      </button>
                    </div>
                  )}
            {conversationTicket.status !== "Closed" && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage[conversationTicket.id] || ""}
                  onChange={(e) =>
                    setNewMessage((previous) => ({
                      ...previous,
                      [conversationTicket.id]: e.target.value,
                    }))
                  }
                  className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg text-sm outline-none focus:border-purple-500"
                />
             
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentMainPage;