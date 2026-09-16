import { useEffect, useState } from "react";
import { authFetch } from "./api";
import logo from "./assets/logo.jpeg";

function UserMainPage() {
  const [activePage, setActivePage] = useState("welcome");
  const [viewMode, setViewMode] = useState("cards");
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [conversationTicket, setConversationTicket] = useState(null);
const [complexity, setComplexity] = useState("Low");
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState({});
const [selectedFile, setSelectedFile] = useState(null);
const [storageType, setStorageType] = useState("Disk"); // Default storage option
  // Search & Filter State
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 6;

  const username = localStorage.getItem("username");

  useEffect(() => {
    getMyTickets();
  }, []);

  // =========================
  // GET MY TICKETS
  // =========================
  const getMyTickets = async () => {
    try {
      const response = await authFetch(`/Tickets?username=${username}`);

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
  // HIDE CONVERSATION
  // =========================
  const hideConversation = (ticketId) => {
    setMessages((previous) => {
      const updated = { ...previous };
      delete updated[ticketId];
      return updated;
    });
  };

  // =========================
  // SEND REPLY
  // =========================
  const sendReply = async (ticketId) => {
    const message = newMessage[ticketId];

    if (!message || !message.trim()) {
      alert("Please enter a reply");
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
          senderRole: "User",
          message: message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || "Failed to send reply");
        return;
      }

      setNewMessage((previous) => ({
        ...previous,
        [ticketId]: "",
      }));

      getMessages(ticketId);
    } catch (error) {
      console.error("Send reply error:", error);
    }
  };

// const handleCreateTicket = async (e) => {
//     e.preventDefault();

//     if (!title.trim() || !description.trim()) {
//       alert("Title and description are required");
//       return;
//     }

//     // Verify exactly what is inside 'complexity' before sending
//     console.log("SENDING COMPLEXITY:", complexity);

//     try {
//       const response = await authFetch("/Tickets", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           title: title.trim(),
//           description: description.trim(),
//           complexity: complexity, // Ensure string match
//           createdBy: username,
//         }),
//       });

//       if (!response.ok) {
//         alert(
//           `Failed to create ticket. Server returned status: ${response.status}`
//         );
//         return;
//       }

//       alert("Ticket Created Successfully!");

//       setTitle("");
//       setDescription("");
//       setComplexity("Low");

//       await getMyTickets();
//       setActivePage("tickets");
//     } catch (error) {
//       console.error("Create ticket error:", error);
//       alert("Could not connect to backend");
//     }
//   };
// =========================
  // CREATE TICKET
  // =========================
  const handleCreateTicket = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Title and description are required");
      return;
    }

    const formData = new FormData();
    formData.append("Title", title.trim());
    formData.append("Description", description.trim());
    formData.append("Complexity", complexity);
    formData.append("CreatedBy", username || "");

    // Direct Check for Selected File
    if (selectedFile) {
      console.log("ATTACHING FILE:", selectedFile.name, "STORAGE:", storageType);
      formData.append("ImageFile", selectedFile);
      formData.append("StorageType", storageType);
    } else {
      console.log("NO FILE SELECTED");
    }

    try {
      const response = await authFetch("/Tickets", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        alert(`Failed to create ticket. Status: ${response.status}`);
        return;
      }

      alert("Ticket Created Successfully!");

      setTitle("");
      setDescription("");
      setComplexity("Low");
      setSelectedFile(null);

      await getMyTickets();
      setActivePage("tickets");
    } catch (error) {
      console.error("Create ticket error:", error);
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
      // 1. Search text filter
      const search = searchText.toLowerCase();
      const matchesSearch =
        (ticket.ticketNumber || "").toLowerCase().includes(search) ||
        (ticket.title || "").toLowerCase().includes(search);

      // 2. Status dropdown filter
      const matchesStatus =
        statusFilter === "all" ||
        (ticket.status || "").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // 3. Date sorting
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

  const openConversationPopup = async (ticket) => {
    setConversationTicket(ticket);

    try {
      const response = await authFetch(`/Tickets/${ticket.id}/messages`);

      if (!response.ok) {
        alert("Failed to load conversation");
        return;
      }

      const data = await response.json();

      setMessages((previous) => ({
        ...previous,
        [ticket.id]: data,
      }));
    } catch (error) {
      console.error("Get conversation error:", error);
    }
  };

  // =========================
  // DATE FORMATTER
  // =========================
  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "N/A";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleString();
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${logo})` }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 min-h-screen flex">
        {/* LEFT SIDEBAR */}
        <aside className=" hidden sm:block w-40 sm:w-64 min-h-screen backdrop-blur-xl bg-black/40 border-r border-white/20 text-white p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="mb-10">
              <h1 className="text-2xl font-bold">Mini Helpdesk</h1>
              <p className="text-xs text-gray-400 mt-1">
                Complaint Management System
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setActivePage("welcome")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                  activePage === "welcome"
                    ? "bg-purple-700 shadow-lg"
                    : "hover:bg-white/10"
                }`}
              >
                🏠 Welcome
              </button>

              <button
                onClick={() => setActivePage("tickets")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                  activePage === "tickets"
                    ? "bg-purple-700 shadow-lg"
                    : "hover:bg-white/10"
                }`}
              >
                🎫 My Tickets
              </button>

              <button
                onClick={() => setActivePage("profile")}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                  activePage === "profile"
                    ? "bg-purple-700 shadow-lg"
                    : "hover:bg-white/10"
                }`}
              >
                👤 Profile
              </button>
            </div>
          </div>

          <div>
            <div className="border-t border-white/20 pt-5 mb-4">
              <p className="text-xs text-gray-400">Logged in as</p>
              <p className="text-sm font-semibold text-white mt-1 truncate">
                {username}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-medium transition"
            >
              🚪 Logout
            </button>
          </div>
        </aside>

        
     <nav className="block sm:hidden fixed bottom-0 left-0 right-0 z-50 w-full h-16 backdrop-blur-xl bg-black/90 border-t border-white/20 text-white px-3 py-2 flex flex-row items-center justify-around shadow-2xl">
  {/* WELCOME BUTTON */}
  <button
    onClick={() => setActivePage("welcome")}
    className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg transition ${
      activePage === "welcome"
        ? "bg-purple-700 text-white shadow-lg"
        : "text-gray-400 hover:text-white"
    }`}
  >
    <span className="text-lg">🏠</span>
    <span className="text-[10px] font-medium mt-0.5">Welcome</span>
  </button>

  {/* TICKETS BUTTON */}
  <button
    onClick={() => setActivePage("tickets")}
    className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg transition ${
      activePage === "tickets"
        ? "bg-purple-700 text-white shadow-lg"
        : "text-gray-400 hover:text-white"
    }`}
  >
    <span className="text-lg">🎫</span>
    <span className="text-[10px] font-medium mt-0.5">Tickets</span>
  </button>

  {/* PROFILE BUTTON */}
  <button
    onClick={() => setActivePage("profile")}
    className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg transition ${
      activePage === "profile"
        ? "bg-purple-700 text-white shadow-lg"
        : "text-gray-400 hover:text-white"
    }`}
  >
    <span className="text-lg">👤</span>
    <span className="text-[10px] font-medium mt-0.5">Profile</span>
  </button>

  {/* LOGOUT BUTTON */}
  <button
    onClick={handleLogout}
    className="flex flex-col items-center justify-center px-3 py-1 rounded-lg text-red-400 hover:text-red-300 transition"
  >
    <span className="text-lg">🚪</span>
    <span className="text-[10px] font-medium mt-0.5">Logout</span>
  </button>
</nav>
      
        {/* RIGHT SIDE CONTENT */}
        <main className="flex-1 min-h-screen overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            {/* WELCOME PAGE */}
            {activePage === "welcome" && (
              <div className="max-w-5xl mx-auto mt-10">
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-10 text-white">
                  <h1 className="text-4xl font-bold mb-3">Welcome 👋</h1>
                  <p className="text-xl text-gray-200">
                    Hello,{" "}
                    <span className="font-bold text-purple-400">
                      {username}
                    </span>
                  </p>
                  <p className="text-gray-400 mt-2 mb-10">
                    Welcome to the Mini Helpdesk & Complaint Management System.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                      <p className="text-gray-400 text-sm">Total Tickets</p>
                      <p className="text-4xl font-bold text-purple-400 mt-2">
                        {tickets.length}
                      </p>
                    </div>

                    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                      <p className="text-gray-400 text-sm">Active Tickets</p>
                      <p className="text-4xl font-bold text-blue-400 mt-2">
                        {
                          tickets.filter((ticket) => ticket.status !== "Closed")
                            .length
                        }
                      </p>
                    </div>

                    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                      <p className="text-gray-400 text-sm">Resolved</p>
                      <p className="text-4xl font-bold text-green-400 mt-2">
                        {
                          tickets.filter((ticket) => ticket.status === "Closed")
                            .length
                        }
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActivePage("tickets")}
                    className="mt-10 bg-purple-700 hover:bg-purple-800 px-6 py-3 rounded-lg font-semibold transition"
                  >
                    🎫 View My Tickets
                  </button>
                </div>
              </div>
            )}

            {/* PROFILE PAGE */}
            {activePage === "profile" && (
              <div className="max-w-3xl mx-auto mt-10">
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 text-white">
                  <h1 className="text-3xl font-bold mb-8">👤 My Profile</h1>

                  <div className="space-y-4">
                    <div className="bg-black/20 border border-white/10 rounded-xl p-5">
                      <p className="text-gray-400 text-sm">Username</p>
                      <p className="text-xl font-semibold mt-1">{username}</p>
                    </div>

                    <div className="bg-black/20 border border-white/10 rounded-xl p-5">
                      <p className="text-gray-400 text-sm">Role</p>
                      <p className="text-xl font-semibold mt-1">User</p>
                    </div>

                    <div className="bg-black/20 border border-white/10 rounded-xl p-5">
                      <p className="text-gray-400 text-sm">Total Tickets</p>
                      <p className="text-xl font-semibold mt-1">
                        {tickets.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TICKETS PAGE */}
            {activePage === "tickets" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      🎫 My Tickets
                    </h1>
                    <p className="text-gray-400 mt-1">
                      Create and manage your support tickets
                    </p>
                  </div>
                </div>

                {/* CREATE TICKET FORM */}
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-xl p-6 mb-8">
                  <h2 className="text-xl font-bold text-white mb-5">
                    Create New Ticket
                  </h2>

                  <form onSubmit={handleCreateTicket}>
                    <input
                      type="text"
                      placeholder="Ticket Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full mb-4 px-4 py-3 rounded-lg text-black bg-white outline-none focus:ring-2 focus:ring-purple-500"
                    />
{/* 2. Complexity Dropdown (Button se pehle) */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-200 mb-1">
      Complexity
    </label>
   <select
    value={complexity}
    onChange={(e) => setComplexity(e.target.value)}
    className="w-full mb-4 px-4 py-3 rounded-lg text-black bg-white outline-none focus:ring-2 focus:ring-purple-500"
  >
      <option value="Low">🟢 Low</option>
      <option value="Medium">🟡 Medium</option>
      <option value="High">🟠 High</option>
      <option value="Complex">🔴 Complex</option>
    </select>
  </div>
                    <textarea
                      placeholder="Describe your problem..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full h-28 mb-4 px-4 py-3 rounded-lg text-black bg-white outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />

                    <button
                      type="submit"
                      className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-lg font-semibold transition"
                    >
                      ➕ Create Ticket
                    </button>
  {/* Optional Image Upload */}
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-200 mb-1">
    Attach Image (Optional)
  </label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => setSelectedFile(e.target.files[0])}
    className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-700 file:text-white hover:file:bg-purple-800 cursor-pointer"
  />
</div>

{/* Storage Selection (Visible only when file selected) */}
{selectedFile && (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-200 mb-1">
      Storage Method
    </label>
    <select
      value={storageType}
      onChange={(e) => setStorageType(e.target.value)}
      className="w-full px-4 py-3 rounded-lg text-black bg-white outline-none focus:ring-2 focus:ring-purple-500"
    >
      <option value="Disk">📁 File System Storage (Server Folder)</option>
      <option value="Database">🗄️ Database Base64 Storage (MySQL)</option>
    </select>
  </div>
)}
                  </form>
                </div>

                {/* SEARCH & FILTERS BAR */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  {/* SEARCH INPUT */}
                  <input
                    type="text"
                    placeholder="Search by Ticket Number or Title..."
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full md:w-96 px-4 py-3 rounded-lg text-black bg-white outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  {/* STATUS FILTER */}
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-3 rounded-lg text-black bg-white outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="waiting">Waiting</option>
                    <option value="in progress">In Progress</option>
                    <option value="closed">Closed / Resolved</option>
                  </select>

                  {/* SORT ORDER */}
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-4 py-3 rounded-lg text-black bg-white outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>

                  {/* VIEW MODE BUTTON */}
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

                {/* TICKETS DISPLAY */}
                {filteredTickets.length === 0 ? (
                  <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-8 text-white text-center">
                    <p className="text-gray-300">No tickets available.</p>
                  </div>
                ) : (
                  <>
                    {viewMode === "cards" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {currentTickets.map((ticket) => {
                          const isClosed = ticket.status === "Closed";
                          const conversationOpen =
                            messages[ticket.id] !== undefined;

                          return (
                            <div
                              key={ticket.id}
                              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-lg p-5 text-white hover:shadow-2xl transition"
                            >
                              {/* HEADER */}
                              <div className="flex justify-between items-start gap-3">
                                <div>
                                  <h3 className="text-lg font-bold">
                                    [{ticket.ticketNumber || ticket.id}]
                                  </h3>
                                  <h4 className="font-semibold text-gray-300 mt-2">
                                    {ticket.title}
                                  </h4>
                                </div>

                                <span
                                  className={`text-xs px-3 py-1 rounded-full font-bold ${
                                    isClosed
                                      ? "bg-green-600/30 text-green-300"
                                      : "bg-purple-600/30 text-purple-300"
                                  }`}
                                >
                                  {ticket.status}
                                </span>
                              </div>

                              {/* DESCRIPTION */}
                              <p className="text-gray-300 text-sm mt-4">
                                {ticket.description}
                              </p>

                              {/* CREATED DATE */}
                              <p className="text-gray-400 text-sm mt-3">
                                <b>Created At:</b>{" "}
                                {formatDate(
                                  ticket.createdAt || ticket.created_at
                                )}
                              </p>

                              {/* ASSIGNED AGENT */}
                              <div className="mt-4 text-sm text-gray-300">
                                <b>Assigned Agent:</b>{" "}
                                <span className="text-white">
                                  {ticket.assignedTo || "Not claimed yet"}
                                </span>
                              </div>

                              {/* CONVERSATION */}
                              <div className="mt-5 pt-4 border-t border-white/20">
                                <button
                                  onClick={() => {
                                    if (conversationOpen) {
                                      hideConversation(ticket.id);
                                    } else {
                                      getMessages(ticket.id);
                                    }
                                  }}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    conversationOpen
                                      ? "bg-gray-600 hover:bg-gray-700"
                                      : "bg-blue-600 hover:bg-blue-700"
                                  }`}
                                >
                                  {conversationOpen
                                    ? "Hide Conversation"
                                    : "View Conversation"}
                                </button>

                                {/* SHOW MESSAGES (IN CARD) */}
                                {conversationOpen && (
                                  <div className="mt-4 max-h-64 overflow-y-auto space-y-3 bg-[#0b141a] p-3 rounded-xl border border-white/10">
                                    {(messages[ticket.id] || []).length ===
                                    0 ? (
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
                                              isMe
                                                ? "items-start"
                                                : "items-end"
                                            }`}
                                          >
                                            <div
                                              className={`max-w-[80%] p-3 text-sm shadow-md transition-all ${
                                                isMe
                                                  ? "bg-[#005c4b] text-white rounded-2xl rounded-tl-none border border-emerald-600/30"
                                                  : "bg-white text-gray-900 rounded-2xl rounded-tr-none border border-gray-200"
                                              }`}
                                            >
                                              <div
                                                className={`flex items-center gap-2 mb-1 ${
                                                  isMe
                                                    ? "justify-start"
                                                    : "justify-end"
                                                }`}
                                              >
                                                <span
                                                  className={`font-bold text-xs ${
                                                    isMe
                                                      ? "text-emerald-300"
                                                      : "text-blue-600"
                                                  }`}
                                                >
                                                  {msg.senderUsername}
                                                </span>
                                                <span
                                                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                    isMe
                                                      ? "bg-black/30 text-gray-200"
                                                      : "bg-gray-200 text-gray-700"
                                                  }`}
                                                >
                                                  {msg.senderRole}
                                                </span>
                                              </div>

                                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                {msg.message}
                                              </p>

                                              <div
                                                className={`flex items-center gap-1 mt-1 text-[10px] ${
                                                  isMe
                                                    ? "text-gray-200 justify-start"
                                                    : "text-gray-500 justify-end"
                                                }`}
                                              >
                                                <span>
                                                  {msg.createdAt
                                                    ? new Date(
                                                        msg.createdAt
                                                      ).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                      })
                                                    : ""}
                                                </span>
                                                {isMe && (
                                                  <span className="text-[#53bdeb] font-bold text-xs">
                                                    ✓✓
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}

                                {/* REPLY */}
                                {!isClosed && (
                                  <div className="mt-4">
                                    <textarea
                                      placeholder="Reply to agent..."
                                      value={newMessage[ticket.id] || ""}
                                      onChange={(e) =>
                                        setNewMessage((previous) => ({
                                          ...previous,
                                          [ticket.id]: e.target.value,
                                        }))
                                      }
                                      className="w-full h-20 p-3 rounded-lg text-black bg-white resize-none outline-none focus:ring-2 focus:ring-green-500"
                                    />

                                    <button
                                      onClick={() => sendReply(ticket.id)}
                                      className="mt-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-medium transition"
                                    >
                                      💬 Send Reply
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* ================= TABLE VIEW ================= */
                      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-white">
                            <thead className="bg-black/40 border-b border-white/20">
                              <tr>
                                <th className="px-5 py-4 text-sm font-semibold">
                                  Ticket #
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold">
                                  Title
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold">
                                  Description
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold">
                                  Status
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold">
                                  Created At
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold">
                                  Assigned Agent
                                </th>
                                <th className="px-5 py-4 text-sm font-semibold">
                                  Action
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {currentTickets.map((ticket) => {
                                const isClosed = ticket.status === "Closed";

                                return (
                                  <tr
                                    key={ticket.id}
                                    className="border-b border-white/10 hover:bg-white/5 transition"
                                  >
                                    <td className="px-5 py-4 font-semibold">
                                      {ticket.ticketNumber || ticket.id}
                                    </td>
                                    <td className="px-5 py-4">{ticket.title}</td>
                                    <td className="px-5 py-4 max-w-xs">
                                      <p className="truncate">
                                        {ticket.description}
                                      </p>
                                    </td>
                                    <td className="px-5 py-4">
                                      <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                          isClosed
                                            ? "bg-green-600/30 text-green-300"
                                            : "bg-purple-600/30 text-purple-300"
                                        }`}
                                      >
                                        {ticket.status}
                                      </span>
                                    </td>
                                    <td className="px-5 py-4 text-gray-300 whitespace-nowrap">
                                      {formatDate(
                                        ticket.createdAt || ticket.created_at
                                      )}
                                    </td>

                                    <td className="px-5 py-4">
                                      {ticket.assignedTo || (
                                        <span className="text-gray-400">
                                          Not claimed
                                        </span>
                                      )}
                                    </td>

                                    <td className="px-5 py-4">
                                      <button
                                        onClick={() =>
                                          openConversationPopup(ticket)
                                        }
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition"
                                      >
                                        💬 Open Chat
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* PAGINATION CONTROLS */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mb-[50px] sm:mb-2 mt-[20px] sm:mt-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 hover:bg-white/20 transition "
                        >
                          Previous
                        </button>
                        <span className="text-white text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 hover:bg-white/20 transition"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CONVERSATION MODAL (FOR TABLE VIEW) */}
      {conversationTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0b141a] border border-white/20 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* MODAL HEADER */}
            <div className="p-4 bg-white/10 border-b border-white/10 flex justify-between items-center text-white">
              <div>
                <h3 className="font-bold text-lg">
                  [{conversationTicket.ticketNumber || conversationTicket.id}]{" "}
                  {conversationTicket.title}
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  Assigned Agent:{" "}
                  {conversationTicket.assignedTo || "Not claimed"}
                </p>
              </div>

              <button
                onClick={() => setConversationTicket(null)}
                className="text-gray-400 hover:text-white text-2xl font-bold px-2"
              >
                &times;
              </button>
            </div>

            {/* MESSAGES BODY */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {(messages[conversationTicket.id] || []).length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  No messages yet.
                </p>
              ) : (
                (messages[conversationTicket.id] || []).map((msg) => {
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
                            ? "bg-[#005c4b] text-white rounded-2xl rounded-tl-none border border-emerald-600/30"
                            : "bg-white text-gray-900 rounded-2xl rounded-tr-none border border-gray-200"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 mb-1 ${
                            isMe ? "justify-start" : "justify-end"
                          }`}
                        >
                          <span
                            className={`font-bold text-xs ${
                              isMe ? "text-emerald-300" : "text-blue-600"
                            }`}
                          >
                            {msg.senderUsername}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              isMe
                                ? "bg-black/30 text-gray-200"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {msg.senderRole}
                          </span>
                        </div>

                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>

                        <div
                          className={`flex items-center gap-1 mt-1 text-[10px] ${
                            isMe
                              ? "text-gray-200 justify-start"
                              : "text-gray-500 justify-end"
                          }`}
                        >
                          <span>
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : ""}
                          </span>
                          {isMe && (
                            <span className="text-[#53bdeb] font-bold text-xs">
                              ✓✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* MODAL REPLY INPUT */}
            {conversationTicket.status !== "Closed" && (
              <div className="p-4 bg-white/5 border-t border-white/10">
                <textarea
                  placeholder="Reply to agent..."
                  value={newMessage[conversationTicket.id] || ""}
                  onChange={(e) =>
                    setNewMessage((previous) => ({
                      ...previous,
                      [conversationTicket.id]: e.target.value,
                    }))
                  }
                  className="w-full h-20 p-3 rounded-lg text-black bg-white resize-none outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setConversationTicket(null)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => sendReply(conversationTicket.id)}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white text-sm font-medium transition"
                  >
                    💬 Send Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}

export default UserMainPage;