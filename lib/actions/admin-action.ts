"use server";

import { cookies } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

/* =========================
   HELPER FUNCTION
========================= */
// Helper to check if teacher teaches a class/section
// NEW VERSION - handles new format
function teacherTeachesClassSection(teacher: any, targetClassId: string, targetSectionId: string): boolean {
  if (!teacher.classId) return false;

  try {
    // NEW: Parse class-section pairs like:
    // [{"classId":"11","sections":["A","B"]},{"classId":"12","sections":["D"]}]
    let classSectionPairs: Array<{classId: string, sections: string[]}> = [];
    
    if (teacher.classId.startsWith('[{')) {
      // New format: class-section pairs
      classSectionPairs = JSON.parse(teacher.classId);
    } else if (teacher.classId.startsWith('[')) {
      // Legacy format: separate class and section arrays
      const teacherClasses = JSON.parse(teacher.classId);
      const teacherSections = teacher.sectionId ? JSON.parse(teacher.sectionId) : [];
      classSectionPairs = teacherClasses.map((cls: string) => ({
        classId: cls,
        sections: teacherSections
      }));
    } else {
      // Single value format
      classSectionPairs = [{
        classId: teacher.classId,
        sections: teacher.sectionId ? [teacher.sectionId] : []
      }];
    }

    // Check if any pair matches the target class and section
    const matches = classSectionPairs.some(pair => 
      pair.classId === targetClassId && pair.sections.includes(targetSectionId)
    );

    return matches;
  } catch (error) {
    console.error('Error parsing teacher class/section:', error);
    return false;
  }
}

/* =========================
   GET ALL USERS
========================= */
export async function getAllUsersAction() {
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
      cache: "no-store", // Ensure fresh data
    });

    const result = await response.json();

    console.log("getAllUsersAction response:", {
      status: response.status,
      success: result.success,
      dataCount: result.data?.length,
      teachers: result.data?.filter((u: any) => u.role === 'teacher').map((t: any) => ({
        name: t.fullName,
        classId: t.classId,
        sectionId: t.sectionId
      }))
    });

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Unable to load users. Please try again.",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("getAllUsersAction error:", error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

/* =========================
   GET FILTERED TEACHERS
   This filters teachers on the server side
========================= */
export async function getFilteredTeachersAction(classId: string, sectionId: string) {
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
        message: result.message || "Unable to load teachers.",
      };
    }

    // Filter teachers
    const allTeachers = result.data.filter((user: any) => user.role === "teacher");
    const filteredTeachers = allTeachers.filter((teacher: any) => 
      teacherTeachesClassSection(teacher, classId, sectionId)
    );

    console.log('Filtered teachers:', {
      classId,
      sectionId,
      totalTeachers: allTeachers.length,
      filteredCount: filteredTeachers.length,
      filtered: filteredTeachers.map((t: any) => t.fullName)
    });

    return { success: true, data: filteredTeachers };
  } catch (error: any) {
    console.error("getFilteredTeachersAction error:", error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

/* ====================================
   GET FILTERED STUDENTS (NEW!)
   For assignment creation - gets students in specific class/section
==================================== */
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

    console.log("🔍 Fetching students for Class:", classId, "Section:", sectionId);

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
    console.log("📚 Total students in database:", allStudents.length);
    
    // Log all students with their class/section for debugging
    console.log("📚 All students:");
    allStudents.forEach((s: any) => {
      console.log(`  - ${s.fullName}: Class="${s.classId}", Section="${s.sectionId}"`);
    });

    const filteredStudents = allStudents.filter((student: any) => {
      // Trim whitespace and do exact comparison
      const studentClass = String(student.classId || "").trim();
      const studentSection = String(student.sectionId || "").trim();
      const targetClass = String(classId).trim();
      const targetSection = String(sectionId).trim();
      
      const classMatch = studentClass === targetClass;
      const sectionMatch = studentSection === targetSection;
      
      if (classMatch || sectionMatch) {
        console.log(`🔎 Checking ${student.fullName}:`, {
          studentClass: `"${studentClass}"`,
          targetClass: `"${targetClass}"`,
          classMatch,
          studentSection: `"${studentSection}"`,
          targetSection: `"${targetSection}"`,
          sectionMatch,
          MATCH: classMatch && sectionMatch
        });
      }
      
      return classMatch && sectionMatch;
    });

    console.log("✅ Filtered students count:", filteredStudents.length);
    if (filteredStudents.length > 0) {
      console.log("✅ Filtered students:", filteredStudents.map((s: any) => s.fullName));
    } else {
      console.log("❌ No students found for Class", classId, "Section", sectionId);
    }

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
   GET USER BY ID
========================= */
export async function getUserByIdAction(userId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { 
        success: false, 
        message: "Authentication required. Please login again." 
      };
    }

    const response = await fetch(
      `${API_URL}/api/admin/users/${userId}`,
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
        message: result.message || "Unable to load user details. Please try again.",
      };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
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
      return { 
        success: false, 
        message: "Authentication required. Please login again." 
      };
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

    console.log("Creating user with data:", {
      fullName: data.fullName,
      role: data.role,
      classId: data.classId,
      sectionId: data.sectionId,
    });

    const response = await fetch(`${API_URL}/api/admin/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    console.log("Create user response:", {
      status: response.status,
      success: result.success,
      data: result.data,
    });

    if (!response.ok || !result.success) {
      if (response.status === 409) {
        return {
          success: false,
          message: "Username or email already exists. Please use different credentials.",
        };
      }
      if (response.status === 400) {
        return {
          success: false,
          message: result.message || "Invalid data provided. Please check all fields.",
        };
      }
      return {
        success: false,
        message: result.message || "Failed to create user. Please try again.",
      };
    }

    return { 
      success: true, 
      message: `User "${data.fullName}" created successfully!`,
      data: result.data 
    };
  } catch (error: any) {
    console.error("Create user error:", error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

/* =========================
   UPDATE USER
========================= */
export async function updateUserAction(
  userId: string,
  data: {
    fullName?: string;
    username?: string;
    email?: string;
    phone?: string;
    password?: string;
    gender?: string;
    role?: string;
    about?: string;
    classId?: string;
    sectionId?: string;
    address?: string;
    parentContact?: string;
  }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { 
        success: false, 
        message: "Authentication required. Please login again." 
      };
    }

    console.log("Updating user with data:", {
      userId,
      classId: data.classId,
      sectionId: data.sectionId,
    });

    const response = await fetch(
      `${API_URL}/api/admin/users/${userId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    console.log("Update user response:", {
      status: response.status,
      success: result.success,
    });

    if (!response.ok || !result.success) {
      if (response.status === 404) {
        return {
          success: false,
          message: "User not found. They may have been deleted.",
        };
      }
      if (response.status === 409) {
        return {
          success: false,
          message: "Username or email already taken. Please use different credentials.",
        };
      }
      if (response.status === 400) {
        return {
          success: false,
          message: result.message || "Invalid data provided. Please check all fields.",
        };
      }
      return {
        success: false,
        message: result.message || "Failed to update user. Please try again.",
      };
    }

    return { 
      success: true, 
      message: "User updated successfully!",
      data: result.data 
    };
  } catch (error: any) {
    console.error("Update user error:", error);
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}

/* =========================
   UPLOAD USER PROFILE IMAGE (ADMIN)
========================= */
export async function uploadUserProfileImageAction(
  userId: string,
  formData: FormData
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return { 
        success: false, 
        message: "Authentication required. Please login again." 
      };
    }

    const response = await fetch(
      `${API_URL}/api/admin/users/${userId}/upload-image`,
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
        message: result.message || "Failed to upload image. Please try again.",
      };
    }

    return { 
      success: true, 
      message: "Profile image uploaded successfully!",
      data: result.data 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
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
      return { 
        success: false, 
        message: "Authentication required. Please login again." 
      };
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
      if (response.status === 404) {
        return {
          success: false,
          message: "User not found. They may have already been deleted.",
        };
      }
      if (response.status === 403) {
        return {
          success: false,
          message: "You don't have permission to delete this user.",
        };
      }
      return {
        success: false,
        message: result.message || "Failed to delete user. Please try again.",
      };
    }

    return { 
      success: true, 
      message: "User deleted successfully!" 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: "Network error. Please check your connection and try again." 
    };
  }
}