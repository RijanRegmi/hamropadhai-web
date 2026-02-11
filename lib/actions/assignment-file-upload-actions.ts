"use server";

import { cookies } from "next/headers";



const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

/* =========================
   CREATE ASSIGNMENT WITH FILE UPLOAD
========================= */
export async function createAssignmentWithFilesAction(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    console.log("📝 Creating assignment with files...");

    // Log form data contents
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    const response = await fetch(`${API_URL}/api/admin/assignments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - let browser set it with boundary for multipart/form-data
      },
      body: formData,
    });

    const result = await response.json();

    console.log("📥 Create assignment response:", {
      status: response.status,
      success: result.success,
      message: result.message,
    });

    if (!response.ok || !result.success) {
      let errorMessage = result.message || "Failed to create assignment";
      
      if (result.errors && result.errors.length > 0) {
        const errorDetails = result.errors.map((err: any) => 
          `• ${err.path || 'Unknown field'}: ${err.message}`
        ).join('\n');
        
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
      message: "Assignment created successfully",
      data: result.data,
    };
  } catch (error: any) {
    console.error("❌ Create assignment error:", error);
    return { success: false, message: error.message || "Network error" };
  }
}

/* =========================
   UPDATE ASSIGNMENT WITH FILE UPLOAD
========================= */
export async function updateAssignmentWithFilesAction(id: string, formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    console.log("📝 Updating assignment with files...");

    const response = await fetch(`${API_URL}/api/admin/assignments/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to update assignment",
      };
    }

    return {
      success: true,
      message: "Assignment updated successfully",
      data: result.data,
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}
