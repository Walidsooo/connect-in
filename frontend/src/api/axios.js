import axios from "axios";

// 1. Création de l'instance avec l'URL de base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 2. L'intercepteur pour injecter le token
api.interceptors.request.use(
  (config) => {
    // On récupère le token stocké (nommé 'auth_token' pour cohérence)
    const token = localStorage.getItem("auth_token");

    // Si le token existe, on l'ajoute au header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
