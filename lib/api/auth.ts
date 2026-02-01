import { LoginData, RegisterData } from "./../../app/(auth)/schema";
import axios from "./axios";
import { API } from "./endpoints";

export const register = async (registerData: RegisterData) => {
  try {
    const response = await axios.post(API.AUTH.REGISTER, registerData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Registration failed"
    );
  }
};

export const login = async (loginData: LoginData) => {
  try {
    const response = await axios.post(API.AUTH.LOGIN, loginData);
    
    if (response.data.success && response.data.data) {
      return {
        success: true,
        message: response.data.message,
        token: response.data.data.token,
        data: response.data.data.user,
      };
    }
    
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Login failed"
    );
  }
};