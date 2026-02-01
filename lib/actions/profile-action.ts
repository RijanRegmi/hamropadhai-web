"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export async function getProfileData() {
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
      return {
        success: false,
        message: result.message || "Failed to fetch profile",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch profile",
    };
  }
}

export async function uploadProfileImageAction(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const response = await fetch(
      `${API_URL}/api/auth/upload-profile-image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to upload image",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Upload error:", error);
    return {
      success: false,
      message: error.message || "Failed to upload image",
    };
  }
}

// Complete type definition with ALL fields
export async function updateProfileAction(data: {
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: "male" | "female";
  about?: string;
  address?: string;
  parentContact?: string;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to update profile",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Update profile error:", error);
    return {
      success: false,
      message: error.message || "Failed to update profile",
    };
  }
}