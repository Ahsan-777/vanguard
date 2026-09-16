const API_BASE_URL = "http://localhost:5091";

export const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No JWT token found in localStorage");
    alert("Your login session is missing. Please login again.");
    localStorage.clear();
    window.location.href = "/";
    throw new Error("No JWT token found");
  }

  // Create headers object
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    Authorization: `Bearer ${token}`,
  };

  // IF body is FormData, delete Content-Type so browser sets boundary automatically
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
    delete headers["content-type"];
  }

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
};
// const API_BASE_URL = "http://localhost:5091";

// export const authFetch = async (
//   url: string,
//   options: RequestInit = {}
// ): Promise<Response> => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     console.error("No JWT token found in localStorage");

//     alert("Your login session is missing. Please login again.");

//     localStorage.clear();

//     window.location.href = "/";

//     throw new Error("No JWT token found");
//   }

//   const headers = {
//     ...(options.headers || {}),
//     Authorization: `Bearer ${token}`,
//   };

//   return fetch(`${API_BASE_URL}${url}`, {
//     ...options,
//     headers,
//   });
// };