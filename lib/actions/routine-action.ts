"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

/* =========================
   ADMIN ROUTINE ACTIONS
========================= */

// Get all routines (Admin only)
export async function getAllRoutinesAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Authentication required. Please login again.",
      };
    }

    const response = await fetch(`${API_URL}/api/admin/routines`, {
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
        message: result.message || "Unable to load routines. Please try again.",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
}

// Get routine by ID (Admin only)
export async function getRoutineByIdAction(routineId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Authentication required. Please login again.",
      };
    }

    const response = await fetch(`${API_URL}/api/admin/routines/${routineId}`, {
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
        message: result.message || "Unable to load routine. Please try again.",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
}

// Create routine (Admin only)
export async function createRoutineAction(data: {
  classId: string;
  sectionId: string;
  academicYear: string;
  entries: Array<{
    day: string;
    periods: Array<{
      periodNumber: number;
      startTime: string;
      endTime: string;
      subject: string;
      teacherId: string | null;
      teacherName: string;
      roomNumber?: string;
    }>;
  }>;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    console.log("=== createRoutineAction DEBUG ===");
    console.log("API_URL:", API_URL);
    console.log("Token exists:", !!token);
    console.log("Payload:", JSON.stringify(data, null, 2));

    if (!token) {
      return {
        success: false,
        message: "Authentication required. Please login again.",
      };
    }

    const url = `${API_URL}/api/admin/routines`;
    console.log("Calling URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    const result = await response.json();
    console.log("Response data:", result);

    if (!response.ok || !result.success) {
      if (response.status === 409) {
        return {
          success: false,
          message: "A routine already exists for this class and section.",
        };
      }
      return {
        success: false,
        message: result.message || "Failed to create routine. Please try again.",
      };
    }

    return {
      success: true,
      message: "Routine created successfully!",
      data: result.data,
    };
  } catch (error: any) {
    console.error("=== createRoutineAction ERROR ===");
    console.error(error);
    return {
      success: false,
      message: error.message || "Network error. Please check your connection and try again.",
    };
  }
}

// Update routine (Admin only)
export async function updateRoutineAction(
  routineId: string,
  data: {
    classId?: string;
    sectionId?: string;
    academicYear?: string;
    entries?: Array<{
      day: string;
      periods: Array<{
        periodNumber: number;
        startTime: string;
        endTime: string;
        subject: string;
        teacherId: string | null;
        teacherName: string;
        roomNumber?: string;
      }>;
    }>;
    isActive?: boolean;
  }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Authentication required. Please login again.",
      };
    }

    const response = await fetch(`${API_URL}/api/admin/routines/${routineId}`, {
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
        message: result.message || "Failed to update routine. Please try again.",
      };
    }

    return {
      success: true,
      message: "Routine updated successfully!",
      data: result.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
}

// Delete routine (Admin only)
export async function deleteRoutineAction(routineId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Authentication required. Please login again.",
      };
    }

    const response = await fetch(`${API_URL}/api/admin/routines/${routineId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to delete routine. Please try again.",
      };
    }

    return {
      success: true,
      message: "Routine deleted successfully!",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
}

/* =========================
   TEACHER ROUTINE ACTIONS
========================= */

// Get teacher's routines
export async function getTeacherRoutinesAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Authentication required. Please login again.",
      };
    }

    const response = await fetch(`${API_URL}/api/teacher/routines/my`, {
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
        message: result.message || "Unable to load routines. Please try again.",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
}

/* =========================
   STUDENT ROUTINE ACTIONS
========================= */

// Get student's routine
export async function getStudentRoutineAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Authentication required. Please login again.",
      };
    }

    const response = await fetch(`${API_URL}/api/routines/my`, {
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
        message: result.message || "Unable to load routine. Please try again.",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
}