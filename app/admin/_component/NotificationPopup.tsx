"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import "./notification.css";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  icon: string;
}

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPopup({
  isOpen,
  onClose,
}: NotificationPopupProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New Assignment Posted",
      message: "Mathematics Assignment 5 has been posted",
      time: "2 hours ago",
      unread: true,
      icon: "📝",
    },
    {
      id: 2,
      title: "Exam Schedule Updated",
      message: "Mid-term exam schedule has been updated",
      time: "5 hours ago",
      unread: true,
      icon: "📋",
    },
    {
      id: 3,
      title: "Library Book Due",
      message: "Return 'Advanced Physics' by tomorrow",
      time: "1 day ago",
      unread: true,
      icon: "📚",
    },
    {
      id: 4,
      title: "Class Cancelled",
      message: "Physics class on Friday has been cancelled",
      time: "2 days ago",
      unread: false,
      icon: "🔔",
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((n) => ({
        ...n,
        unread: false,
      })),
    );
    toast.success("All notifications marked as read!");
  };

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="notification-overlay" onClick={onClose}></div>

      {/* Notification Popup */}
      <div className="notification-popup">
        <div className="notification-header">
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <button className="mark-all-read" onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>

        <div className="notification-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  notification.unread ? "unread" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="notification-icon">{notification.icon}</div>
                <div className="notification-content">
                  <h4 className="notification-title">{notification.title}</h4>
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">{notification.time}</span>
                </div>
                {notification.unread && <div className="unread-dot"></div>}
              </div>
            ))
          ) : (
            <div className="no-notifications">
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
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p>No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
