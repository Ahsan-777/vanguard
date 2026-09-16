import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate

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
      const res = await fetch("http://localhost:5038/api/chat/reply", {
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
          className="bg-amber-600 text-white font-bold py-3.5 px-6 rounded-full shadow-2xl flex items-center gap-2"
        >
          <span>💬 Need Help?</span>
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 h-[450px] bg-gray-900 border border-slate-700 text-white rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden">
          <div className="bg-amber-600 px-4 py-3 flex justify-between items-center font-bold">
            <span className="text-sm">Vanguard Support</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
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
              className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
// import React, { useState } from "react";

// export const ContactChat: React.FC = () => {
//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const [messages, setMessages] = useState<Array<{ sender: "bot" | "user"; text: string }>>([
//     {
//       sender: "bot",
//       text: "👋 Hi! Welcome to Vanguard Drive. Do you need any help?",
//     },
//   ]);
//   const [inputText, setInputText] = useState<string>("");

//  const handleSendMessage = async () => {
//   if (!inputText.trim()) return;

//   const userMsg = inputText.trim();
//   setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
//   setInputText("");

//   try {
//     const res = await fetch("http://localhost:5038/api/chat/reply", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message: userMsg }),
//     });

//     if (res.ok) {
//       const data = await res.json();
//       setMessages((prev) => [...prev, { sender: "bot", text: data.text }]);
//     } else {
//       setMessages((prev) => [
//         ...prev,
//         { sender: "bot", text: "Thank you for reaching out! A representative will assist you shortly." },
//       ]);
//     }
//   } catch (error) {
//     console.error("Chat API Error:", error);
//   }
// };
//   return (
//     <div className="fixed bottom-6 right-6 z-50">
//       {/* 1. Floating Contact Us Button */}
//       {!isOpen && (
//         <button
//           onClick={() => setIsOpen(true)}
//           className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-full shadow-2xl shadow-amber-600/40 flex items-center gap-2.5 transition-all transform hover:scale-105 cursor-pointer border border-amber-400/30"
//         >
//           <span className="text-lg">💬</span>
//           <span className="text-sm tracking-wide">Need Help?</span>
//         </button>
//       )}

//       {/* 2. Chat Box Popup Window */}
//       {isOpen && (
//         <div className="w-80 sm:w-96 h-[450px] bg-gray-900 border border-slate-700/80 text-white rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden backdrop-blur-md">
//           {/* Header */}
//           <div className="bg-amber-600 px-4 py-3.5 flex justify-between items-center font-bold shadow-md">
//             <div className="flex items-center gap-2">
//               <span className="text-xl">🚘</span>
//               <div>
//                 <h3 className="text-sm font-extrabold leading-none">Vanguard Support</h3>
//                 <span className="text-[10px] text-amber-200 font-normal">Online Assistant</span>
//               </div>
//             </div>
//             <button
//               onClick={() => setIsOpen(false)}
//               className="text-white hover:text-gray-200 font-bold text-lg p-1 transition cursor-pointer"
//             >
//               ✕
//             </button>
//           </div>

//           {/* Messages Container */}
//           <div className="p-4 flex-1 overflow-y-auto text-sm space-y-3 bg-black/40">
//             {messages.map((msg, idx) => (
//               <div
//                 key={idx}
//                 className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
//               >
//                 <div
//                   className={`max-w-[80%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
//                     msg.sender === "user"
//                       ? "bg-amber-600 text-white rounded-br-none shadow-md"
//                       : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none shadow-md"
//                   }`}
//                 >
//                   {msg.text}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Input Field */}
//           <div className="p-3 border-t border-slate-800 bg-gray-900 flex gap-2 items-center">
//             <input
//               type="text"
//               placeholder="Ask about location or family cars..."
//               value={inputText}
//               onChange={(e) => setInputText(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
//               className="flex-1 bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500 placeholder-slate-400"
//             />
//             <button
//               onClick={handleSendMessage}
//               className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-md shadow-amber-600/20 cursor-pointer"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

