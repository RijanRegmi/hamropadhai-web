"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  getMyNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "../../../lib/actions/notification-action";
import "./notification-popup.css";

// ── Types ─────────────────────────────────────────────────────────────────────
export type NotificationType =
  | "assignment_created"
  | "assignment_updated"
  | "routine_created"
  | "routine_updated"
  | "notice_created"
  | "notice_updated";

export interface NotificationItem {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  refId?: string;
  refModel?: "Assignment" | "Routine" | "Notice";
}

export interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
  role?: "user" | "teacher" | "admin";
}

// ── Icon config — exact same bgColor/iconColor/SVG as dashboard menu cards ────
const TYPE_CONFIG: Record<
  NotificationType,
  { bgColor: string; iconColor: string; icon: React.ReactNode }
> = {
  assignment_created: {
    bgColor: "#DBEAFE",
    iconColor: "#3B82F6",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  assignment_updated: {
    bgColor: "#EDE9FE",
    iconColor: "#8B5CF6",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
  routine_created: {
    bgColor: "#FEF3C7",
    iconColor: "#F59E0B",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  routine_updated: {
    bgColor: "#FEF3C7",
    iconColor: "#F59E0B",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  notice_created: {
    bgColor: "#FFEDD5",
    iconColor: "#F97316",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
        />
      </svg>
    ),
  },
  notice_updated: {
    bgColor: "#FFEDD5",
    iconColor: "#F97316",
    icon: (
      <svg
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
        />
      </svg>
    ),
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function getRedirectUrl(n: NotificationItem, role: string): string | null {
  if (!n.refId) return null;
  if (n.refModel === "Assignment") {
    if (role === "teacher") return `/teacher/dashboard/assignments/${n.refId}`;
    return `/teacher/dashboard/assignments`;
  }
  if (n.refModel === "Routine") return `/teacher/dashboard/routine`;
  if (n.refModel === "Notice") return `/teacher/dashboard/notices`;
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function NotificationPopup({
  isOpen,
  onClose,
  onUnreadChange,
  role = "user",
}: NotificationPopupProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    onUnreadChange?.(unreadCount);
  }, [unreadCount]);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getMyNotificationsAction();
      if (result.success) setNotifications(result.data || []);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  const handleClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === n._id ? { ...item, isRead: true } : item,
        ),
      );
      await markNotificationAsReadAction(n._id);
    }
    const url = getRedirectUrl(n, role);
    if (url) {
      onClose();
      router.push(url);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllNotificationsAsReadAction();
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="np-overlay" onClick={onClose} />

      <div className="np-popup">
        {/* Header */}
        <div className="np-header">
          <div className="np-header-left">
            <h3 className="np-title">Notifications</h3>
            {unreadCount > 0 && (
              <span className="np-count-badge">{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              className="np-mark-all"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
            >
              {markingAll ? "Marking..." : "Mark all read"}
            </button>
          )}
        </div>

        {/* List */}
        <div className="np-list">
          {isLoading ? (
            <div className="np-loading">
              <div className="np-spinner" />
              <span>Loading...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="np-empty">
              <svg
                width="48"
                height="48"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p>You&apos;re all caught up!</p>
              <span>No notifications yet</span>
            </div>
          ) : (
            notifications.map((n) => {
              const cfg = TYPE_CONFIG[n.type];
              const canRedirect = !!getRedirectUrl(n, role);
              return (
                <div
                  key={n._id}
                  className={`np-item${!n.isRead ? " np-item--unread" : ""}${canRedirect ? " np-item--clickable" : ""}`}
                  onClick={() => handleClick(n)}
                  title={canRedirect ? "Click to view" : undefined}
                >
                  {/* Dashboard-style icon card bubble */}
                  <div
                    className="np-icon"
                    style={{ background: cfg.bgColor, color: cfg.iconColor }}
                  >
                    {cfg.icon}
                  </div>

                  <div className="np-content">
                    <div className="np-item-header">
                      <p className="np-item-title">{n.title}</p>
                      {canRedirect && !n.isRead && (
                        <span className="np-redirect-hint">→</span>
                      )}
                    </div>
                    <p className="np-item-msg">{n.message}</p>
                    <div className="np-item-footer">
                      <span className="np-item-time">
                        {timeAgo(n.createdAt)}
                      </span>
                      {canRedirect && (
                        <span
                          className="np-view-link"
                          style={{ color: cfg.iconColor }}
                        >
                          View →
                        </span>
                      )}
                    </div>
                  </div>

                  {!n.isRead && (
                    <div
                      className="np-dot"
                      style={{ background: cfg.iconColor }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="np-footer">
            <span className="np-footer-text">
              {notifications.length} total
              {unreadCount > 0 ? ` · ${unreadCount} unread` : " · all read"}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
