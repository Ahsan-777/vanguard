// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom"; // 1. Import useNavigate

// export const ContactChat: React.FC = () => {
//   const navigate = useNavigate(); // 2. Initialize navigate hook
//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const [messages, setMessages] = useState<
//     Array<{ sender: "bot" | "user"; text: string; redirectUrl?: string }>
//   >([
//     {
//       sender: "bot",
//       text: "👋 Hi! Welcome to Vanguard Drive. How can I help you today?",
//     },
//   ]);
//   const [inputText, setInputText] = useState<string>("");

//   const handleSendMessage = async () => {
//     if (!inputText.trim()) return;

//     const userMsg = inputText.trim();
//     setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
//     setInputText("");

//     try {
//       const res = await fetch("http://localhost:5038/api/chat/reply", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: userMsg }),
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setMessages((prev) => [
//           ...prev,
//           { sender: "bot", text: data.text, redirectUrl: data.redirectUrl },
//         ]);
//       }
//     } catch (error) {
//       console.error("Chat API Error:", error);
//     }
//   };

//   return (
//     <div className="fixed bottom-6 right-6 z-50">
//       {!isOpen && (
//         <button
//           onClick={() => setIsOpen(true)}
//           className="bg-amber-600 text-white font-bold py-3.5 px-6 rounded-full shadow-2xl flex items-center gap-2"
//         >
//           <span>💬 Need Help?</span>
//         </button>
//       )}

//       {isOpen && (
//         <div className="w-80 sm:w-96 h-[450px] bg-gray-900 border border-slate-700 text-white rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden">
//           <div className="bg-amber-600 px-4 py-3 flex justify-between items-center font-bold">
//             <span className="text-sm">Vanguard Support</span>
//             <button onClick={() => setIsOpen(false)}>✕</button>
//           </div>

//           <div className="p-4 flex-1 overflow-y-auto text-xs sm:text-sm space-y-3 bg-black/40">
//             {messages.map((msg, idx) => (
//               <div
//                 key={idx}
//                 className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
//               >
//                 <div
//                   className={`max-w-[80%] p-3 rounded-2xl ${
//                     msg.sender === "user"
//                       ? "bg-amber-600 text-white"
//                       : "bg-slate-800 text-slate-200 border border-slate-700"
//                   }`}
//                 >
//                   <p>{msg.text}</p>

//                   {/* 3. Use navigate() on button click */}
//                   {msg.redirectUrl && (
//                     <button
//                       onClick={() => {
//                         navigate(msg.redirectUrl!);
//                         setIsOpen(false); // Close chat drawer after click
//                       }}
//                       className="mt-2.5 inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition shadow-sm cursor-pointer"
//                     >
//                       <span>🔍 View Filtered Inventory</span>
//                       <span>→</span>
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="p-3 border-t border-slate-800 bg-gray-900 flex gap-2">
//             <input
//               type="text"
//               placeholder="Ask about anything ..... "
//               value={inputText}
//               onChange={(e) => setInputText(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//               className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
//             />
//             <button
//               onClick={handleSendMessage}
//               className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate

// Dynamic API base URL supporting both local environment and Vercel/Railway production
const API_BASE_URL = 
  (import.meta as any).env.VITE_API_URL || "http://localhost:5038/api";

export const ContactChat: React.FC = () => {
  const navigate = useNavigate(); // 2. Initialize navigate hook
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<
    Array<{ sender: "bot" | "user"; text: string; redirectUrl?: string }>
  >([
    {
      sender: "bot",
      text: "👋 Hi! Welcome to Vanguard Drive. How can I help you today?",
    },
  ]);
  const [inputText, setInputText] = useState<string>("");

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInputText("");

    try {
      const res = await fetch(`${API_BASE_URL}/chat/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.text, redirectUrl: data.redirectUrl },
        ]);
      }
    } catch (error) {
      console.error("Chat API Error:", error);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-amber-600 text-white font-bold py-3.5 px-6 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer"
        >
          <span>💬 Need Help?</span>
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 h-[450px] bg-gray-900 border border-slate-700 text-white rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden">
          <div className="bg-amber-600 px-4 py-3 flex justify-between items-center font-bold">
            <span className="text-sm">Vanguard Support</span>
            <button onClick={() => setIsOpen(false)} className="cursor-pointer">✕</button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto text-xs sm:text-sm space-y-3 bg-black/40">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-amber-600 text-white"
                      : "bg-slate-800 text-slate-200 border border-slate-700"
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* 3. Use navigate() on button click */}
                  {msg.redirectUrl && (
                    <button
                      onClick={() => {
                        navigate(msg.redirectUrl!);
                        setIsOpen(false); // Close chat drawer after click
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition shadow-sm cursor-pointer"
                    >
                      <span>🔍 View Filtered Inventory</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-slate-800 bg-gray-900 flex gap-2">
            <input
              type="text"
              placeholder="Ask about anything ..... "
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactChat;