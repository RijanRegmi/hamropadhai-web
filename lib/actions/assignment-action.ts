"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

/* =========================
   HELPER FUNCTION - UPDATED FOR NEW FORMAT
========================= */
// ✅ Helper to check if teacher teaches a class/section
function teacherTeachesClassSection(teacher: any, targetClassId: string, targetSectionId: string): boolean {
  if (!teacher.classId) return false;

  try {
    // NEW format: [{"classId":"11","sections":["A","B"]},{"classId":"12","sections":["D"]}]
    if (teacher.classId.startsWith('[{')) {
      const classSectionPairs = JSON.parse(teacher.classId);
      return classSectionPairs.some((pair: any) => 
        pair.classId === targetClassId && pair.sections.includes(targetSectionId)
      );
    } 
    // Legacy format: separate arrays
    else if (teacher.classId.startsWith('[')) {
      const classes = JSON.parse(teacher.classId);
      const sections = teacher.sectionId ? JSON.parse(teacher.sectionId) : [];
      return classes.includes(targetClassId) && sections.includes(targetSectionId);
    } 
    // Single value format
    else {
      return teacher.classId === targetClassId && teacher.sectionId === targetSectionId;
    }
  } catch (error) {
    console.error('Error parsing teacher class/section:', error);
    return false;
  }
}

/* =========================
   FILE DOWNLOAD ACTION
========================= */
/**
 * Download a file through the server with proper authentication
 * This bypasses CORS issues by proxying the request through the server
 */
export async function downloadFileAction(fileUrl: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { 
        success: false, 
        message: "Authentication required to download files" 
      };
    }

    // Make request with authentication
    const response = await fetch(fileUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to download file from server",
      };
    }

    // Get the file as array buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convert to base64 for transfer to client
    const base64 = buffer.toString('base64');
    
    // Get content type from response headers
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    return {
      success: true,
      data: {
        base64,
        contentType,
      },
    };
  } catch (error: any) {
    console.error("❌ Download file error:", error);
    return { 
      success: false, 
      message: error.message || "Network error while downloading file" 
    };
  }
}

/* =========================
   CREATE ASSIGNMENT (JSON) - ORIGINAL
========================= */
export async function createAssignmentAction(data: any) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    console.log("📝 Creating assignment with data:", JSON.stringify(data, null, 2));

    const response = await fetch(`${API_URL}/api/admin/assignments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    console.log("📥 Create assignment response:", {
      status: response.status,
      success: result.success,
      message: result.message,
      errors: result.errors,
      details: result.details,
    });

    if (!response.ok || !result.success) {
      let errorMessage = result.message || "Failed to create assignment";
      
      if (result.errors && result.errors.length > 0) {
        console.error("🔴 Validation errors:", result.errors);
        const errorDetails = result.errors.map((err: any) => 
          `• ${err.path || 'Unknown field'}: ${err.message}${err.received ? ` (received: ${err.received}, expected: ${err.expected})` : ''}`
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
   CREATE ASSIGNMENT WITH FILES (FormData) - NEW
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
   UPDATE ASSIGNMENT WITH FILES (FormData) - NEW
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

/* =========================
   GET FILTERED STUDENTS
========================= */
export async function getFilteredStudentsAction(classId: string, sectionId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { 
        success: false, 
        message: "Authentication required. Please login again." 
      };
    }

    const response = await fetch(`${API_URL}/api/admin/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Unable to load students.",
      };
    }

    // Filter for role "user" (students)
    const allStudents = result.data.filter((user: any) => user.role === "user");
    
    // Normalize target values
    const normalizedTargetClass = String(classId).trim().replace(/['"]/g, '');
    const normalizedTargetSection = String(sectionId).trim().replace(/['"]/g, '');

    const filteredStudents = allStudents.filter((student: any) => {
      // Normalize student values (remove any quotes)
      const studentClass = String(student.classId || "").trim().replace(/['"]/g, '');
      const studentSection = String(student.sectionId || "").trim().replace(/['"]/g, '');
      
      const classMatch = studentClass === normalizedTargetClass;
      const sectionMatch = studentSection === normalizedTargetSection;
      
      return classMatch && sectionMatch;
    });

    return { success: true, data: filteredStudents };
  } catch (error: any) {
    console.error("❌ getFilteredStudentsAction error:", error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

/* =========================
   GET FILTERED TEACHERS - ✅ FIXED
========================= */
export async function getFilteredTeachersForAssignmentAction(
  classId: string,
  sectionId: string
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    console.log("🔍 Fetching teachers for Class:", classId, "Section:", sectionId);

    const response = await fetch(`${API_URL}/api/admin/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load teachers",
      };
    }

    const allTeachers = result.data.filter(
      (user: any) => user.role === "teacher"
    );

    console.log("📚 Total teachers in database:", allTeachers.length);
    console.log("📚 All teachers:");
    allTeachers.forEach((t: any) => {
      console.log(`  - ${t.fullName}: classId="${t.classId}"`);
    });

    // ✅ Use updated helper function that handles new format
    const filteredTeachers = allTeachers.filter((teacher: any) => {
      const teaches = teacherTeachesClassSection(teacher, classId, sectionId);
      if (teaches) {
        console.log(`✅ ${teacher.fullName} teaches Class ${classId}-${sectionId}`);
      }
      return teaches;
    });

    console.log("✅ Filtered teachers count:", filteredTeachers.length);

    return { success: true, data: filteredTeachers };
  } catch (error: any) {
    console.error("❌ getFilteredTeachersForAssignmentAction error:", error);
    return { success: false, message: error.message || "Network error" };
  }
}

/* ====================================
   ADMIN ASSIGNMENT ACTIONS
==================================== */

export async function getAllAssignmentsAdminAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/admin/assignments`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load assignments",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

export async function getAssignmentByIdAdminAction(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/admin/assignments/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load assignment",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

export async function updateAssignmentAction(id: string, data: any) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/admin/assignments/${id}`, {
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

export async function deleteAssignmentAction(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/admin/assignments/${id}`, {
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
        message: result.message || "Failed to delete assignment",
      };
    }

    return { success: true, message: "Assignment deleted successfully" };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

export async function getSubmissionsAdminAction(assignmentId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(
      `${API_URL}/api/admin/assignments/${assignmentId}/submissions`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load submissions",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

export async function getAssignmentHistoryAdminAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/admin/assignments/history`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load history",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

/* ====================================
   TEACHER ASSIGNMENT ACTIONS
==================================== */

export async function getMyAssignmentsTeacherAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/teacher/assignments/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load assignments",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

export async function getAssignmentByIdTeacherAction(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/teacher/assignments/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load assignment",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

export async function gradeSubmissionAction(
  assignmentId: string,
  data: { studentId: string; marks: number; feedback?: string }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(
      `${API_URL}/api/teacher/assignments/${assignmentId}/grade`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to grade submission",
      };
    }

    return {
      success: true,
      message: "Submission graded successfully",
      data: result.data,
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

export async function getSubmissionsTeacherAction(assignmentId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(
      `${API_URL}/api/teacher/assignments/${assignmentId}/submissions`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load submissions",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

export async function getAssignmentHistoryTeacherAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/teacher/assignments/history`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load history",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

/* ====================================
   STUDENT ASSIGNMENT ACTIONS
==================================== */

export async function getMyAssignmentsStudentAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/assignments/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load assignments",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

export async function getAssignmentByIdStudentAction(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/assignments/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load assignment",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

export async function submitAssignmentAction(
  assignmentId: string,
  data: { files?: any[]; textContent?: string }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(
      `${API_URL}/api/assignments/${assignmentId}/submit`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to submit assignment",
      };
    }

    return {
      success: true,
      message: "Assignment submitted successfully",
      data: result.data,
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

/* ====================================
   SUBMIT ASSIGNMENT WITH FILES - NEW FUNCTION
==================================== */

/**
 * Submit or resubmit assignment with file uploads
 * Uses FormData to handle multipart file uploads
 * Replaces the old submitAssignmentAction when files are involved
 */
export async function submitAssignmentWithFilesAction(
  assignmentId: string,
  formData: FormData
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    console.log("📤 Submitting assignment with files...");

    const response = await fetch(
      `${API_URL}/api/assignments/${assignmentId}/submit`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary for multipart/form-data
        },
        body: formData,
      }
    );

    const result = await response.json();

    console.log("📥 Submit response:", {
      status: response.status,
      success: result.success,
      message: result.message,
    });

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to submit assignment",
      };
    }

    return {
      success: true,
      message: "Assignment submitted successfully",
      data: result.data,
    };
  } catch (error: any) {
    console.error("❌ Submit assignment error:", error);
    return { success: false, message: error.message || "Network error" };
  }
}

export async function getPendingAssignmentsAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/assignments/pending`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load pending assignments",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

export async function getSubmittedAssignmentsAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/assignments/submitted`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load submitted assignments",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

export async function getGradedAssignmentsAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/assignments/graded`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load graded assignments",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}

export async function getAssignmentHistoryStudentAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { success: false, message: "Authentication required" };
    }

    const response = await fetch(`${API_URL}/api/assignments/history`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to load history",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Network error" };
  }
}