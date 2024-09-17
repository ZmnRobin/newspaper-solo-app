import { backendUrl } from "@/configs/constants";
import axios from "axios";
import Cookies from "js-cookie";

export const signUp = async (name: string, email: string, password: string) => {
  const response = await axios.post(`${backendUrl}/users/signup`, {
    name,
    email,
    password,
  });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${backendUrl}/users/login`, { email, password });
  if (response.data) {
    Cookies.set("token", response.data.token);
    Cookies.set("user", JSON.stringify(response.data.user));
    // Trigger a custom event for login
    window.dispatchEvent(new Event("userLoggedIn"));
  }
  return response.data;
};