"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const response = await fetch(`${API_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // Backend expects "oldPassword" not "currentPassword"
      body: JSON.stringify({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      let message = result.message || "Failed to change password";

      if (
        message.toLowerCase().includes("incorrect") ||
        message.toLowerCase().includes("wrong") ||
        message.toLowerCase().includes("invalid") ||
        message.toLowerCase().includes("old password")
      ) {
        message = "Current password is incorrect. Please try again.";
      }

      return { success: false, message };
    }

    return {
      success: true,
      message: "Password changed successfully! All other sessions have been signed out.",
    };
  } catch (error: any) {
    console.error("Change password error:", error);
    return {
      success: false,
      message: error.message || "Failed to change password",
    };
  }
}

export async function getActiveSessionsAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const response = await fetch(`${API_URL}/api/auth/sessions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to fetch sessions",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Get sessions error:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch sessions",
    };
  }
}