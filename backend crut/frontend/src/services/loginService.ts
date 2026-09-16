import axios from "axios";
import API_URL from "../config";

// =========================
// TYPES
// =========================

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  department: string;
}

// =========================
// LOGIN
// =========================

export const loginUser = async (
  loginData: LoginData
) => {
  const response = await axios.post(
    `${API_URL}/login`,
    loginData
  );

  // Save JWT token
  localStorage.setItem("token", response.data.token);

  return response.data;
};

// =========================
// REGISTER
// =========================

export const registerUser = async (
  registerData: RegisterData
) => {
  const response = await axios.post(
    `${API_URL}/register`,
    registerData
  );

  return response.data;
};