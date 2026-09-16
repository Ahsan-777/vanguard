import axios from "axios";
import API_URL from "../config";

export interface Student {
  id?: number;
  name: string;
  age: number;
  username?: string;
}

export interface User {
  username: string;
  password?: string;
  department: string;
  is_active?: boolean;
}

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const getStudentsAPI = async (): Promise<Student[]> => {
  const response = await api.get<Student[]>("/students");
  return response.data;
};

export const getUsersAPI = async (): Promise<User[]> => {
  const response = await api.get<User[]>("/users");
  return response.data;
};

export const getActiveUsersAPI = async (): Promise<User[]> => {
  const response = await api.get<User[]>("/active-users");
  return response.data;
};

export const addStudentAPI = async (
  studentData: Student
): Promise<Student> => {
  const response = await api.post<Student>("/students", studentData);
  return response.data;
};

export const deleteStudentAPI = async (
  id: number
) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

export const deleteAllStudentsAPI = async () => {
  const response = await api.delete("/students");
  return response.data;
};

export const editStudentAPI = async (
  id: number,
  updatedData: Student
): Promise<Student> => {
  const response = await api.put<Student>(
    `/students/${id}`,
    updatedData
  );

  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/logout");

  localStorage.removeItem("token");

  return response.data;
};

export default api;