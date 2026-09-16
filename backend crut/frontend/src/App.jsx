import { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login";
import Settings from "./Settings";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation
} from "react-router-dom";

import {
  getStudentsAPI,
  getUsersAPI,
  getActiveUsersAPI,
  addStudentAPI,
  deleteStudentAPI,
  deleteAllStudentsAPI,
  editStudentAPI,
  logoutUser
} from "./services/appService";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // =========================
  // STATES
  // =========================

  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const [activeUsers, setActiveUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const [deleteId, setDeleteId] = useState("");

  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");

  // =========================
  // GET STUDENTS
  // =========================

  const getStudent = async () => {
    if (!userData?.username) return;

    try {
      const data = await getStudentsAPI(userData.username);
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(
        "Error getting students:",
        error.response?.data || error.message
      );
      setStudents([]);
    }
  };

  // =========================
  // GET USERS
  // =========================

  const getUsers = async () => {
    try {
      const data = await getUsersAPI();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(
        "Error getting users:",
        error.response?.data || error.message
      );
      setUsers([]);
    }
  };

  // =========================
  // GET ACTIVE USERS
  // =========================

  const getActiveUsers = async () => {
    if (!userData?.username) return;

    try {
      const data = await getActiveUsersAPI(userData.username);
      setActiveUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(
        "Error getting active users:",
        error.response?.data || error.message
      );
      setActiveUsers([]);
    }
  };

  // =========================
  // ADD STUDENT
  // =========================

  const addStudent = async () => {
    if (!name || !age) {
      alert("Please enter both name and age");
      return;
    }

    if (!userData?.username) {
      alert("User is not logged in");
      return;
    }

    const student = {
      name: name,
      age: Number(age),
      username: userData.username
    };

    try {
      await addStudentAPI(student);

      setName("");
      setAge("");

      await getStudent();
    } catch (error) {
      console.error(
        "Error adding student:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // DELETE STUDENT
  // =========================

  const deleteStudent = async (id) => {
    if (!id) {
      alert("Please enter student ID");
      return;
    }

    if (!userData?.username) return;

    try {
      await deleteStudentAPI(id, userData.username);

      setDeleteId("");

      await getStudent();
    } catch (error) {
      console.error(
        "Error deleting student:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // DELETE ALL STUDENTS
  // =========================

  const deleteAllStudents = async () => {
    if (!userData?.username) return;

    try {
      await deleteAllStudentsAPI(userData.username);

      await getStudent();
    } catch (error) {
      alert(
        error.response?.data ||
          error.message ||
          "Failed to delete all students"
      );
    }
  };

  // =========================
  // EDIT STUDENT
  // =========================

  const editStudent = async () => {
    if (!editId) {
      alert("Please enter student ID");
      return;
    }

    if (!editName || !editAge) {
      alert("Please enter new name and age");
      return;
    }

    if (!userData?.username) return;

    const updatedStudent = {
      name: editName,
      age: Number(editAge)
    };

    try {
      const data = await editStudentAPI(
        editId,
        updatedStudent,
        userData.username
      );

      alert(data?.message || "Student updated successfully");

      setEditId("");
      setEditName("");
      setEditAge("");

      await getStudent();
    } catch (error) {
      alert(
        error.response?.data ||
          error.message ||
          "Failed to update student"
      );
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
  try {
    await logoutUser();
  } catch (error) {
    console.log(
      "Logout Error:",
      error.response?.data || error.message
    );
  }

  localStorage.removeItem("token");

  setLoggedIn(false);
  setUserData(null);

  setName("");
  setAge("");
  setDeleteId("");

  setEditId("");
  setEditName("");
  setEditAge("");

  setStudents([]);
  setUsers([]);
  setActiveUsers([]);

  navigate("/");
};

  // =========================
  // LOGIN / USER EFFECT
  // =========================

useEffect(() => {
  if (loggedIn && userData?.username) {
    getStudent();
    getUsers();

    if (userData.username.toLowerCase() === "admin") {
      getActiveUsers();
    }
  }
}, [loggedIn, userData]);

  // =========================
  // DROPDOWN
  // =========================

  const handleDropdownChange = (e) => {
    const value = e.target.value;

    if (value === "admin") {
      getActiveUsers();
      navigate("/admin");
    } else if (value === "setting") {
      navigate("/settings");
    } else if (value === "profile") {
      navigate("/profile");
    } else {
      navigate("/home");
    }
  };

  // =========================
  // LOGIN ROUTE
  // =========================

  if (location.pathname === "/" && !loggedIn) {
    return (
      <Login
        onLoginSuccess={(user) => {
          setUserData(user);
          setLoggedIn(true);
          navigate("/home");
        }}
      />
    );
  }

  // =========================
  // IF NOT LOGGED IN
  // =========================

  if (!loggedIn) {
    return (
      <Login
        onLoginSuccess={(user) => {
          setUserData(user);
          setLoggedIn(true);
          navigate("/home");
        }}
      />
    );
  }

  // =========================
  // SETTINGS PAGE
  // =========================

  if (location.pathname === "/settings") {
    return (
      <Settings
        userData={userData}
        users={users}
        onSave={(updatedUser) => {
          setUserData(updatedUser);
          navigate("/home");
        }}
        onBack={() => navigate("/home")}
      />
    );
  }

  // =========================
  // ADMIN PAGE
  // =========================

  if (location.pathname === "/admin") {
    return (
      <div className="p-5">
        <h2>Currently Logged In Users</h2>

        <table
          border="1"
          className="w-[50%] my-5 mx-auto text-center border-collapse border border-gray-400"
        >
          <thead>
            <tr>
              <th className="border border-gray-400 p-2">
                Username
              </th>
            </tr>
          </thead>

          <tbody>
            {activeUsers.map((username, index) => (
              <tr key={username || index}>
                <td className="border border-gray-400 p-2">
                  {username}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <br />

        <button
          className="px-3 py-1 border border-black cursor-pointer"
          onClick={() => navigate("/home")}
        >
          Back
        </button>
      </div>
    );
  }

  // =========================
  // PROFILE PAGE
  // =========================

  if (location.pathname === "/profile") {
    return (
      <div className="p-5">
        <select
          className="fixed top-[15px] left-[10%] z-[9999] bg-[#007bff] text-white px-3 py-1.5 border-none rounded-[5px] cursor-pointer"
          value="profile"
          onChange={handleDropdownChange}
        >
          <option value="home">HOME</option>
          <option value="setting">Setting</option>
          <option value="profile">Profile</option>

          {userData?.username?.toLowerCase() === "admin" && (
            <option value="admin">Admin Users</option>
          )}
        </select>

        <h2>User Profile</h2>

        <div className="border border-[#ccc] p-5 rounded-[8px] w-[280px] my-5 mx-auto">
          <p>
            <strong>Username:</strong>{" "}
            {userData?.username}
          </p>

          <p>
            <strong>Password:</strong>{" "}
            {userData?.password}
          </p>

          <p>
            <strong>Department:</strong>{" "}
            {userData?.department?.toUpperCase()}
          </p>
        </div>

        <br />

        <button
          className="w-[40%] h-[30px] border-0 text-black bg-[rgb(164,0,159)] cursor-pointer"
          onClick={() => navigate("/home")}
        >
          Back to Students
        </button>
      </div>
    );
  }

  // =========================
  // HOME / STUDENT PAGE
  // =========================

  return (
    <div className="relative">

      {/* NAVIGATION */}

      <select
        className="fixed top-[15px] left-[10%] z-[9999] bg-[#007bff] text-white px-3 py-1.5 border-none rounded-[5px] cursor-pointer"
        value="home"
        onChange={handleDropdownChange}
      >
        <option value="home">HOME</option>
        <option value="setting">Setting</option>
        <option value="profile">Profile</option>

        {userData?.username?.toLowerCase() === "admin" && (
          <option value="admin">Admin Users</option>
        )}
      </select>

      {/* STUDENT INPUT */}

      <h2>Student Management</h2>

      <input
        className="border border-gray-400 px-2 py-1 mx-1"
        type="text"
        placeholder="Enter student name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border border-gray-400 px-2 py-1 mx-1"
        type="number"
        placeholder="Enter student age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />

      <button
        className="px-3 py-1 border border-black cursor-pointer mx-1"
        onClick={addStudent}
      >
        Add Student
      </button>

      {/* STUDENTS TABLE */}

      <h2>Students</h2>

      <div className="w-[50%] text-center my-5 mx-auto">
        <table
          border="1"
          className="w-full border-collapse border border-gray-400"
        >
          <thead>
            <tr>
              <th className="border border-gray-400 p-2">
                ID
              </th>

              <th className="border border-gray-400 p-2">
                Name
              </th>

              <th className="border border-gray-400 p-2">
                Age
              </th>

              <th className="border border-gray-400 p-2">
                Entered by
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((student, idx) => (
              <tr key={student.id || idx}>
                <td className="border border-gray-400 p-2">
                  {student.id}
                </td>

                <td className="border border-gray-400 p-2">
                  {student.name}
                </td>

                <td className="border border-gray-400 p-2">
                  {student.age}
                </td>

                <td className="border border-gray-400 p-2">
                  {student.username}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DELETE */}

      <h3>Actions</h3>

      <input
        className="border border-gray-400 px-2 py-1 my-1"
        type="number"
        placeholder="Enter ID to delete"
        value={deleteId}
        onChange={(e) => setDeleteId(e.target.value)}
      />

      <div className="mt-2">
        <button
          className="px-3 py-1 border border-black cursor-pointer my-1"
          onClick={() => deleteStudent(deleteId)}
        >
          Delete Student
        </button>
      </div>

      <button
        className="px-3 py-1 border border-black cursor-pointer my-1"
        onClick={deleteAllStudents}
      >
        Delete All
      </button>

      {/* EDIT */}

      <h3>Edit Student</h3>

      <input
        className="border border-gray-400 px-2 py-1 mx-1 my-1"
        type="number"
        placeholder="Enter ID"
        value={editId}
        onChange={(e) => setEditId(e.target.value)}
      />

      <input
        className="border border-gray-400 px-2 py-1 mx-1 my-1"
        type="text"
        placeholder="Enter new name"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
      />

      <input
        className="border border-gray-400 px-2 py-1 mx-1 my-1"
        type="number"
        placeholder="Enter new age"
        value={editAge}
        onChange={(e) => setEditAge(e.target.value)}
      />

      <button
        className="px-3 py-1 border border-black cursor-pointer mx-1"
        onClick={editStudent}
      >
        Edit Student
      </button>

      {/* LOGOUT */}

      <br />
      <br />

      <div>
        <button
          className="w-[10%] z-[9999] bg-[#007bff] text-white px-3 py-1.5 border-none rounded-[5px] cursor-pointer"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* ADMIN ACTIVE USERS */}

      {userData?.username?.toLowerCase() === "admin" && (
        <div className="border border-[#ccc] p-[15px] w-1/2 h-[10%] my-[10px] mx-[25%] rounded-[8px]">
          <h3>Currently Active Users</h3>

          {activeUsers.length === 0 ? (
            <p>No users currently active.</p>
          ) : (
            <ul>
              {activeUsers.map((userItem, index) => (
                <li key={index}>
                  {userItem}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// =========================
// ROUTER
// =========================

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;