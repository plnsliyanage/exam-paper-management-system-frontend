import { createContext, useContext, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const getRole = () => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.role;
    } catch {
      return null;
    }
  };

  const getUsername = () => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.sub;
    } catch {
      return null;
    }
  }

  const login = async (username, password) => {
    const response = await axiosInstance.post("/auth/login", {
      username,
      password,
    });
    const { token } = response.data;
    localStorage.setItem("token", token);
    setToken(token);
    return token;
  };

  const register = async (username, fullName, password, role) => {
    await axiosInstance.post("/auth/register", {
      username,
      fullName,
      password,
      role,
    });
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      // even if it fails server-side, clear local state
    }
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout, getRole, getUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}