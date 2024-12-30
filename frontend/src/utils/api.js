// frontend/src/utils/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // Backend server URL
});

export default API;
