import React from "react";
import { useNavigate } from "react-router-dom";

function Intro2() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black flex flex-col items-center justify-center text-white overflow-hidden z-10">
      
      {/* Background Video Force Fullscreen */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src="/bg-video.mp4"
        className="absolute inset-0 w-full h-full object-cover -z-20"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 w-full h-full -z-10" />
    <nav className="fixed top-0 w-full text-center px-8 py-5 bg-black/40 backdrop-blur-lg border-b border-white/10 ">
        <h1 className="text-2xl font-extrabold tracking-wider text-gray-200 uppercase ">
          Vanguard Drive
        </h1>
      </nav>
      {/* Content Container */}
      <div className=" pr-[50%] pt-[30%]">
        <h1 className="text-4xl font-bold mb-4 font-bold">Exceptional Cars. Seamless Experience.</h1>
        <p className="text-lg mb-8">Browse our certified inventory and take the wheel of your next dream car today.</p>
      <nav className="relative z-10 px-4 max-w-2xl flex flex-col text-center">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-600/30 transition cursor-pointer"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/explore")}
            className="w-full py-3 px-6 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-gray-200 rounded-xl font-semibold transition backdrop-blur-md cursor-pointer"
          >
            Explore Cars
          </button>
        </div>
      </nav>
      </div>
    </div>
  );
}

export default Intro2;