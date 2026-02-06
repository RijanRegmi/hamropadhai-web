"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  getProfileData,
  updateProfileAction,
} from "../../../../../lib/actions/profile-action";
import "./editdetail.css";
import book from "./../../../../../assets/images/books.png";
import HamroPadhai from "./../../../../../assets/images/HamroPadhai.png";
import Image from "next/image";

interface UserProfile {
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
  parentContact?: string;
}

export default function EditDetailPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    about: "",
    gender: "male",
    address: "",
    contactNumber: "",
    parentContact: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const result = await getProfileData();
      if (!result.success) {
        toast.error("Please login to continue");
        router.push("/login");
        return;
      }
      setProfile(result.data);
      setForm({
        fullName: result.data.fullName || "",
        about: result.data.about || "",
        gender: result.data.gender || "male",
        address: result.data.address || "",
        contactNumber: result.data.phone || "",
        parentContact: result.data.parentContact || "",
      });
    } catch {
      toast.error("Failed to load profile");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const result = await updateProfileAction({
        fullName: form.fullName,
        phone: form.contactNumber,
        gender: form.gender as "male" | "female",
        about: form.about,
        address: form.address,
        parentContact: form.parentContact,
      });

      if (!result.success) {
        toast.error(result.message || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully!");
      setTimeout(() => {
        router.push("/dashboard/profile");
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="ed-page">
        <header className="ed-header">
          <div className="ed-header-inner">
            <div className="ed-brand">
              <div className="ed-brand-logo">📚</div>
              <span className="ed-brand-title">HamroPadhai</span>
            </div>
          </div>
        </header>
        <div className="ed-loading">
          <div className="ed-spinner"></div>
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="ed-page">
      <header className="ed-header">
        <div className="ed-header-inner">
          <div className="ed-brand">
            <div className="ed-brand-logo">📚</div>
            <span className="ed-brand-title">HamroPadhai</span>
          </div>
          <div className="ed-header-actions">
            <button
              className="ed-btn-cancel"
              onClick={() => router.push("/dashboard/profile")}
            >
              Cancel
            </button>
            <button
              className="ed-btn-save"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </header>

      <main className="ed-content">
        <div className="ed-card">
          <h2 className="ed-card-title">Edit Profile</h2>
          <p className="ed-card-sub">Update your personal information below</p>

          <div className="ed-form-grid">
            <div className="ed-field">
              <label className="ed-label">Full Name</label>
              <input
                className="ed-input"
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                maxLength={50}
              />
            </div>

            <div className="ed-field">
              <label className="ed-label">About</label>
              <input
                className="ed-input"
                name="about"
                value={form.about}
                onChange={onChange}
                placeholder="About you"
                maxLength={60}
              />
            </div>

            <div className="ed-field">
              <label className="ed-label">Gender</label>
              <select
                className="ed-input ed-select"
                name="gender"
                value={form.gender}
                onChange={onChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="ed-field">
              <label className="ed-label">Address</label>
              <input
                className="ed-input"
                name="address"
                value={form.address}
                onChange={onChange}
                placeholder="Address"
                maxLength={60}
              />
            </div>

            <div className="ed-field">
              <label className="ed-label">Contact Number</label>
              <input
                className="ed-input"
                name="contactNumber"
                value={form.contactNumber}
                onChange={onChange}
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^0-9]/g, "");
                }}
              />
            </div>

            <div className="ed-field">
              <label className="ed-label">Parent Contact</label>
              <input
                className="ed-input"
                name="parentContact"
                value={form.parentContact}
                onChange={onChange}
                placeholder="Parent contact"
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^0-9]/g, "");
                }}
              />
            </div>
          </div>

          {/* email (read-only) */}
          <div className="ed-field ed-field-full">
            <label className="ed-label">My email Address</label>
            <div className="ed-email-display">
              <svg width="20" height="20" fill="#6366f1" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span>{profile.email}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
