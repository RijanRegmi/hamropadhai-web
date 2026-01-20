"use server";

import { LoginData, RegisterData } from "./../../app/(auth)/schema";
import { login, register } from "./../api/auth";
import { setAuthToken, setUserData, clearAuthCookies } from "../cookie";
import { redirect } from "next/navigation";

export const handleRegister = async (data: RegisterData) => {
  try {
    const response = await register(data);
    if (response.success) {
      return {
        success: true,
        message: "Registration successful",
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Registration failed",
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "Registration action failed" 
    };
  }
};

export const handleLogin = async (data: LoginData) => {
  try {
    const response = await login(data);
    if (response.success) {
      await setAuthToken(response.token);
      await setUserData(response.data);
      return {
        success: true,
        message: "Login successful",
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Login failed",
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "Login action failed" 
    };
  }
};


export const handleLogout = async () => {
  await clearAuthCookies();
  redirect("/login");
};