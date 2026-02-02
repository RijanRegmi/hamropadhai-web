"use server";

import { cookies } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

/* =========================
   GET ALL USERS
========================= */
export async function getAllUsersAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const response = await fetch(`${API_URL}/api/admin/users`, {
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
        message: result.message || "Failed to fetch users",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/* =========================
   GET USER BY ID
========================= */
export async function getUserByIdAction(userId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const response = await fetch(
      `${API_URL}/api/admin/users/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to fetch user",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/* =========================
   CREATE USER
========================= */
export async function createUserAction(
  data: {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    gender: string;
    role: string;
    about?: string;
    classId?: string;
    sectionId?: string;
    address?: string;
    parentContact?: string;
  },
  profileImage: File | null
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("password", data.password);
    formData.append("gender", data.gender);
    formData.append("role", data.role);
    
    // Always append these fields, even if empty
    formData.append("about", data.about || "");
    formData.append("classId", data.classId || "");
    formData.append("sectionId", data.sectionId || "");
    formData.append("address", data.address || "");
    formData.append("parentContact", data.parentContact || "");
    
    if (profileImage) formData.append("profileImage", profileImage);

    const response = await fetch(`${API_URL}/api/admin/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to create user",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/* =========================
   UPDATE USER (FIXED)
========================= */
export async function updateUserAction(
  userId: string,
  data: {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    password?: string;
    gender: string;
    role: string;
    about?: string;
    classId?: string;
    sectionId?: string;
    address?: string;
    parentContact?: string;
  },
  profileImage: File | null
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    if (data.password) formData.append("password", data.password);
    formData.append("gender", data.gender);
    formData.append("role", data.role);
    
    // Always append these fields, even if empty
    formData.append("about", data.about || "");
    formData.append("classId", data.classId || "");
    formData.append("sectionId", data.sectionId || "");
    formData.append("address", data.address || "");
    formData.append("parentContact", data.parentContact || "");
    
    if (profileImage) formData.append("profileImage", profileImage);

    const response = await fetch(
      `${API_URL}/api/admin/users/${userId}`,
      {
        method: "PUT",
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
        message: result.message || "Failed to update user",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/* =========================
   DELETE USER
========================= */
export async function deleteUserAction(userId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const response = await fetch(
      `${API_URL}/api/admin/users/${userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to delete user",
      };
    }

    return { success: true, message: result.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}