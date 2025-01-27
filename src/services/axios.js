import axios from "axios";
import useStore from "../store/useStore";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5001/api";
const DOCUSIGN_TOKEN_URL = "https://account-d.docusign.com/oauth/token";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
// Keep track of refresh token calls to prevent multiple refreshes
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Handle failed requests and add to queue
const addToQueue = async (request) => {
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  })
    .then((token) => {
      request.headers["Authorization"] = `Bearer ${token}`;
      return axios(request);
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};

// Refresh token function
const refreshTokenFn = async () => {
  try {
    const refreshToken = useStore.getState().tokens.refreshToken;
    const clientId = process.env.REACT_APP_DOCUSIGN_CLIENT_ID;

    const response = await axios.post(DOCUSIGN_TOKEN_URL, {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    });

    const { access_token, refresh_token } = response.data;
    useStore.getState().login(access_token, refresh_token);
    return access_token;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useStore.getState().tokens.accessToken;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, add failed request to queue
    if (isRefreshing) {
      return addToQueue(originalRequest);
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await refreshTokenFn();
      processQueue(null, newAccessToken);
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      return axios(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Clear tokens but don't force reload
      useStore.getState().logout();
      // Let the application handle navigation
      return Promise.reject({
        ...refreshError,
        isAuthError: true, // Add flag to identify auth errors
      });
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
