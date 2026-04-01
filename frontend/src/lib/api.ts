import axios, { AxiosRequestConfig } from "axios";
import { parseCookies } from "nookies";

export const api = axios.create({
  // baseURL: "http://82.197.67.88:3333",
  baseURL: "http://localhost:3333",
});

api.interceptors.request.use((config) => {
  const { "nextauth.token": token } = parseCookies();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const apiMutator = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await api.request<T>(config);
  return response.data;
};
