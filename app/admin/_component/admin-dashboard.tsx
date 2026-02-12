"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfileData } from "../../../lib/actions/profile-action";
import toast from "react-hot-toast";
import Navbar from "./Navbar";
import "./dashboard.css";

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

interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  bgColor: string;
  iconColor: string;
  isActive?: boolean; // Flag to indicate if route is active
}

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const result = await getProfileData();
      if (!result.success) {
        toast.error("Failed to load profile");
        router.push("/login");
        return;
      }
      setProfile(result.data);
    } catch {
      toast.error("An error occurred");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.isActive) {
      // Navigate to the route for active items
      router.push(item.path);
    } else {
      // Show coming soon toast for inactive items
      toast("Feature coming soon!", {
        icon: "🚀",
        style: { background: "#3b82f6", color: "#fff" },
      });
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: "routine",
      title: "Routine",
      description: "View your class schedule",
      icon: (
        <svg
          width="28"
          height="28"
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
      path: "/admin/dashboard/routines",
      bgColor: "#FEF3C7",
      iconColor: "#F59E0B",
      isActive: true,
    },
    {
      id: "assignment",
      title: "Assignment",
      description: "Check your assignments",
      icon: (
        <svg
          width="28"
          height="28"
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
      path: "/admin/dashboard/assignments",
      bgColor: "#DBEAFE",
      iconColor: "#3B82F6",
      isActive: true,
    },
    {
      id: "exam",
      title: "Exam",
      description: "Upcoming exams & results",
      icon: (
        <svg
          width="28"
          height="28"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      path: "/admin/dashboard/exam",
      bgColor: "#FEE2E2",
      iconColor: "#EF4444",
      isActive: false,
    },
    {
      id: "calendar",
      title: "Calendar",
      description: "View academic calendar",
      icon: (
        <svg
          width="28"
          height="28"
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
      path: "/admin/dashboard/calendar",
      bgColor: "#E0E7FF",
      iconColor: "#6366F1",
      isActive: false,
    },
    {
      id: "notice",
      title: "Notice",
      description: "Latest notices",
      icon: (
        <svg
          width="28"
          height="28"
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
      path: "/admin/dashboard/notice",
      bgColor: "#FFEDD5",
      iconColor: "#F97316",
      isActive: true,
    },
    {
      id: "user",
      title: "User",
      description: "Browse user resources",
      icon: (
        <svg
          width="28"
          height="28"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      path: "/admin/users",
      bgColor: "#D1FAE5",
      iconColor: "#10B981",
      isActive: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Welcome Section - Now visible on mobile too */}
        <div className="dashboard-welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">
              Welcome back, {profile?.fullName || "Student"}!
            </h1>
            <p className="welcome-subtitle">
              Here's what's happening with your studies today.
            </p>
          </div>
        </div>

        {/* Menu Grid - 3x3 Layout */}
        <div className="dashboard-menu-grid">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className="dashboard-menu-card"
              onClick={() => handleMenuClick(item)}
            >
              <div
                className="menu-card-icon"
                style={{ background: item.bgColor, color: item.iconColor }}
              >
                {item.icon}
              </div>
              <div className="menu-card-content">
                <span className="menu-card-title">{item.title}</span>
                <span className="menu-card-description">
                  {item.description}
                </span>
              </div>
              <svg
                className="menu-card-arrow"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
