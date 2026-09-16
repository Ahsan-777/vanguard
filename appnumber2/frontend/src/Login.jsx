import { useState } from "react";
import "./App.css";
import logo from "./assets/logo.jpeg";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Email/Username is required");
      return;
    }

    if (!password) {
      alert("Password is required");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5091/Auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // Save JWT and user details
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      alert("Login Successful!");

      const role = data.role?.toLowerCase();

      if (role === "admin") {
        window.location.href = "/admin";
      } else if (role === "agent") {
        window.location.href = "/agent";
      } else {
        window.location.href = "/user";
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Could not connect to backend. Is dotnet running?");
    }
  };
return (
  <div
    className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center relative "
    style={{ backgroundImage: `url(${logo})` }}
  >
  
    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/40"></div>

    {/* Login box */}
    <div className="relative z-10 w-full max-w-md backdrop-blur-lg rounded-2xl shadow-2xl p-15  border border-gray-800">
      <h1 className="relative z-10 text-xl md:text-2xl font-bold text-white  font-heading">
     Wellcome Back
    </h1>
    <p className="text-gray-400">Sign in to access your account</p>
      <h1 className="text-3xl font-bold text-center  text-gray-600 mt-8 mb-18">
       <hr />
      </h1>

      <form onSubmit={handleLogin}>

        {/* Username */}
        <div className="mb-5 w-[100%] lg:w-[100%]">
          <label className="block text-sm font-semibold text-gray-100 mb-2 ">
            Username 
          </label>

          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter Email / Username"
            className="w-full h-11 border border-gray-600 rounded-lg px-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-white bg-gray-800"
          />
        </div>

        {/* Password */}
        <div className="mb-5  h-32 transition-all">
          <label className="block text-sm font-semibold text-gray-100 mb-2">
            Password
          </label>

          <div className="flex">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="flex-1 h-11 border border-gray-600 rounded-l-lg px-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-white bg-gray-800"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="h-11 bg-transparent  px-4 sm:border lg:border border-l-0 lg:border-gray-600 sm:border-gray-600 rounded-r-lg backdrop-blur-md hover:bg-gray-200 lg:bg-gray-800 md:bg-gray-800 sm:bg-gray-800"
            >
              👁️
            </button>
          </div>
        </div>

        {/* Login button */}
        <button
          type="submit"
          className="w-full h-11 bg-purple-600 hover:bg-purple-800 text-white font-semibold rounded-lg transition duration-200"
        >
          Login
        </button>

        {/* Register */}
        <div className="text-center mt-6">
          <a
            href="/register"
            className="text-gray-500 hover:text-blue-600 text-sm"
          >
            Don't have an account? Register
          </a>
        </div>

      </form>
    </div>

    {/* Page title */}
      <h1 className="relative z-10 text-xl md:text-2xl font-bold text-purple-700 text-center font-heading mt-5">
      Mini Helpdesk
    </h1>
  </div>
);
 }

export default Login;