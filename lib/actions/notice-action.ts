"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

// ─── Safe JSON parser ─────────────────────────────────────────────────────────
// Prevents "Unexpected token '<'" crash when server returns an HTML error page
async function safeJson(response: Response, url: string) {
  const text = await response.text();
  if (text.trim().startsWith("<")) {
    console.error(`❌ Server returned HTML for ${url} (status ${response.status})`);
    return {
      success: false,
      message: `Server error (${response.status}) – check API URL or middleware`,
    };
  }
  try {
    return JSON.parse(text);
  } catch {
    console.error(`❌ Failed to parse JSON from ${url}:`, text.slice(0, 200));
    return { success: false, message: "Invalid response from server" };
  }
}

/* =========================
   ADMIN NOTICE ACTIONS
========================= */

// Create notice with file upload
export async function createNoticeWithFilesAction(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    console.log("📝 Creating notice with files...");

    const response = await fetch(`${API_URL}/api/admin/notices`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await safeJson(response, "/api/admin/notices");

    console.log("📥 Create notice response:", {
      status: response.status,
      success: result.success,
      message: result.message,
    });

    if (!response.ok || !result.success) {
      let errorMessage = result.message || "Failed to create notice";

      if (result.errors && result.errors.length > 0) {
        const errorDetails = result.errors
          .map((err: any) => `• ${err.path || "Unknown field"}: ${err.message}`)
          .join("\n");
        errorMessage = `Validation failed:\n${errorDetails}`;
      }

      return {
        success: false,
        message: errorMessage,
        errors: result.errors,
      };
    }

    return {
      success: true,
      message: "Notice created successfully",
      data: result.data,
    };
  } catch (error: any) {
    console.error("❌ Create notice error:", error);
    return { success: false, message: error.message || "Network error" };
  }
}

// Update notice with file upload
export async function updateNoticeWithFilesAction(id: string, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    console.log("📝 Updating notice with files...");

    const response = await fetch(`${API_URL}/api/admin/notices/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await safeJson(response, `/api/admin/notices/${id}`);

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to update notice",
      };
    }

    return {
      success: true,
      message: "Notice updated successfully",
      data: result.data,
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

// Get all notices (Admin)
export async function getAllNoticesAdminAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/admin/notices`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await safeJson(response, "/api/admin/notices");

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load notices",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

// Get notice by ID (Admin)
export async function getNoticeByIdAdminAction(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/admin/notices/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await safeJson(response, `/api/admin/notices/${id}`);

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load notice",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

// Delete notice
export async function deleteNoticeAction(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/admin/notices/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await safeJson(response, `/api/admin/notices/${id} [DELETE]`);

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to delete notice",
      };
    }

    return { success: true, message: "Notice deleted successfully" };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

// Get pinned notices (Admin)
export async function getPinnedNoticesAdminAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/admin/notices/pinned`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await safeJson(response, "/api/admin/notices/pinned");

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load pinned notices",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

/* =========================
   TEACHER NOTICE ACTIONS
========================= */

// Get teacher's notices
export async function getMyNoticesTeacherAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/teacher/notices/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await safeJson(response, "/api/teacher/notices/my");

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load notices",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

// Get notice by ID (Teacher)
export async function getNoticeByIdTeacherAction(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/teacher/notices/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await safeJson(response, `/api/teacher/notices/${id}`);

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load notice",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

// Mark notice as read (Teacher)
export async function markNoticeAsReadTeacherAction(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/teacher/notices/${id}/mark-read`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await safeJson(response, `/api/teacher/notices/${id}/mark-read`);

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to mark as read",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

// Get unread count (Teacher)
export async function getUnreadCountTeacherAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/teacher/notices/unread-count`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await safeJson(response, "/api/teacher/notices/unread-count");

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to get unread count",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

/* =========================
   STUDENT NOTICE ACTIONS
========================= */

// Get student's notices
export async function getMyNoticesStudentAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/notices/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await safeJson(response, "/api/notices/my");

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load notices",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

// Get notice by ID (Student)
export async function getNoticeByIdStudentAction(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/notices/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await safeJson(response, `/api/notices/${id}`);

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load notice",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

// Mark notice as read (Student)
export async function markNoticeAsReadStudentAction(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/notices/${id}/mark-read`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await safeJson(response, `/api/notices/${id}/mark-read`);

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to mark as read",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

// Get unread count (Student)
export async function getUnreadCountStudentAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/notices/unread-count`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await safeJson(response, "/api/notices/unread-count");

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to get unread count",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

// Get pinned notices (Student)
export async function getPinnedNoticesStudentAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/notices/pinned`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await safeJson(response, "/api/notices/pinned");

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load pinned notices",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}