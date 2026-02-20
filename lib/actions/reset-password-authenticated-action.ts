"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

// Gets the logged-in user's email from their profile
export async function getMyEmailAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return { success: false, message: result.message || "Failed to fetch profile" };
    }

    return { success: true, email: result.data.email as string };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch profile" };
  }
}

// Sends the reset code to the given email
export async function sendResetCodeAction(email: string) {
  try {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return { success: false, message: result.message || "Failed to send code" };
    }

    return { success: true, message: result.message || "Code sent to your email" };
  } catch (error: any) {
    return { success: false, message: error.message || "Connection error" };
  }
}

// Verifies the 6-digit code
export async function verifyResetCodeAction(email: string, code: string) {
  try {
    const response = await fetch(`${API_URL}/api/auth/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return { success: false, message: result.message || "Invalid or expired code" };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Connection error" };
  }
}

// Resets the password with verified code
export async function resetPasswordAction(email: string, code: string, newPassword: string) {
  try {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return { success: false, message: result.message || "Failed to reset password" };
    }

    return { success: true, message: result.message || "Password reset successfully" };
  } catch (error: any) {
    return { success: false, message: error.message || "Connection error" };
  }
}