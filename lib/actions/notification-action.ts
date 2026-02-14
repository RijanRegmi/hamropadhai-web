"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

async function safeJson(res: Response) {
  const text = await res.text();
  if (text.trim().startsWith("<")) return { success: false, message: `Server error (${res.status})` };
  try { return JSON.parse(text); }
  catch { return { success: false, message: "Invalid response" }; }
}

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}

function getRoleFromToken(token: string): "user" | "teacher" | "admin" | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    return payload.role || null;
  } catch { return null; }
}

function notificationBase(role: string) {
  if (role === "teacher") return `${API_URL}/api/teacher/notifications`;
  return `${API_URL}/api/student/notifications`;
}

export async function getMyNotificationsAction() {
  try {
    const token = await getToken();
    if (!token) return { success: false, message: "Not authenticated", data: [] };

    const role = getRoleFromToken(token);
    if (!role || role === "admin") return { success: true, data: [] };

    const response = await fetch(notificationBase(role), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    });

    const result = await safeJson(response);
    return result.success
      ? { success: true, data: result.data }
      : { success: false, message: result.message, data: [] };
  } catch (error: any) {
    return { success: false, message: error.message, data: [] };
  }
}

export async function getNotificationUnreadCountAction() {
  try {
    const token = await getToken();
    if (!token) return { success: true, data: { unreadCount: 0 } };

    const role = getRoleFromToken(token);
    if (!role || role === "admin") return { success: true, data: { unreadCount: 0 } };

    const response = await fetch(`${notificationBase(role)}/unread-count`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    });

    const result = await safeJson(response);
    return result.success
      ? { success: true, data: result.data }
      : { success: true, data: { unreadCount: 0 } };
  } catch {
    return { success: true, data: { unreadCount: 0 } };
  }
}

export async function markNotificationAsReadAction(id: string) {
  try {
    const token = await getToken();
    if (!token) return { success: false, message: "Not authenticated" };

    const role = getRoleFromToken(token);
    if (!role || role === "admin") return { success: true };

    const response = await fetch(`${notificationBase(role)}/${id}/mark-read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    const result = await safeJson(response);
    return result.success ? { success: true } : { success: false, message: result.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    const token = await getToken();
    if (!token) return { success: false, message: "Not authenticated" };

    const role = getRoleFromToken(token);
    if (!role || role === "admin") return { success: true };

    const response = await fetch(`${notificationBase(role)}/mark-all-read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    const result = await safeJson(response);
    return result.success ? { success: true } : { success: false, message: result.message };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}