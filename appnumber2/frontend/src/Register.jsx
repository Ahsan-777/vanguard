import { useState } from "react";
import logo from "./assets/logo.jpeg";
function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username) {
      alert("Username is required");
      return;
    }

    if (!password) {
      alert("Password is required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5091/Auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully!");

        window.location.href = "/";
      } else {
        alert(data.message || "Registration failed");
      }

    } catch (error) {
      console.error("Registration error:", error);
      alert("Server error. Is the backend running?");
    }
  };

  return (
    <div
        className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center relative "
        style={{ backgroundImage: `url(${logo})` }}
      >
<div className="absolute inset-0 bg-black/40"></div>

    {/* Login box */} 
     <div className="relative z-10 w-full max-w-md backdrop-blur-lg rounded-2xl shadow-2xl p-15  border border-gray-800">

      <h1 className="relative z-10 text-xl md:text-2xl font-bold text-white  font-heading mb-8" >Create New Account</h1>

      <form onSubmit={handleRegister}>

        {/* Username */}
        <div>
          <label>Username</label>
          {" : "}

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full h-11 border border-gray-600 rounded-lg px-4 bg-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-white"
          />
        </div>

        <br />

        {/* Password */}
        <div>
          <label>Password</label>
          {" : "}
        <div className="flex">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
                className="flex-1 h-11 border border-gray-600 rounded-l-lg px-4 outline-none bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-white"
          />

          <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="h-11 px-4 border border-l-0 border-gray-600 bg-gray-800  rounded-r-lg backdrop-blur-md hover:bg-gray-200"
            >
              👁️
            </button>
            </div>
        </div>

        <br />

        {/* Confirm Password */}
        <div>
          <label>Confirm Password</label>
          {" : "}

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full h-11 border border-gray-600 rounded-lg px-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-white bg-gray-800 "
          />
        </div>

        <br />

        <button type="submit" className="w-full h-11 bg-purple-600 hover:bg-purple-800 text-white font-semibold rounded-lg transition duration-200" >
          Create Account
        </button>

        <br />
        <br />

        <a className="text-gray-500 hover:text-blue-600 text-sm ml-[20%]" href="/">
          Already have an account? Login
        </a>


      </form>
</div>
    </div>
  );
}

export default Register;