"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getProfileData } from "../../../../lib/actions/profile-action";
import "./profile.css";
import { handleLogout } from "../../../../lib/actions/auth-action";
import HamroPadhai from "./../../../../assets/images/HamroPadhai.png";
import { startTransition } from "react";
import toast from "react-hot-toast";
import Navbar from "../../_component/Navbar";

interface TeacherProfile {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  phone: string;
  gender: string;
  role: string;
  profileImage: string | null;
  about?: string;
  address?: string;
}

export default function TeacherProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const result = await getProfileData();
      if (!result.success) {
        toast.error("Failed to load profile. Redirecting to login...");
        router.push("/login");
        return;
      }
      setProfile(result.data);
    } catch {
      toast.error("An error occurred while loading your profile");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const onLogout = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await handleLogout();
        if (result.success) {
          toast.success("Logged out successfully!");
          router.push("/login");
        } else {
          toast.error("Failed to logout. Please try again.");
        }
      } catch (error) {
        toast.error("An error occurred during logout");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="teacher-profile-page">
        <header className="teacher-profile-page-header">
          <div className="teacher-header-container">
            <button
              onClick={() => router.push("/teacher/dashboard")}
              className="teacher-back-button teacher-desktop-only-back"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="teacher-back-text">Back to Dashboard</span>
            </button>

            <div className="teacher-brand-section teacher-centered-brand">
              <Image src={HamroPadhai} alt="HamroPadhai" />
            </div>
          </div>
        </header>

        <main className="teacher-profile-content">
          <div className="teacher-profile-card">
            <div className="teacher-profile-banner"></div>
            <div className="teacher-avatar-section">
              <div className="teacher-avatar-wrapper">
                <div className="teacher-profile-avatar-placeholder">
                  <svg
                    width="60"
                    height="60"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
            </div>
            <h2 className="teacher-profile-name">Loading... | Teacher</h2>
            <p className="teacher-profile-username">@...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) return null;

  const profileImageUrl = profile.profileImage
    ? `http://localhost:5050${profile.profileImage}`
    : null;

  return (
    <div className="teacher-profile-page">
      {/* Header */}
      <header className="teacher-profile-page-header">
        <div className="teacher-header-container">
          <button
            onClick={() => router.push("/teacher/dashboard")}
            className="teacher-back-button teacher-desktop-only-back"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="teacher-back-text">Back to Dashboard</span>
          </button>

          <div className="teacher-brand-section teacher-centered-brand">
            <Image src={HamroPadhai} alt="HamroPadhai" />
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Layout */}
      <main className="teacher-profile-content teacher-mobile-layout">
        <div className="teacher-profile-card">
          <div className="teacher-profile-banner"></div>

          <div className="teacher-avatar-section">
            <div
              className="teacher-avatar-wrapper"
              onClick={() => profileImageUrl && setShowImageModal(true)}
              style={{ cursor: profileImageUrl ? "pointer" : "default" }}
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={profile.fullName}
                  className="teacher-profile-avatar-img"
                />
              ) : (
                <div className="teacher-profile-avatar-placeholder">
                  <svg
                    width="60"
                    height="60"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <h2 className="teacher-profile-name">{profile.fullName} - Teacher</h2>
          <p className="teacher-profile-username">@{profile.username}</p>

          <div className="teacher-info-rows">
            <div className="teacher-info-row">
              <div className="teacher-info-row-icon teacher-info-icon-email">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="teacher-info-row-text">
                <span className="teacher-info-row-label">Email</span>
                <span className="teacher-info-row-value">{profile.email}</span>
              </div>
            </div>

            <div className="teacher-info-row">
              <div className="teacher-info-row-icon teacher-info-icon-phone">
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div className="teacher-info-row-text">
                <span className="teacher-info-row-label">Phone</span>
                <span className="teacher-info-row-value">{profile.phone}</span>
              </div>
            </div>

            <div className="teacher-info-row">
              <div className="teacher-info-row-icon teacher-info-icon-institution">
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="teacher-info-row-text">
                <span className="teacher-info-row-label">Address</span>
                <span className="teacher-info-row-value">HamroPadhai</span>
              </div>
            </div>

            <div className="teacher-info-row">
              <div className="teacher-info-row-icon teacher-info-icon-username">
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
              </div>
              <div className="teacher-info-row-text">
                <span className="teacher-info-row-label">Username</span>
                <span className="teacher-info-row-value">
                  {profile.username}
                </span>
              </div>
            </div>
          </div>

          <div className="teacher-action-buttons">
            <button
              className="teacher-action-btn"
              onClick={() =>
                router.push("/teacher/dashboard/profile/editdetail")
              }
            >
              <div className="teacher-action-btn-icon teacher-action-icon-blue">
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div className="teacher-action-btn-text">
                <span className="teacher-action-btn-title">Edit Profile</span>
                <span className="teacher-action-btn-sub">
                  Update your information
                </span>
              </div>
              <svg
                className="teacher-action-btn-arrow"
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

            <button
              className="teacher-action-btn"
              onClick={() => router.push("/teacher/dashboard/profile/settings")}
            >
              <div className="teacher-action-btn-icon teacher-action-icon-orange">
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="teacher-action-btn-text">
                <span className="teacher-action-btn-title">Settings</span>
                <span className="teacher-action-btn-sub">
                  Update password and preferences
                </span>
              </div>
              <svg
                className="teacher-action-btn-arrow"
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

            <button
              className="teacher-action-btn"
              onClick={() =>
                toast("Feature coming soon!", {
                  icon: "🚀",
                  style: {
                    background: "#3b82f6",
                    color: "#fff",
                  },
                })
              }
            >
              <div className="teacher-action-btn-icon teacher-action-icon-teal">
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
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="teacher-action-btn-text">
                <span className="teacher-action-btn-title">Support</span>
                <span className="teacher-action-btn-sub">
                  Get help and support
                </span>
              </div>
              <svg
                className="teacher-action-btn-arrow"
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
          </div>

          <form action={onLogout}>
            <button className="teacher-logout-button">
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
              Logout
            </button>
          </form>
        </div>
        <Navbar />
      </main>

      {/* Desktop Layout */}
      <main className="teacher-profile-content teacher-desktop-layout">
        <div className="teacher-profile-card-desktop">
          {/* Header Section */}
          <div className="teacher-desktop-header-section">
            <div className="teacher-profile-banner-desktop"></div>
            <div className="teacher-desktop-profile-header">
              <div className="teacher-desktop-avatar-wrapper">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={profile.fullName}
                    className="teacher-desktop-avatar-img"
                    onClick={() => setShowImageModal(true)}
                    style={{ cursor: "pointer" }}
                  />
                ) : (
                  <div className="teacher-desktop-avatar-placeholder">
                    <svg
                      width="80"
                      height="80"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="teacher-desktop-profile-info">
                <h1 className="teacher-desktop-profile-name">
                  {profile.fullName} - Teacher
                </h1>
                <p className="teacher-desktop-profile-username">
                  @{profile.username}
                </p>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="teacher-desktop-content-grid">
            {/* Left Column - Info Cards */}
            <div className="teacher-desktop-info-column">
              <div className="teacher-desktop-info-card">
                <div className="teacher-desktop-info-icon teacher-info-icon-email">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="teacher-desktop-info-text">
                  <span className="teacher-desktop-info-label">Email</span>
                  <span className="teacher-desktop-info-value">
                    {profile.email}
                  </span>
                </div>
              </div>

              <div className="teacher-desktop-info-card">
                <div className="teacher-desktop-info-icon teacher-info-icon-phone">
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div className="teacher-desktop-info-text">
                  <span className="teacher-desktop-info-label">Phone</span>
                  <span className="teacher-desktop-info-value">
                    {profile.phone}
                  </span>
                </div>
              </div>

              <div className="teacher-desktop-info-card">
                <div className="teacher-desktop-info-icon teacher-info-icon-institution">
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div className="teacher-desktop-info-text">
                  <span className="teacher-desktop-info-label">
                    Institution
                  </span>
                  <span className="teacher-desktop-info-value">
                    HamroPadhai
                  </span>
                </div>
              </div>

              <div className="teacher-desktop-info-card">
                <div className="teacher-desktop-info-icon teacher-info-icon-username">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="teacher-desktop-info-text">
                  <span className="teacher-desktop-info-label">Username</span>
                  <span className="teacher-desktop-info-value">
                    {profile.username}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Action Buttons */}
            <div className="teacher-desktop-actions-column">
              <button
                className="teacher-desktop-action-btn"
                onClick={() =>
                  router.push("/teacher/dashboard/profile/editdetail")
                }
              >
                <div className="teacher-desktop-action-icon teacher-action-icon-blue">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div className="teacher-desktop-action-text">
                  <span className="teacher-desktop-action-title">
                    Edit Profile
                  </span>
                  <span className="teacher-desktop-action-sub">
                    Update your information
                  </span>
                </div>
                <svg
                  className="teacher-desktop-action-arrow"
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

              <button
                className="teacher-desktop-action-btn"
                onClick={() =>
                  router.push("/teacher/dashboard/profile/settings")
                }
              >
                <div className="teacher-desktop-action-icon teacher-action-icon-orange">
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="teacher-desktop-action-text">
                  <span className="teacher-desktop-action-title">Settings</span>
                  <span className="teacher-desktop-action-sub">
                    Update password and preferences
                  </span>
                </div>
                <svg
                  className="teacher-desktop-action-arrow"
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

              <button
                className="teacher-desktop-action-btn"
                onClick={() =>
                  toast("Feature coming soon!", {
                    icon: "🚀",
                    style: {
                      background: "#3b82f6",
                      color: "#fff",
                    },
                  })
                }
              >
                <div className="teacher-desktop-action-icon teacher-action-icon-teal">
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
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className="teacher-desktop-action-text">
                  <span className="teacher-desktop-action-title">Support</span>
                  <span className="teacher-desktop-action-sub">
                    Get help and support
                  </span>
                </div>
                <svg
                  className="teacher-desktop-action-arrow"
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

              <form action={onLogout} className="teacher-desktop-logout-form">
                <button className="teacher-desktop-logout-button">
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
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Full Screen Image Modal */}
      {showImageModal && profileImageUrl && (
        <div
          className="teacher-image-modal"
          onClick={() => setShowImageModal(false)}
        >
          <button
            className="teacher-modal-close-btn"
            onClick={() => setShowImageModal(false)}
          >
            <svg
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <img
            src={profileImageUrl}
            alt="Profile Full Screen"
            className="teacher-modal-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
