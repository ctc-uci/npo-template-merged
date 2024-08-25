import axios from "axios";

import { authInterceptor } from "./auth/authInterceptor";

const baseURL = import.meta.env.DEV_VITE_BACKEND_HOSTNAME;

export const backend = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

authInterceptor(backend);
