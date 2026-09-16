import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import UserMainPage from "./UserMainPage.jsx";
import AgentMainPage from "./AgentMainPage.jsx";
import AdminMainPage from "./AdminMainPage.jsx";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
       <Route path="/admin" element={<AdminMainPage />} />
        <Route path="/user" element={<UserMainPage />} />
       <Route path="/agent" element={<AgentMainPage />} />
      </Routes>
    </Router>
  );
}

export default App; 