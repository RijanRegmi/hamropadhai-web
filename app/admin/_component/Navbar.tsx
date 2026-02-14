"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { handleLogout } from "../../../lib/actions/auth-action";
import { getProfileData } from "../../../lib/actions/profile-action";
import { getNotificationUnreadCountAction } from "../../../lib/actions/notification-action";
import { useTransition } from "react";
import toast from "react-hot-toast";
import HamroPadhai from "../../../assets/images/HamroPadhai.png";
import NotificationPopup from "./NotificationPopup";
import "./navbar.css";

interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  phone: string;
  gender: string;
  role: string;
  profileImage: string | null;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchProfile();
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60_000);
    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    try {
      const result = await getProfileData();
      if (result.success) setProfile(result.data);
    } catch {}
  };

  const fetchUnreadCount = async () => {
    try {
      const result = await getNotificationUnreadCountAction();
      if (result.success) setUnreadCount(result.data?.unreadCount || 0);
    } catch {}
  };

  const onLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    startTransition(async () => {
      try {
        const result = await handleLogout();
        if (result.success) {
          toast.success("Logged out successfully!");
          router.push("/login");
        } else {
          toast.error("Failed to logout");
        }
      } catch {
        toast.error("An error occurred during logout");
      }
    });
  };

  const profileImageUrl = profile?.profileImage
    ? `http://localhost:5050${profile.profileImage}`
    : null;

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* ── Desktop Navbar ── */}
      <header className="navbar desktop-navbar">
        <div className="navbar-container">
          <div
            className="navbar-brand"
            onClick={() => router.push("/admin/dashboard")}
          >
            <Image src={HamroPadhai} alt="HamroPadhai" />
          </div>

          <div className="navbar-actions">
            <button
              className="navbar-notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <svg
                width="24"
                height="24"
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
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <div className="navbar-profile-wrapper">
              <button
                className="navbar-profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="navbar-profile-img"
                  />
                ) : (
                  <div className="navbar-profile-placeholder">
                    <svg
                      width="20"
                      height="20"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
                <div className="navbar-profile-info">
                  <span className="navbar-profile-name">
                    {profile?.fullName || "User"}
                  </span>
                  <span className="navbar-profile-role">
                    {profile?.role || "Student"}
                  </span>
                </div>
                <svg
                  className={`navbar-dropdown-arrow ${showProfileMenu ? "open" : ""}`}
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showProfileMenu && (
                <div className="navbar-dropdown-menu">
                  <button
                    className="navbar-dropdown-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push("/admin/dashboard/profile");
                    }}
                  >
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    View Profile
                  </button>
                  <button
                    className="navbar-dropdown-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      toast("Feature coming soon!", {
                        icon: "🚀",
                        style: { background: "#3b82f6", color: "#fff" },
                      });
                    }}
                  >
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
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </button>
                  <div className="navbar-dropdown-divider" />
                  <button
                    className="navbar-dropdown-item logout"
                    onClick={onLogout}
                    disabled={isPending}
                  >
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
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    {isPending ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {showProfileMenu && (
          <div
            className="navbar-overlay"
            onClick={() => setShowProfileMenu(false)}
          />
        )}
      </header>

      {/* ── Mobile Top Header ── */}
      <header className="mobile-top-header">
        <div className="mobile-header-container">
          <button className="mobile-back-btn" onClick={() => router.back()}>
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div
            className="mobile-header-brand"
            onClick={() => router.push("/admin/dashboard")}
          >
            <Image src={HamroPadhai} alt="HamroPadhai" />
          </div>
          <button
            className="mobile-notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg
              width="22"
              height="22"
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
            {unreadCount > 0 && (
              <span className="mobile-notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-item ${isActive("/admin/dashboard") ? "active" : ""}`}
          onClick={() => router.push("/admin/dashboard")}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span>Home</span>
        </button>
        <button
          className={`mobile-nav-item ${isActive("/admin/dashboard/calendar") ? "active" : ""}`}
          onClick={() => router.push("/admin/dashboard/calendar")}
        >
          <svg
            width="24"
            height="24"
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
          <span>Calendar</span>
        </button>
        <button
          className={`mobile-nav-item ${isActive("/admin/dashboard/profile") ? "active" : ""}`}
          onClick={() => router.push("/admin/dashboard/profile")}
        >
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="Profile"
              className="mobile-nav-profile-img"
            />
          ) : (
            <div className="mobile-nav-profile-placeholder">
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
          <span>Profile</span>
        </button>
      </nav>

      {/* ── Notification Popup ── role="user" for correct redirect URLs ── */}
      <NotificationPopup
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onUnreadChange={(count) => setUnreadCount(count)}
        role="user"
      />
    </>
  );
}
