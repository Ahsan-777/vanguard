// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// type RegisterResponse = {
//   message?: string;
//   errors?: Record<string, string[]>;
// };

// function Register2() {
//   const navigate = useNavigate();
//   const [username, setUsername] = useState<string>("");
//   const [email, setEmail] = useState<string>(""); // <-- Email state added
//   const [password, setPassword] = useState<string>("");
//   const [confirmPassword, setConfirmPassword] = useState<string>("");
//   const [showPassword, setShowPassword] = useState<boolean>(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
//   const [errorMessage, setErrorMessage] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);

//   const handleRegister = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
//     e.preventDefault();
//     setErrorMessage("");

//     if (password !== confirmPassword) {
//       setErrorMessage("Passwords do not match.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch("http://localhost:5038/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: username.trim(),
//           email: email.trim(), // <-- Email included in request
//           password: password,
//         }),
//       });

//       const data: RegisterResponse = await response.json();

//       if (!response.ok) {
//         const errorText =
//           data.message ||
//           (data.errors ? Object.values(data.errors).flat().join(" ") : "Registration failed.");
//         setErrorMessage(errorText);
//         return;
//       }

//       alert("Buyer account created successfully!");
//       navigate("/login");
//     } catch (err: unknown) {
//       setErrorMessage("Unable to connect to backend server.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="relative min-h-screen w-screen flex flex-col items-center justify-center px-4 overflow-hidden text-white">
//       {/* Background Image */}
//       <img
//         src="/_ (2).jpeg"
//         alt="Background"
//         className="absolute inset-0 w-full h-full object-cover -z-20"
//       />

//       {/* Dark Blur Overlay */}
//       <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm -z-10" />

//       {/* Registration Box */}
//       <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-700/60">
//         {/* Header */}
//         <div className="text-center mb-6">
//           <h1 className="text-2xl font-bold text-white tracking-wide">
//             Create an Account
//           </h1>
//           <p className="text-slate-400 text-sm mt-1">
//             Join Vanguard Drive as a Buyer
//           </p>
//         </div>

//         {/* Error Message Alert */}
//         {errorMessage && (
//           <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-200 text-xs rounded-xl text-center">
//             {errorMessage}
//           </div>
//         )}

//         <form onSubmit={handleRegister}>
//           {/* Username Field */}
//           <div className="mb-4 text-left">
//             <label className="block text-sm font-semibold text-slate-200 mb-2">
//               Username
//             </label>
//             <input
//               type="text"
//               required
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               placeholder="Choose a username"
//               className="w-full h-11 border border-slate-700 rounded-xl px-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white bg-slate-800/90 transition"
//             />
//           </div>

//           {/* Email Field (Added) */}
//           <div className="mb-4 text-left">
//             <label className="block text-sm font-semibold text-slate-200 mb-2">
//               Email Address
//             </label>
//             <input
//               type="email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter your email"
//               className="w-full h-11 border border-slate-700 rounded-xl px-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white bg-slate-800/90 transition"
//             />
//           </div>

//           {/* Password Field */}
//           <div className="mb-4 text-left">
//             <label className="block text-sm font-semibold text-slate-200 mb-2">
//               Password
//             </label>
//             <div className="relative flex items-center">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Create password"
//                 className="w-full h-11 border border-slate-700 rounded-xl pl-4 pr-12 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white bg-slate-800/90 transition"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 text-slate-400 hover:text-white transition cursor-pointer"
//               >
//                 {showPassword ? "🙈" : "👁️"}
//               </button>
//             </div>
//           </div>

//           {/* Confirm Password Field */}
//           <div className="mb-6 text-left">
//             <label className="block text-sm font-semibold text-slate-200 mb-2">
//               Confirm Password
//             </label>
//             <div className="relative flex items-center">
//               <input
//                 type={showConfirmPassword ? "text" : "password"}
//                 required
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 placeholder="Confirm password"
//                 className="w-full h-11 border border-slate-700 rounded-xl pl-4 pr-12 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white bg-slate-800/90 transition"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 className="absolute right-3 text-slate-400 hover:text-white transition cursor-pointer"
//               >
//                 {showConfirmPassword ? "🙈" : "👁️"}
//               </button>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full h-11 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
//           >
//             {loading ? "Creating Account..." : "Create Account"}
//           </button>

//           {/* Login Link */}
//           <div className="text-center mt-6">
//             <button
//               type="button"
//               onClick={() => navigate("/login")}
//               className="text-slate-400 hover:text-purple-400 text-sm transition cursor-pointer"
//             >
//               Already have an account? <span className="underline">Sign In</span>
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Register2;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Dynamic API base URL supporting both local environment and Vercel/Railway production
const API_BASE_URL = 
  (import.meta as any).env.VITE_API_URL || "http://localhost:5038/api";

type RegisterResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

function Register2() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const data: RegisterResponse = await response.json();

      if (!response.ok) {
        const errorText =
          data.message ||
          (data.errors ? Object.values(data.errors).flat().join(" ") : "Registration failed.");
        setErrorMessage(errorText);
        return;
      }

      alert("Buyer account created successfully!");
      navigate("/login");
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

      {/* Registration Box */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-700/60">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Create an Account
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Join Vanguard Drive as a Buyer
          </p>
        </div>

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-200 text-xs rounded-xl text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* Username Field */}
          <div className="mb-4 text-left">
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full h-11 border border-slate-700 rounded-xl px-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white bg-slate-800/90 transition"
            />
          </div>

          {/* Email Field */}
          <div className="mb-4 text-left">
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full h-11 border border-slate-700 rounded-xl px-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white bg-slate-800/90 transition"
            />
          </div>

          {/* Password Field */}
          <div className="mb-4 text-left">
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
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

          {/* Confirm Password Field */}
          <div className="mb-6 text-left">
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full h-11 border border-slate-700 rounded-xl pl-4 pr-12 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white bg-slate-800/90 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-slate-400 hover:text-white transition cursor-pointer"
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Login Link */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-slate-400 hover:text-purple-400 text-sm transition cursor-pointer"
            >
              Already have an account? <span className="underline">Sign In</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register2;