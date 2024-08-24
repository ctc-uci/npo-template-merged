import axios, { AxiosInstance } from "axios";

import { refreshToken } from "./firebase";

/**
 * Adds an interceptor to the provided Axios instance that handles authentication token refresh.
 *
 * This interceptor checks for a 400 status code with a specific error message indicating that
 * the access token has expired. If the token has expired, it attempts to refresh the token
 * using the `refreshToken` function and retries the original request with the new token.
 *
 */
export const authInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Handle network errors or request setup errors
      if (!error.response) {
        return Promise.reject(error);
      }

      const { status, data, config } = error.response;

      if (status === 400 && data === "@verifyToken invalid access token") {
        try {
          await refreshToken();

          // Create a new instance of the request with updated token
          return axios({
            ...config,
            url: `${config.baseURL}${config.url}`,
            withCredentials: true,
          });
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      // For other status codes, or if the token refresh logic was not triggered
      return Promise.reject(error);
    }
  );
};
