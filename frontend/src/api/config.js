const base = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5001/api";
export const API_BASE = base.endsWith("/api") ? base : `${base}/api`;
