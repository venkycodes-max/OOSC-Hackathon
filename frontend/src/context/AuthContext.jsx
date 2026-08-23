import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("trailhead_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // On mount, verify the token is still valid and refresh user data
  useEffect(() => {
    const token = localStorage.getItem("trailhead_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("trailhead_user", JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem("trailhead_token");
        localStorage.removeItem("trailhead_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token, userData) {
    localStorage.setItem("trailhead_token", token);
    localStorage.setItem("trailhead_user", JSON.stringify(userData));
    setUser(userData);
  }

  function updateUser(userData) {
    localStorage.setItem("trailhead_user", JSON.stringify(userData));
    setUser(userData);
  }

  // Logging out only clears the local session token — all progress stays saved
  // server-side in MongoDB under this student's account and reloads on next login.
  function logout() {
    localStorage.removeItem("trailhead_token");
    localStorage.removeItem("trailhead_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
