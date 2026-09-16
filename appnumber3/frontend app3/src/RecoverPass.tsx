// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// function RecoverPass() {
//   const navigate = useNavigate();

//   // Step 1: Request OTP via Username | Step 2: Verify OTP | Step 3: Set New Password
//   const [step, setStep] = useState<1 | 2 | 3>(1);

//   // Form Fields
//   const [username, setUsername] = useState<string>("");
//   const [otp, setOtp] = useState<string>("");
//   const [newPassword, setNewPassword] = useState<string>("");
//   const [confirmPassword, setConfirmPassword] = useState<string>("");

//   // UI States
//   const [showPassword, setShowPassword] = useState<boolean>(false);
//   const [errorMessage, setErrorMessage] = useState<string>("");
//   const [successMessage, setSuccessMessage] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);

//   // STEP 1: Send OTP to email fetched via Username
//   const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setErrorMessage("");
//     setSuccessMessage("");
//     setLoading(true);

//     try {
//       const response = await fetch("http://localhost:5038/api/auth/forgot-password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username: username.trim() }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setErrorMessage(data.message || "Failed to send OTP.");
//         return;
//       }

//       setSuccessMessage(data.message || "OTP code sent to your registered email!");
//       setStep(2); // Move to OTP verification step
//     } catch (err) {
//       setErrorMessage("Unable to connect to backend server.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // STEP 2: Verify OTP
//   const handleVerifyOtp = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setErrorMessage("");
//     setSuccessMessage("");

//     if (!otp.trim() || otp.trim().length < 6) {
//       setErrorMessage("Please enter a valid 6-digit OTP code.");
//       return;
//     }

//     setSuccessMessage("OTP verified! Please enter your new password below.");
//     setStep(3); // Proceed to Set New Password
//   };

//   // STEP 3: Submit New Password
//   const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setErrorMessage("");
//     setSuccessMessage("");

//     if (newPassword !== confirmPassword) {
//       setErrorMessage("Passwords do not match.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch("http://localhost:5038/api/auth/reset-password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: username.trim(),
//           otp: otp.trim(),
//           newPassword: newPassword,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setErrorMessage(data.message || "Invalid or expired OTP code.");
//         setStep(2); // Go back to OTP input if verification fails
//         return;
//       }

//       alert("Password updated successfully! Please login with your new password.");
//       navigate("/login");
//     } catch (err) {
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

//       {/* Recover Password Box */}
//       <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-700/60">
//         {/* Header */}
//         <div className="text-center mb-6">
//           <h1 className="text-2xl font-bold text-white tracking-wide">
//             Recover Password
//           </h1>
//           <p className="text-slate-400 text-sm mt-1">
//             {step === 1 && "Enter your username to receive an OTP on your registered email"}
//             {step === 2 && "Enter the 6-digit OTP code sent to your email"}
//             {step === 3 && "Set up a new password for your account"}
//           </p>
//         </div>

//         {/* Alerts */}
//         {errorMessage && (
//           <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-200 text-xs rounded-xl text-center">
//             {errorMessage}
//           </div>
//         )}
//         {successMessage && (
//           <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl text-center">
//             {successMessage}
//           </div>
//         )}

//         {/* STEP 1: Enter Username & Send OTP */}
//         {step === 1 && (
//           <form onSubmit={handleRequestOtp}>
//             <div className="mb-6 text-left">
//               <label className="block text-sm font-semibold text-slate-200 mb-2">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 required
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 placeholder="Enter your username"
//                 className="w-full h-11 border border-slate-700 rounded-xl px-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white bg-slate-800/90 transition"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full h-11 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
//             >
//               {loading ? "Sending OTP..." : "Send OTP"}
//             </button>
//           </form>
//         )}

//         {/* STEP 2: Enter & Verify OTP */}
//         {step === 2 && (
//           <form onSubmit={handleVerifyOtp}>
//             <div className="mb-6 text-left">
//               <label className="block text-sm font-semibold text-slate-200 mb-2">
//                 Enter OTP Code
//               </label>
//               <input
//                 type="text"
//                 required
//                 maxLength={6}
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//                 placeholder="Enter 6-digit OTP code"
//                 className="w-full h-11 border border-slate-700 rounded-xl px-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white bg-slate-800/90 transition text-center tracking-widest text-lg font-mono"
//               />
//             </div>

//             <button
//               type="submit"
//               className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
//             >
//               Verify OTP
//             </button>

//             <button
//               type="button"
//               onClick={() => setStep(1)}
//               className="w-full mt-3 text-xs text-slate-400 hover:text-white transition cursor-pointer"
//             >
//               Change Username
//             </button>
//           </form>
//         )}

//         {/* STEP 3: Enter New Password */}
//         {step === 3 && (
//           <form onSubmit={handleResetPassword}>
//             {/* New Password */}
//             <div className="mb-4 text-left">
//               <label className="block text-sm font-semibold text-slate-200 mb-2">
//                 New Password
//               </label>
//               <div className="relative flex items-center">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   required
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   placeholder="Enter new password"
//                   className="w-full h-11 border border-slate-700 rounded-xl pl-4 pr-12 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white bg-slate-800/90 transition"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 text-slate-400 hover:text-white transition cursor-pointer"
//                 >
//                   {showPassword ? "🙈" : "👁️"}
//                 </button>
//               </div>
//             </div>

//             {/* Confirm Password */}
//             <div className="mb-6 text-left">
//               <label className="block text-sm font-semibold text-slate-200 mb-2">
//                 Confirm New Password
//               </label>
//               <input
//                 type="password"
//                 required
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 placeholder="Confirm new password"
//                 className="w-full h-11 border border-slate-700 rounded-xl px-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white bg-slate-800/90 transition"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full h-11 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
//             >
//               {loading ? "Updating Password..." : "Update Password"}
//             </button>
//           </form>
//         )}

//         {/* Back to Login Link */}
//         <div className="text-center mt-6">
//           <button
//             type="button"
//             onClick={() => navigate("/login")}
//             className="text-slate-400 hover:text-purple-400 text-sm transition cursor-pointer"
//           >
//             Remembered your password? <span className="underline">Sign In</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default RecoverPass;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Dynamic API base URL supporting both local environment and Vercel/Railway production
const API_BASE_URL = 
  (import.meta as any).env.VITE_API_URL || "http://localhost:5038/api";

function RecoverPass() {
  const navigate = useNavigate();

  // Step 1: Request OTP via Username | Step 2: Verify OTP | Step 3: Set New Password
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [username, setUsername] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // UI States
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // STEP 1: Send OTP to email fetched via Username
  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to send OTP.");
        return;
      }

      setSuccessMessage(data.message || "OTP code sent to your registered email!");
      setStep(2); // Move to OTP verification step
    } catch (err) {
      setErrorMessage("Unable to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!otp.trim() || otp.trim().length < 6) {
      setErrorMessage("Please enter a valid 6-digit OTP code.");
      return;
    }

    setSuccessMessage("OTP verified! Please enter your new password below.");
    setStep(3); // Proceed to Set New Password
  };

  // STEP 3: Submit New Password
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          otp: otp.trim(),
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Invalid or expired OTP code.");
        setStep(2); // Go back to OTP input if verification fails
        return;
      }

      alert("Password updated successfully! Please login with your new password.");
      navigate("/login");
    } catch (err) {
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

      {/* Recover Password Box */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-700/60">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Recover Password
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {step === 1 && "Enter your username to receive an OTP on your registered email"}
            {step === 2 && "Enter the 6-digit OTP code sent to your email"}
            {step === 3 && "Set up a new password for your account"}
          </p>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-200 text-xs rounded-xl text-center">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl text-center">
            {successMessage}
          </div>
        )}

        {/* STEP 1: Enter Username & Send OTP */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <div className="mb-6 text-left">
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full h-11 border border-slate-700 rounded-xl px-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white bg-slate-800/90 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2: Enter & Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-6 text-left">
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Enter OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP code"
                className="w-full h-11 border border-slate-700 rounded-xl px-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white bg-slate-800/90 transition text-center tracking-widest text-lg font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
            >
              Verify OTP
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full mt-3 text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              Change Username
            </button>
          </form>
        )}

        {/* STEP 3: Enter New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            {/* New Password */}
            <div className="mb-4 text-left">
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                New Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
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

            {/* Confirm Password */}
            <div className="mb-6 text-left">
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full h-11 border border-slate-700 rounded-xl px-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white bg-slate-800/90 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-slate-400 hover:text-purple-400 text-sm transition cursor-pointer"
          >
            Remembered your password? <span className="underline">Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecoverPass;