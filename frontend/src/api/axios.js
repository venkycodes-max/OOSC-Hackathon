import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("trailhead_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    const isAuthRequest = url.includes("/auth/login") || url.includes("/auth/register");

    // A wrong login password/email returns 401. Do not redirect/reload the
    // login page in that case; let Login.jsx show a friendly error instead.
    if (err.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem("trailhead_token");
      localStorage.removeItem("trailhead_user");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default api;
