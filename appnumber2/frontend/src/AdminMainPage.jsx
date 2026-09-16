import { useEffect, useState } from "react";
import { authFetch } from "./api";
import logo from "./assets/logo.jpeg";
import TicketTimer from "./TicketTimer"; // Added Timer Component
import AdminKpiPage from './AdminKpiPage';

function AdminMainPage() {
  // =========================
  // STATES
  // =========================
const [selectedUser, setSelectedUser] = useState(null);

  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);

  const [messages, setMessages] = useState({});
  const [openConversation, setOpenConversation] = useState({});
  const [conversationTicket, setConversationTicket] = useState(null);

  const [viewMode, setViewMode] = useState("cards");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const [activePage, setActivePage] = useState("welcome");

  const [currentPage, setCurrentPage] = useState(1);

  const ticketsPerPage = 6;

// Calculate how many active (non-closed) tickets each agent currently holds
const agentActiveTicketCounts = tickets.reduce((acc, t) => {
  const assigned = t.assignedTo ?? t.assigned_to ?? t.AssignedTo;
  const status = (t.status ?? t.Status ?? "").toLowerCase();

  if (assigned && assigned.trim() !== "" && status !== "closed" && status !== "resolved") {
    acc[assigned] = (acc[assigned] || 0) + 1;
  }
  return acc;
}, {});

const getComplexityBadge = (complexity) => {
  const comp = (complexity || "Medium").toLowerCase();
  switch (comp) {
    case "high":
    case "complex":
      return "bg-red-500/20 text-red-300 border-red-500/40";
    case "medium":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
    case "low":
    case "simple":
      return "bg-green-500/20 text-green-300 border-green-500/40";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/40";
  }
};
  
  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    getAllTickets();
    fetchUsers();
  }, []);

  // =========================
  // FETCH USERS
  // =========================

  const fetchUsers = async () => {
    try {
      const response = await authFetch("/Auth/users");

      if (!response.ok) {
        console.error("Failed to fetch users:", response.status);
        return;
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch users error:", error);
    }
  };

  // =========================
  // FETCH TICKETS
  // =========================

  const getAllTickets = async () => {
    try {
      const response = await authFetch("/Tickets");

      if (!response.ok) {
        console.error("Failed to fetch tickets:", response.status);
        return;
      }

      const data = await response.json();
      setTickets(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Fetch tickets error:", error);
    }
  };

  // =========================
  // DATE FORMAT
  // =========================

  const formatDate = (ticket) => {
    if (!ticket) {
      return "N/A";
    }

    const dateValue =
      ticket.createdAt ??
      ticket.created_at ??
      ticket.CreatedAt ??
      ticket.createdDate ??
      ticket.created_date ??
      ticket.dateCreated ??
      ticket.DateCreated;

    if (!dateValue) {
      return "N/A";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleString("en-PK", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // =========================
  // REASSIGN TICKET
  // =========================

  const handleReassign = async (ticketId, newAgentUsername) => {
    if (!newAgentUsername) {
      return;
    }

    try {
      const response = await authFetch(`/Tickets/${ticketId}/reassign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newAgentUsername: newAgentUsername,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to reassign ticket");
        return;
      }

      alert("Ticket reassigned successfully!");

      await getAllTickets();
    } catch (error) {
      console.error("Reassign error:", error);
      alert("Could not connect to backend");
    }
  };

  // =========================
  // GET MESSAGES
  // =========================

  const getMessages = async (ticketId) => {
    try {
      const response = await authFetch(`/Tickets/${ticketId}/messages`);

      if (!response.ok) {
        console.error("Failed to load messages:", response.status);
        return;
      }

      const data = await response.json();

      setMessages((previous) => ({
        ...previous,
        [ticketId]: Array.isArray(data) ? data : [],
      }));
    } catch (error) {
      console.error("Get messages error:", error);
    }
  };

  // =========================
  // CHANGE USER ROLE
  // =========================

  const changeUserRole = async (username, newRole) => {
    try {
      const response = await authFetch("/Auth/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          newRole: newRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to change role");
        return;
      }

      alert(data.message || "Role updated successfully");

      await fetchUsers();
    } catch (error) {
      console.error("Role change error:", error);
      alert("Could not connect to backend");
    }
  };

  // =========================
  // REJECT TICKET
  // =========================

  const handleReject = async (ticketId) => {
    const confirmReject = window.confirm(
      "Are you sure you want to reject this ticket? It will be permanently deleted."
    );

    if (!confirmReject) {
      return;
    }

    try {
      const response = await authFetch(`/Tickets/${ticketId}/reject`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to reject ticket");
        return;
      }

      alert("Ticket rejected and deleted successfully!");

      await getAllTickets();
    } catch (error) {
      console.error("Reject ticket error:", error);
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
  // INLINE CONVERSATION
  // =========================

  const toggleConversation = (ticketId) => {
    if (openConversation[ticketId]) {
      setOpenConversation((previous) => ({
        ...previous,
        [ticketId]: false,
      }));
    } else {
      getMessages(ticketId);

      setOpenConversation((previous) => ({
        ...previous,
        [ticketId]: true,
      }));
    }
  };

  // =========================
  // SEARCH + FILTER + SORT
  // =========================

  const filteredTickets = [...tickets]
    .filter((ticket) => {
      const search = searchTerm.toLowerCase();

      const ticketNumber = String(
        ticket.ticketNumber ?? ticket.TicketNumber ?? ""
      ).toLowerCase();

      const title = String(ticket.title ?? ticket.Title ?? "").toLowerCase();

      const createdBy = String(
        ticket.createdBy ?? ticket.created_by ?? ticket.CreatedBy ?? ""
      ).toLowerCase();

      const status = String(ticket.status ?? ticket.Status ?? "").toLowerCase();

      const matchesSearch =
        ticketNumber.includes(search) ||
        title.includes(search) ||
        createdBy.includes(search);

      const matchesStatus =
        statusFilter === "all" || status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(
        a.createdAt ??
          a.created_at ??
          a.CreatedAt ??
          a.createdDate ??
          a.created_date ??
          0
      ).getTime();

      const dateB = new Date(
        b.createdAt ??
          b.created_at ??
          b.CreatedAt ??
          b.createdDate ??
          b.created_date ??
          0
      ).getTime();

      if (sortOrder === "newest") {
        return dateB - dateA;
      }

      if (sortOrder === "oldest") {
        return dateA - dateB;
      }

      return 0;
    });

  // =========================
  // PAGINATION
  // =========================

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );

  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  // =========================
  // AGENTS
  // =========================

  const agentsList = users.filter(
    (user) => String(user.role ?? user.Role ?? "").toLowerCase() === "agent"
  );


const handleDownload = async () => {
  try {
    const response = await authFetch("/api/pdf/download-report");

    if (!response.ok) {
      alert(`Failed to load PDF (Status: ${response.status})`);
      return;
    }

    // 1. Convert response stream into a Blob object
    const blob = await response.blob();

    // 2. Create an in-memory URL for the PDF blob
    const url = window.URL.createObjectURL(blob);

    // 3. Open the blob URL directly in a new browser tab
    window.open(url, "_blank");

    // Optional cleanup: Revoke object URL after a delay so the browser has time to load it
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 10000);
  } catch (error) {
    console.error("PDF view error:", error);
    alert("Could not load report from backend.");
  }
};
const handleFullAuditDownload = async () => {
  try {
    const token = localStorage.getItem("token"); // or your JWT storage key

    const response = await authFetch("/api/pdf/download-full-audit", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      alert("Failed to generate full audit report.");
      return;
    }

    const blob = await response.blob();
    const fileURL = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
    window.open(fileURL, "_blank");
  } catch (error) {
    console.error("Error opening full audit report:", error);
  }
};
const handleDownloadSingleTicketAudit = async (ticketId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await authFetch(`/api/pdf/download-ticket-audit/${ticketId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      alert(`Failed to generate audit report for Ticket #${ticketId}`);
      return;
    }

    const blob = await response.blob();
    const fileURL = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
    window.open(fileURL, "_blank");
  } catch (error) {
    console.error(`Error downloading audit for ticket #${ticketId}:`, error);
  }
};
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{
        backgroundImage: `url(${logo})`,
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 flex min-h-screen">
        {/* ================= SIDEBAR ================= */}
         <aside className=" hidden sm:block w-40 sm:w-64 min-h-screen backdrop-blur-xl bg-black/40 border-r border-white/20 text-white p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <h1 className="text-2xl font-bold">Mini Help Desk</h1>
            <p className="text-gray-400 text-sm mt-1">Admin Dashboard</p>

            <div className="flex flex-col gap-3 mt-8">
              <button
                onClick={() => setActivePage("welcome")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                  activePage === "welcome"
                    ? "bg-purple-700 shadow-lg"
                    : "hover:bg-purple-800"
                }`}
              >
                🏠 Welcome
              </button>

              <button
                onClick={() => setActivePage("tickets")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                  activePage === "tickets"
                    ? "bg-purple-700 shadow-lg"
                    : "hover:bg-purple-800"
                }`}
              >
                🎫 All Tickets
              </button>

              <button
                onClick={() => setActivePage("users")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                  activePage === "users"
                    ? "bg-purple-700 shadow-lg"
                    : "hover:bg-purple-800"
                }`}
              >
                👥 Users
              </button>
              
{/* <button
  onClick={() => setActivePage("kpi")}
  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
    activePage === "kpi"
      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
      : "text-gray-400 hover:text-white hover:bg-slate-800"
  }`}
>
  <span>📊</span>
  <span>KPI Performance</span>
</button> */}
            </div>
          </div>
{/* <button 
 className="w-full bg-purple-800 hover:bg-red-600 px-4 py-3 rounded-lg font-medium transition text-center download-btn"
onClick={handleDownload} >
        PDF Report
    </button> */}
          <button
            onClick={handleLogout}
            className="w-full bg-purple-800 hover:bg-red-600 px-4 py-3 rounded-lg font-medium transition text-center"
          >
            Logout
          </button>
        </aside>


<nav className="block sm:hidden fixed bottom-0 left-0 right-0 z-50 w-full h-16 backdrop-blur-xl bg-black/90 border-t border-white/20 text-white px-1 py-1 flex flex-row items-center justify-between shadow-2xl">
  {/* WELCOME */}
  <button
    onClick={() => setActivePage("welcome")}
    className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg transition ${
      activePage === "welcome"
        ? "bg-purple-700 text-white shadow-lg"
        : "text-gray-400 hover:text-white"
    }`}
  >
    <span className="text-base">🏠</span>
    <span className="text-[10px] font-medium mt-0.5">Welcome</span>
  </button>

  {/* TICKETS */}
  <button
    onClick={() => setActivePage("tickets")}
    className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg transition ${
      activePage === "tickets"
        ? "bg-purple-700 text-white shadow-lg"
        : "text-gray-400 hover:text-white"
    }`}
  >
    <span className="text-base">🎫</span>
    <span className="text-[10px] font-medium mt-0.5">Tickets</span>
  </button>

  {/* USERS */}
  <button
    onClick={() => setActivePage("users")}
    className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg transition ${
      activePage === "users"
        ? "bg-purple-700 text-white shadow-lg"
        : "text-gray-400 hover:text-white"
    }`}
  >
    <span className="text-base">👥</span>
    <span className="text-[10px] font-medium mt-0.5">Users</span>
  </button>

  {/* LOGOUT */}
  <button
    onClick={handleLogout}
    className="flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition"
  >
    <span className="text-base">🚪</span>
    <span className="text-[10px] font-medium mt-0.5">Logout</span>
  </button>
</nav>




        {/* ================= MAIN ================= */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* ================= WELCOME ================= */}
          {activePage === "welcome" && (
            <div className="max-w-4xl mx-auto mt-[5%] backdrop-blur-lg rounded-xl shadow-lg p-10 text-center border border-white/10">
              {/* TICKET STATUS SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* WAITING */}
                <div className="backdrop-blur-lg bg-black/30 border border-yellow-400/20 rounded-2xl shadow-xl p-6 text-white">
                  <p className="text-gray-400 text-sm">Waiting Tickets</p>
                  <p className="text-4xl font-bold text-yellow-400 mt-2">
                    {
                      tickets.filter(
                        (ticket) =>
                          (ticket.status || "").toLowerCase() === "waiting"
                      ).length
                    }
                  </p>
                </div>

                {/* IN PROGRESS */}
                <div className="backdrop-blur-lg bg-black/30 border border-blue-400/20 rounded-2xl shadow-xl p-6 text-white">
                  <p className="text-gray-400 text-sm">In Progress Tickets</p>
                  <p className="text-4xl font-bold text-blue-400 mt-2">
                    {
                      tickets.filter(
                        (ticket) =>
                          (ticket.status || "").toLowerCase() === "in progress"
                      ).length
                    }
                  </p>
                </div>

                {/* OPEN */}
                <div className="backdrop-blur-lg bg-black/30 border border-purple-400/20 rounded-2xl shadow-xl p-6 text-white">
                  <p className="text-gray-400 text-sm">Open Tickets</p>
                  <p className="text-4xl font-bold text-purple-400 mt-2">
                    {
                      tickets.filter((ticket) => {
                        const status = (ticket.status || "").toLowerCase();
                        return status !== "closed" && status !== "resolved";
                      }).length
                    }
                  </p>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome, Admin! 👋
              </h1>

              <p className="text-gray-300 text-lg mb-8">
                Welcome to the Mini Helpdesk & Complaint Management System.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-white/20 rounded-xl p-6 shadow-sm bg-black/40 text-white">
                  <h2 className="text-xl font-bold mb-2">Total Tickets</h2>
                  <p className="text-4xl font-bold text-purple-400">
                    {tickets.length}
                  </p>
                </div>

                <div className="border border-white/20 rounded-xl p-6 shadow-sm bg-black/40 text-white">
                  <h2 className="text-xl font-bold mb-2">Total Users</h2>
                  <p className="text-4xl font-bold text-green-400">
                    {users.length}
                  </p>
                </div>
              </div>
                <div className="flex flex-row mb-[50px] mt-[20px]">
         
<button 
 className="w-full bg-purple-800 hover:bg-red-600 px-4 py-3 rounded-lg font-medium transition text-center download-btn"
onClick={handleDownload} >
        PDF Report
    </button>
    </div>
            </div>
          )}

          {/* ================= USERS ================= */}
          {activePage === "users" && (
  <div className="max-w-6xl mx-auto mb-10 sm:mb-2 pb-20 sm:pb-6">
    <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-white">
      Manage Users & Roles
    </h1>

    {users.length === 0 ? (
      <p className="text-white">No users found.</p>
    ) : (
      <div className="w-full overflow-x-auto backdrop-blur-sm border border-gray-800 rounded-xl shadow-lg text-white">
        <table className="w-full border-collapse min-w-[320px] text-xs sm:text-sm">
          <thead>
            <tr className="border-b-2 border-gray-800 text-left bg-black/40">
              <th className="px-3 py-3 sm:p-4 font-semibold">Username</th>
              <th className="px-3 py-3 sm:p-4 font-semibold">Current Role</th>
              <th className="px-3 py-3 sm:p-4 font-semibold">Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.username}
                className="border-b border-gray-700 hover:bg-gray-900/50 transition"
              >
                <td className="px-3 py-3 sm:p-4 font-medium text-purple-300">
                  {user.username}
                </td>
                <td className="px-3 py-3 sm:p-4 text-gray-300">
                  <span className="px-2 py-1 bg-white/10 rounded-md text-[11px] sm:text-xs">
                    {user.role}
                  </span>
                </td>
                <td className="px-3 py-3 sm:p-4">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      changeUserRole(user.username, e.target.value)
                    }
                    className="border border-purple-900 rounded-lg px-2 sm:px-3 py-1.5 text-white bg-purple-800 outline-none text-xs sm:text-sm cursor-pointer"
                  >
                    <option value="User">User</option>
                    <option value="Agent">Agent</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* KPI PERFORMANCE BUTTON CONTAINER */}
    <div className="mt-5 sm:mt-6">
      <button
        onClick={() => setActivePage("kpi")}
        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
      >
        <span className="text-base">📊</span>
        <span>KPI Performance</span>
      </button>
    </div>
  </div>
)}
 
          {/* ================= TICKETS ================= */}
          {activePage === "tickets" && (
            <div className="max-w-7xl mx-auto mb-10 sm:mb-2">
              
              <h1 className="sm:text-3xl font-bold mb-6 text-white">
                All Tickets 
              </h1> 

              {/* SEARCH & FILTERS BAR */}
              <div className="flex flex-col md:flex-row gap-2 sm:gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search by Ticket Number, Title or User..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-3 text-black bg-white outline-none"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 rounded-lg text-black bg-white border border-gray-300 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Waiting">Waiting</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 rounded-lg text-black bg-white border border-gray-300 outline-none"
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
                  className="sm:px-4 sm:py-3 px-2 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-medium transition"
                >
                  {viewMode === "cards" ? "📋 Table View" : "🎫 Card View"}
                </button>
                <button
  onClick={handleFullAuditDownload}
  className="sm:px-4 sm:py-3 px-2 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-medium transition"
>
  📋 Full Audit Report
</button>
              </div>

              {/* NO TICKETS */}
              {filteredTickets.length === 0 ? (
                <p className="text-white">No tickets available.</p>
              ) : (
                <>
                  {/* ================= CARD VIEW ================= */}
                  {viewMode === "cards" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 gap-2">
                      {currentTickets.map((ticket) => {
                        const isClosed =
                          String(
                            ticket.status ?? ticket.Status ?? ""
                          ).toLowerCase() === "closed";

                        const isOpen = !!openConversation[ticket.id];

                        return (
                          <div
                            key={ticket.id}
                            className="backdrop-blur-lg bg-black/30 rounded-xl shadow-md p-5 border border-gray-800 hover:shadow-xl transition flex flex-col justify-between"
                          >
                            <div>
                              <h3 className="text-lg font-bold text-white">
                                [
                                {ticket.ticketNumber ??
                                  ticket.TicketNumber ??
                                  ticket.id}
                                ]
                              </h3>

                              <h4 className="text-md font-semibold text-gray-300 mt-2">
                                {ticket.title ?? ticket.Title ?? "No Title"}
                              </h4>

                              <p className="text-gray-400 mt-3 text-sm">
                                <b>Description:</b>{" "}
                                {ticket.description ??
                                  ticket.Description ??
                                  "N/A"}
                              </p>
<p className="mt-2 text-sm text-gray-400 flex items-center gap-2">
  <b>Complexity:</b>
  <span
    className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${getComplexityBadge(
      ticket.complexity || ticket.Complexity
    )}`}
  >
    {ticket.complexity || ticket.Complexity || "Medium"}
  </span>
</p>
                              <p className="mt-3 text-sm text-gray-400">
                                <b>Created By:</b>{" "}
                                {ticket.createdBy ??
                                  ticket.created_by ??
                                  ticket.CreatedBy ??
                                  "N/A"}
                              </p>

                              <p className="text-sm text-gray-400 mt-2">
                                <b>Created At:</b>{" "}
                                <span className="text-purple-300 font-medium">
                                  {formatDate(ticket)}
                                </span>
                              </p>

                              {/* STATUS WITH LIVE TIMER */}
                              <p className="mt-2 text-sm text-gray-400 flex items-center flex-wrap gap-1">
                                <b>Status:</b>{" "}
                                <span className="font-bold text-purple-400">
                                  {ticket.status ?? ticket.Status ?? "N/A"}
                                </span>
                                <TicketTimer
                                  inProgressAt={
                                    ticket.inProgressAt ||
                                    ticket.InProgressAt ||
                                    ticket.in_progress_at
                                  }
                                  status={ticket.status ?? ticket.Status}
                                  isOverdue={
                                    ticket.isOverdue ||
                                    ticket.IsOverdue ||
                                    ticket.is_overdue
                                  }
                                />
                              </p>

                              {isClosed &&
                                (ticket.resolvedBy ||
                                  ticket.resolved_by ||
                                  ticket.ResolvedBy) && (
                                  <p className="mt-2 text-sm text-gray-400">
                                    <b>Resolved By:</b>{" "}
                                    <span className="font-bold text-white">
                                      {ticket.resolvedBy ??
                                        ticket.resolved_by ??
                                        ticket.ResolvedBy}
                                    </span>
                                  </p>
                                )}

                              {/* ASSIGNED AGENT */}
                              <div className="mt-4">
                                <label className="block text-sm font-bold text-gray-300 mb-2">
                                  Assigned Agent
                                </label>

                                {isClosed ? (
                                  <span className="text-sm font-bold text-gray-300">
                                    {ticket.assignedTo ??
                                      ticket.assigned_to ??
                                      ticket.AssignedTo ??
                                      "Unassigned"}
                                  </span>
                                ) : (
                                  <select
                                    value={
                                      ticket.assignedTo ??
                                      ticket.assigned_to ??
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleReassign(ticket.id, e.target.value)
                                    }
                                    className="w-full border border-gray-600 rounded-lg px-3 py-2 text-black bg-white outline-none"
                                  >
                                    <option value="" disabled>
                                      -- Select Agent --
                                    </option>
                                    {agentsList.map((agent) => (
                                      <option
                                        key={agent.username}
                                        value={agent.username}
                                      >
                                        {agent.username}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            </div>

{/* 💡 DYNAMIC SMART AGENT RECOMMENDATION */}
{ticket.recommendedAgent && String(ticket.recommendedAgent).trim() !== "" && !isClosed && (
  <div className="mt-3 p-3 bg-purple-950/70 border border-purple-500/40 rounded-lg flex items-center justify-between gap-2">
    <div className="flex items-center gap-2">
      <span className="text-lg">💡</span>
      <div>
        <p className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
          Smart Recommendation
        </p>
        <p className="text-xs text-gray-200">
          Recommended:{" "}
          <strong className="text-yellow-300">
            @{ticket.recommendedAgent} ({agentActiveTicketCounts[ticket.recommendedAgent] || 0})
          </strong>
          </p>
        <span className="text-[10px] text-purple-300/80 font-medium block mt-0.5">
          {ticket.complexity === "Complex" || ticket.complexity === "High"
            ? "⚡ Best Agent (Experienced)"
            : "🌱 Junior Agent (Training)"}
        </span>
      </div>
    </div>

    {/* Direct Reassign Trigger */}
    <button
      type="button"
      onClick={() => handleReassign(ticket.id, ticket.recommendedAgent)}
      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-md shadow transition shrink-0"
    >
      Assign
    </button>
  </div>
)}
                            {/* BUTTONS */}
                            <div className="mt-5 flex flex-wrap gap-2">
                              {!isClosed && (
                                <button
                                  onClick={() => handleReject(ticket.id)}
                                  className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition"
                                >
                                  Reject Ticket
                                </button>
                              )}

                              <button
                                onClick={() => toggleConversation(ticket.id)}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                              >
                                {isOpen
                                  ? "Hide Conversation"
                                  : "View Conversation"}
                              </button>
                            </div>

                            {/* INLINE CONVERSATION */}
                            {isOpen && (
                              <div className="mt-5 pt-4 border-t border-gray-700">
                                <h4 className="font-bold text-white mb-3">
                                  Conversation
                                </h4>

                                {(messages[ticket.id] || []).length === 0 ? (
                                  <p className="text-gray-400 text-sm">
                                    No messages yet.
                                  </p>
                                ) : (
                                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                    {(messages[ticket.id] || []).map((msg) => (
                                      <div
                                        key={msg.id || Math.random()}
                                        className="p-3 bg-white/90 border border-gray-300 rounded-lg text-black text-sm"
                                      >
                                        <div className="flex justify-between items-center mb-1">
                                          <b className="text-purple-900">
                                            {msg.senderUsername}
                                          </b>
                                          <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded">
                                            {msg.senderRole}
                                          </span>
                                        </div>
                                        <p className="text-gray-800">
                                          {msg.message}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                  
                                )}
                 
                  </div>

                            )}
                            
                             <button
        onClick={() => handleDownloadSingleTicketAudit(ticket.id)}
        className=" py-2 mt-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-medium transitio" 
        title="Export Ticket Audit PDF"
      >
        📄 Export Audit
      </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // TABLE VIEW
                    <div className="w-full overflow-x-auto rounded-xl border border-white/10 shadow-xl">
  <table className="min-w-[850px] w-full text-left text-white bg-black/30 text-xs sm:text-sm">
    <thead className="bg-purple-900/70">
      <tr>
        <th className="px-2 sm:px-4 py-3">Ticket</th>
        <th className="px-2 sm:px-4 py-3">Title</th>
        <th className="px-2 sm:px-4 py-3">Created By</th>
        <th className="px-2 sm:px-4 py-3">Complexity</th>
        <th className="px-2 sm:px-4 py-3">Created At</th>
        <th className="px-2 sm:px-4 py-3">Status</th>
        <th className="px-2 sm:px-4 py-3">Assigned Agent</th>
        <th className="px-2 sm:px-4 py-3">Recommended</th>
        <th className="px-2 sm:px-4 py-3">Action</th>
      </tr>
    </thead>

    <tbody>
      {currentTickets.map((ticket) => {
        const isClosed =
          String(ticket.status ?? ticket.Status ?? "").toLowerCase() === "closed";

        return (
          <tr
            key={ticket.id}
            className="border-t border-white/10 hover:bg-white/5 whitespace-nowrap"
          >
            {/* TICKET NUMBER */}
            <td className="px-2 sm:px-4 py-3 font-semibold text-purple-300">
              {ticket.ticketNumber ?? ticket.TicketNumber ?? ticket.id}
            </td>

            {/* TITLE */}
            <td className="px-2 sm:px-4 py-3 font-medium max-w-[150px] sm:max-w-none truncate">
              {ticket.title ?? ticket.Title ?? "No Title"}
            </td>

            {/* CREATED BY */}
            <td className="px-2 sm:px-4 py-3 text-gray-300">
              {ticket.createdBy ?? ticket.created_by ?? ticket.CreatedBy ?? "N/A"}
            </td>

            {/* COMPLEXITY BADGE */}
            <td className="px-2 sm:px-4 py-3">
              <span
                className={`inline-block px-2 py-0.5 text-[11px] sm:text-xs font-semibold rounded border ${getComplexityBadge(
                  ticket.complexity || ticket.Complexity
                )}`}
              >
                {ticket.complexity || ticket.Complexity || "Medium"}
              </span>
            </td>

            {/* CREATED AT */}
            <td className="px-2 sm:px-4 py-3 text-gray-300">
              {formatDate(ticket)}
            </td>

            {/* STATUS WITH TIMER */}
            <td className="px-2 sm:px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-purple-400">
                  {ticket.status ?? ticket.Status ?? "N/A"}
                </span>
                <TicketTimer
                  inProgressAt={
                    ticket.inProgressAt ||
                    ticket.InProgressAt ||
                    ticket.in_progress_at
                  }
                  status={ticket.status ?? ticket.Status}
                  isOverdue={
                    ticket.isOverdue ||
                    ticket.IsOverdue ||
                    ticket.is_overdue
                  }
                />
              </div>
            </td>

            {/* ASSIGNED AGENT */}
            <td className="px-2 sm:px-4 py-3">
              {isClosed ? (
                <span className="font-bold text-gray-300">
                  {ticket.assignedTo ??
                    ticket.assigned_to ??
                    ticket.AssignedTo ??
                    "Unassigned"}
                </span>
              ) : (
                <select
                  value={ticket.assignedTo ?? ticket.assigned_to ?? ""}
                  onChange={(e) => handleReassign(ticket.id, e.target.value)}
                  className="border border-gray-600 rounded px-2 py-1 text-black bg-white text-xs sm:text-sm outline-none"
                >
                  <option value="" disabled>
                    -- Select Agent --
                  </option>
                  {agentsList.map((agent) => (
                    <option key={agent.username} value={agent.username}>
                      {agent.username}
                    </option>
                  ))}
                </select>
              )}
            </td>

            {/* RECOMMENDED AGENT */}
            <td className="px-2 sm:px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="text-base">💡</span>
                <span className="text-xs text-gray-200">
                  <strong className="text-yellow-300">
                    @{ticket.recommendedAgent} (
                    {agentActiveTicketCounts[ticket.recommendedAgent] || 0})
                  </strong>
                </span>
              </div>
            </td>

            {/* ACTION BUTTON */}
            <td className="px-2 sm:px-4 py-3">
              <div className="flex items-center gap-2">
                {!isClosed && (
                  <button
                    onClick={() => handleReject(ticket.id)}
                    className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition font-medium"
                  >
                    Reject
                  </button>
                )}
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
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
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

            </div>
          )}

    
         {activePage === "kpi" && (
  <div className="max-w-7xl mx-auto">
    <AdminKpiPage authFetch={authFetch} />
  </div>
)}

        </main>
      </div>
    </div>
  );
}

export default AdminMainPage;