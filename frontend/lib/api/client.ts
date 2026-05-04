import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// TODO: Add request interceptor (e.g., attach auth token)
// TODO: Add response interceptor (e.g., handle 401 refresh)

export default apiClient;
