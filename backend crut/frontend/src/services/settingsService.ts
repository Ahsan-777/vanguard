import axios from "axios";
import API_URL from "../config";

// =========================
// TYPES
// =========================

export interface SettingsData {
  username: string;
  department: string;
}

export interface PasswordData {
  password: string;
}

// =========================
// UPDATE USER SETTINGS
// =========================

export const updateUserSettingsAPI = async (
  settingsData: SettingsData
) => {
  const response = await axios.put(
    `${API_URL}/settings`,
    settingsData
  );

  return response.data;
};

// =========================
// CHANGE PASSWORD
// =========================

export const changePasswordAPI = async (
  passwordData: PasswordData
) => {
  const response = await axios.put(
    `${API_URL}/settings`,
    passwordData
  );

  return response.data;
};