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
    console.error("Registration error:", error);
    return { 
      success: false, 
      message: error.message || "Registration action failed" 
    };
  }
};

export const handleLogin = async (data: LoginData) => {
  try {
    console.log("Attempting login with:", { username: data.username });
    
    // FIXED: Send rememberMe to backend, don't remove it
    const response = await login({
      username: data.username,
      password: data.password,
      rememberMe: data.rememberMe || false,
    });
    
    console.log("Login response:", {
      success: response.success,
      message: response.message,
    });

    if (!response.success) {
      return {
        success: false,
        message: response.message || "Login failed",
      };
    }

    if (!response.token) {
      return {
        success: false,
        message: "No token received from server",
      };
    }

    await setAuthToken(response.token, data.rememberMe || false);
    await setUserData(response.data, data.rememberMe || false);

    return {
      success: true,
      message: "Login successful",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return { 
      success: false, 
      message: error.message || "An error occurred during login" 
    };
  }
};

export const handleLogout = async () => {
  try {
    await clearAuthCookies();
    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error: any) {
    console.error("Logout error:", error);
    return {
      success: false,
      message: error.message || "Logout failed",
    };
  }
};