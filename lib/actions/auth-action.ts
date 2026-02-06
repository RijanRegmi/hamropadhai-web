"use server";

import { LoginData, RegisterData } from "./../../app/(auth)/schema";
import { login, register } from "./../api/auth";
import { setAuthToken, setUserData, clearAuthCookies } from "../cookie";

export const handleRegister = async (data: RegisterData) => {
  try {
    const response = await register(data);
    if (response.success) {
      return {
        success: true,
        message: "Registration successful! Please login to continue.",
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Registration failed. Please try again.",
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Parse specific error messages
    let errorMessage = error.message || "Registration failed";
    
    if (errorMessage.includes("Username already exists") || errorMessage.includes("username")) {
      errorMessage = "This username is already taken. Please choose another one.";
    } else if (errorMessage.includes("Email already exists") || errorMessage.includes("email")) {
      errorMessage = "This email is already registered. Please use another email.";
    } else if (errorMessage.includes("Phone") || errorMessage.includes("phone")) {
      errorMessage = "This phone number is already registered.";
    } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      errorMessage = "Network error. Please check your internet connection.";
    }
    
    return { 
      success: false, 
      message: errorMessage
    };
  }
};

export const handleLogin = async (data: LoginData) => {
  try {
    console.log("Attempting login with:", { username: data.username });
    
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
      // Handle specific error cases
      let errorMessage = response.message || "Login failed";
      
      if (errorMessage.includes("User not found") || errorMessage.includes("not found")) {
        errorMessage = "Username not found. Please check and try again.";
      } else if (errorMessage.includes("Invalid password") || errorMessage.includes("password")) {
        errorMessage = "Incorrect password. Please try again.";
      } else if (errorMessage.includes("Invalid credentials")) {
        errorMessage = "Invalid username or password.";
      } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }

    if (!response.token) {
      return {
        success: false,
        message: "Authentication failed. Please try again.",
      };
    }

    await setAuthToken(response.token, data.rememberMe || false);
    await setUserData(response.data, data.rememberMe || false);

    return {
      success: true,
      message: "Login successful!",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Login error:", error);
    
    let errorMessage = error.message || "An error occurred during login";
    
    if (errorMessage.includes("network") || errorMessage.includes("fetch") || errorMessage.includes("Failed to fetch")) {
      errorMessage = "Cannot connect to server. Please check your internet connection.";
    }
    
    return { 
      success: false, 
      message: errorMessage
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