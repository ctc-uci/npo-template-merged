import axios from "axios";

import { authInterceptor } from "./auth/authInterceptor";

const baseURL = import.meta.env.VITE_BACKEND_HOSTNAME;

/**
 * For use outside of React contexts (i.e. utils)
 */
export const backend = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

authInterceptor(backend);
