import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const token = localStorage.getItem("@orbit:token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
