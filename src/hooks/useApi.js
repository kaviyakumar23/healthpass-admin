import { useState, useCallback } from "react";
import axiosInstance from "../services/axios";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (config) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance(config);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(
    (url, config = {}) => {
      return request({ ...config, method: "get", url });
    },
    [request]
  );

  const post = useCallback(
    (url, data, config = {}) => {
      return request({ ...config, method: "post", url, data });
    },
    [request]
  );

  const put = useCallback(
    (url, data, config = {}) => {
      return request({ ...config, method: "put", url, data });
    },
    [request]
  );

  const del = useCallback(
    (url, config = {}) => {
      return request({ ...config, method: "delete", url });
    },
    [request]
  );

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    del,
  };
};
