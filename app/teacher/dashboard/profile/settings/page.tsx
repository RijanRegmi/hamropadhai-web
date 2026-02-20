"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import HamroPadhai from "./../../../../../assets/images/HamroPadhai.png";
import { handleLogout } from "./../../../../../lib/actions/auth-action";
import PageHeader from "./../../../../_components/PageHeader";
import "./settings.css";

type SidebarSection = "account" | "privacy" | "support" | "about";

const ChevronRight = () => (
  <svg
    className="chevron"
    width="18"
    height="18"
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
);

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="toggle" onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="toggle-track" />
      <div className="toggle-thumb" />
    </label>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  sub?: string;
  rightContent?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}
function SettingRow({
  icon,
  iconClass,
  title,
  sub,
  rightContent,
  onClick,
  danger,
}: SettingRowProps) {
  return (
    <button
      className={`setting-row${danger ? " danger" : ""}${!onClick ? " no-hover" : ""}`}
      onClick={onClick}
      type="button"
    >
      <div className={`row-icon ${iconClass}`}>{icon}</div>
      <div className="row-text">
        <span className={`row-title${danger ? " danger" : ""}`}>{title}</span>
        {sub && <span className="row-sub">{sub}</span>}
      </div>
      <div className="row-right">
        {rightContent ?? (onClick && <ChevronRight />)}
      </div>
    </button>
  );
}

/* ── Main Component ── */
export default function SettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SidebarSection>("account");

  // Notification toggles
  const [pushNotifs, setPushNotifs] = useState(true);
  const [assignmentReminders, setAssignmentReminders] = useState(true);

  const onLogout = () => {
    startTransition(async () => {
      try {
        const result = await handleLogout();
        if (result.success) {
          toast.success("Logged out successfully!");
          router.push("/login");
        } else {
          toast.error("Failed to logout. Please try again.");
        }
      } catch {
        toast.error("An error occurred during logout");
      }
    });
  };

  const comingSoon = (label?: string) =>
    toast(`${label ?? "Feature"} coming soon!`, {
      icon: "🚀",
      style: { background: "#6366f1", color: "#fff" },
    });

  const sidebarItems: {
    id: SidebarSection;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "account",
      label: "Account",
      icon: (
        <svg
          width="16"
          height="16"
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
      ),
    },

    {
      id: "privacy",
      label: "Privacy & Security",
      icon: (
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      id: "support",
      label: "Support",
      icon: (
        <svg
          width="16"
          height="16"
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
      ),
    },
    {
      id: "about",
      label: "About",
      icon: (
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="settings-page">
      {/* ── Header ── */}
      <header className="settings-header">
        <div className="settings-header-container">
          <button
            className="back-button"
            onClick={() => router.push("/teacher/dashboard/profile")}
          >
            <svg
              width="18"
              height="18"
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
            <span className="back-text">Back</span>
          </button>
          <div className="brand-section">
            <Image src={HamroPadhai} alt="HamroPadhai" height={32} />
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="settings-body">
        <h1 className="settings-title">Settings</h1>

        {/* Desktop Sidebar */}
        <nav className="settings-sidebar">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item${activeSection === item.id ? " active" : ""}`}
              onClick={() => setActiveSection(item.id)}
              type="button"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <div className="settings-main">
          {/* ── ACCOUNT ── */}
          <section className="settings-section" id="account">
            <p className="section-label">Account</p>
            <div className="card-group">
              <SettingRow
                icon={
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
                }
                iconClass="icon-purple"
                title="Edit Profile"
                sub="Update your personal details"
                onClick={() =>
                  router.push("/teacher/dashboard/profile/editdetail")
                }
              />
              <SettingRow
                icon={
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
                iconClass="icon-blue"
                title="Change Password"
                sub="Update your account password"
                onClick={() =>
                  router.push(
                    "/teacher/dashboard/profile/settings/change-password",
                  )
                }
              />
            </div>
          </section>

          {/* ── PRIVACY & SECURITY ── */}
          <section className="settings-section" id="privacy">
            <p className="section-label">Privacy &amp; Security</p>
            <div className="card-group">
              <SettingRow
                icon={
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
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                }
                iconClass="icon-gray"
                title="Active Sessions"
                sub="Manage devices signed in"
                onClick={() => comingSoon("Sessions")}
                rightContent={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span className="row-value">2 devices</span>
                    <ChevronRight />
                  </div>
                }
              />
            </div>
          </section>

          {/* ── SUPPORT ── */}
          <section className="settings-section" id="support">
            <p className="section-label">Support</p>
            <div className="card-group">
              <SettingRow
                icon={
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
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                }
                iconClass="icon-teal"
                title="Help Center"
                sub="FAQs and guides"
                onClick={() => comingSoon("Help Center")}
              />
              <SettingRow
                icon={
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                }
                iconClass="icon-blue"
                title="Contact Support"
                sub="Reach out to our team"
                onClick={() => comingSoon("Contact support")}
              />
            </div>
          </section>

          {/* ── ABOUT ── */}
          <section className="settings-section" id="about">
            <p className="section-label">About</p>
            <div className="card-group">
              <SettingRow
                icon={
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
                }
                iconClass="icon-green"
                title="App Name"
                sub="Your learning companion"
                rightContent={<span className="row-value">HamroPadhai</span>}
              />
              <SettingRow
                icon={
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
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                }
                iconClass="icon-indigo"
                title="Version"
                sub="Current release"
                rightContent={<span className="row-value">1.0.0</span>}
              />
              <SettingRow
                icon={
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
                }
                iconClass="icon-gray"
                title="Terms of Service"
                sub="Read our terms"
                onClick={() => comingSoon("Terms")}
              />
            </div>
          </section>

          {/* ── DANGER ZONE ── */}
          <section className="settings-section" id="danger">
            <p className="section-label">Danger Zone</p>
            <div className="card-group">
              <SettingRow
                icon={
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
                }
                iconClass="icon-red"
                title="Log Out"
                sub="Sign out of your account"
                danger
                onClick={onLogout}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
