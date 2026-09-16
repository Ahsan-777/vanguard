import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type LoginResponse = {
  username: string;
  role: string;
  id?: string | number;
  token?: string;
  message?: string;
};

function Login2() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      // Connects to ASP.NET Core API
      const response = await fetch("http://localhost:5038/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Invalid username or password.");
        return;
      }

      // Store complete user session info
      localStorage.setItem("username", data.username);
      localStorage.setItem("userRole", data.role);
      if (data.id) {
        localStorage.setItem("userId", String(data.id));
      }
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Route based on role returned from database
      const userRole = data.role?.toLowerCase();

      switch (userRole) {
        case "admin":
          navigate("/admin");
          break;
        case "accountant":
          navigate("/accountant");
          break;
        case "inventory":
        case "inventorymanager":
          navigate("/inventory");
          break;
        case "pos":
          // Navigates to POS route
          navigate("/pos");
          break;

        case "buyer":
        default:
          navigate("/buyer");
          break;
          
      }
    } catch (err: unknown) {
      setErrorMessage("Unable to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen flex flex-col items-center justify-center px-4 overflow-hidden text-white">
      {/* Background Image */}
      <img
        src="/_ (2).jpeg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover -z-20"
      />

      {/* Dark Blur Overlay */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm -z-10" />

      {/* Login Box */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-700/60">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase">
            Vanguard Drive
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Sign in to access your account
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-200 text-xs rounded-xl text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Username */}
          <div className="mb-5 text-left">
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Username"
              className="w-full h-11 border border-slate-700 rounded-xl px-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white bg-slate-800/90 transition"
            />
          </div>

          {/* Password */}
          <div className="mb-6 text-left">
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-11 border border-slate-700 rounded-xl pl-4 pr-12 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white bg-slate-800/90 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Register Link */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-slate-400 hover:text-purple-400 text-sm transition cursor-pointer"
            >
              Don't have an account?{" "}
              <span className="underline">Register as Buyer</span>
            </button>
          </div>
          <div className="text-center ">
            <button
              type="button"
              onClick={() => navigate("/RecoverPass")}
              className="text-slate-400 hover:text-purple-400 text-sm transition cursor-pointer"
            >
              Forget Password?{" "}
              {/* <span className="underline">Register as Buyer</span> */}
            </button>
          </div>
        </form>

        <button
          onClick={() => navigate("/explore")}
          className="w-full mt-2 py-3 px-6 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-gray-200 rounded-xl font-semibold transition backdrop-blur-md cursor-pointer text-sm"
        >
          Explore Cars Without Login
        </button>
      </div>
    </div>
  );
}

export default Login2;