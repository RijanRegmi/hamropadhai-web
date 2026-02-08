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
      path: "/teacher/dashboard/routine",
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
      path: "/teacher/dashboard/assignment",
      bgColor: "#DBEAFE",
      iconColor: "#3B82F6",
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
      path: "/teacher/dashboard/exam",
      bgColor: "#FEE2E2",
      iconColor: "#EF4444",
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
      path: "/teacher/dashboard/calendar",
      bgColor: "#E0E7FF",
      iconColor: "#6366F1",
    },
    {
      id: "announcement",
      title: "Announcement",
      description: "Latest announcements",
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
      path: "/teacher/dashboard/announcement",
      bgColor: "#FFEDD5",
      iconColor: "#F97316",
    },
    {
      id: "library",
      title: "Library",
      description: "Browse library resources",
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      path: "/teacher/dashboard/library",
      bgColor: "#D1FAE5",
      iconColor: "#10B981",
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
              onClick={() => {
                if (item.id === "routine") {
                  router.push(item.path);
                } else {
                  toast("Feature coming soon!", {
                    icon: "🚀",
                    style: { background: "#3b82f6", color: "#fff" },
                  });
                }
              }}
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
