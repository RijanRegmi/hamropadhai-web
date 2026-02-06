"use server";

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export const handleForgotPassword = async (data: ForgotPasswordData) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: data.email }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to send verification code. Please try again.",
      };
    }

    return {
      success: true,
      message: result.message || "Verification code sent to your email!",
    };
  } catch (error: any) {
    console.error("Forgot password error:", error);
    
    let errorMessage = error.message || "Failed to send verification code";
    
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      errorMessage = "Network error. Please check your internet connection.";
    }
    
    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const handleResetPassword = async (data: ResetPasswordData) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        code: data.code,
        newPassword: data.newPassword,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      // Handle specific error cases
      let errorMessage = result.message || "Failed to reset password";
      
      if (errorMessage.includes("Invalid or expired")) {
        errorMessage = "Verification code is invalid or expired. Please request a new code.";
      } else if (errorMessage.includes("User not found")) {
        errorMessage = "Email not found. Please check and try again.";
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }

    return {
      success: true,
      message: result.message || "Password reset successfully!",
    };
  } catch (error: any) {
    console.error("Reset password error:", error);
    
    let errorMessage = error.message || "Failed to reset password";
    
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      errorMessage = "Network error. Please check your internet connection.";
    }
    
    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const handleResendCode = async (email: string) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to resend code. Please try again.",
      };
    }

    return {
      success: true,
      message: result.message || "New verification code sent to your email!",
    };
  } catch (error: any) {
    console.error("Resend code error:", error);
    
    let errorMessage = error.message || "Failed to resend code";
    
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      errorMessage = "Network error. Please check your internet connection.";
    }
    
    return {
      success: false,
      message: errorMessage,
    };
  }
};

