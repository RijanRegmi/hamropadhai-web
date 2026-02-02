"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getUserByIdAction,
  updateUserAction,
} from "./../../../../../lib/actions/admin-action";
import "./user-form.css";

interface User {
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
  classId?: string;
  sectionId?: string;
  parentContact?: string;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    gender: "male",
    role: "user",
    about: "",
    classId: "",
    sectionId: "",
    address: "",
    parentContact: "",
  });

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const result = await getUserByIdAction(userId);
      if (!result.success) {
        alert(result.message || "Failed to fetch user");
        router.push("/admin/users");
        return;
      }
      setUser(result.data);
      setForm({
        fullName: result.data.fullName || "",
        username: result.data.username || "",
        email: result.data.email || "",
        phone: result.data.phone || "",
        password: "",
        gender: result.data.gender || "male",
        role: result.data.role || "user",
        about: result.data.about || "",
        classId: result.data.classId || "",
        sectionId: result.data.sectionId || "",
        address: result.data.address || "",
        parentContact: result.data.parentContact || "",
      });
      if (result.data.profileImage) {
        setPreviewUrl(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"}${result.data.profileImage}`,
        );
      }
    } catch (error: any) {
      alert(error.message || "Failed to fetch user");
      router.push("/admin/users");
    } finally {
      setIsLoading(false);
    }
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);

      // Validation
      if (!form.fullName || !form.username || !form.email || !form.phone) {
        alert("Please fill in all required fields");
        return;
      }

      const result = await updateUserAction(userId, form, profileImage);

      if (!result.success) {
        alert(result.message || "Failed to update user");
        return;
      }

      alert("User updated successfully!");
      router.push("/admin/users");
    } catch (error: any) {
      alert(error.message || "Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="uf-page">
        <header className="uf-header">
          <div className="uf-header-inner">
            <div className="uf-brand">
              <div className="uf-brand-logo">📚</div>
              <span className="uf-brand-title">HamroPadhai Admin</span>
            </div>
          </div>
        </header>
        <div className="uf-loading">
          <div className="uf-spinner"></div>
          <p>Loading user...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="uf-page">
      <header className="uf-header">
        <div className="uf-header-inner">
          <div className="uf-brand">
            <div className="uf-brand-logo">📚</div>
            <span className="uf-brand-title">HamroPadhai Admin</span>
          </div>
          <div className="uf-header-actions">
            <button
              className="uf-btn-cancel"
              onClick={() => router.push("/admin/users")}
            >
              Cancel
            </button>
            <button
              className="uf-btn-save"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </header>

      <main className="uf-content">
        <div className="uf-card">
          <h2 className="uf-card-title">Edit User</h2>
          <p className="uf-card-sub">Update user information</p>

          {/* Profile Image Upload */}
          <div className="uf-image-section">
            <label className="uf-label">Profile Image</label>
            <div className="uf-image-upload">
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                className="uf-image-input"
              />
              <label htmlFor="profileImage" className="uf-image-label">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="uf-image-preview"
                  />
                ) : (
                  <div className="uf-image-placeholder">
                    <svg
                      width="40"
                      height="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>Click to upload image</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="uf-form-grid">
            <div className="uf-field">
              <label className="uf-label">Full Name *</label>
              <input
                className="uf-input"
                name="fullName"
                value={form.fullName}
                onChange={onChange}
              />
            </div>

            <div className="uf-field">
              <label className="uf-label">Username *</label>
              <input
                className="uf-input"
                name="username"
                value={form.username}
                onChange={onChange}
              />
            </div>

            <div className="uf-field">
              <label className="uf-label">Email *</label>
              <input
                className="uf-input"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
              />
            </div>

            <div className="uf-field">
              <label className="uf-label">Phone *</label>
              <input
                className="uf-input"
                name="phone"
                value={form.phone}
                onChange={onChange}
              />
            </div>

            <div className="uf-field">
              <label className="uf-label">
                Password (leave empty to keep current)
              </label>
              <input
                className="uf-input"
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
              />
            </div>

            <div className="uf-field">
              <label className="uf-label">Gender *</label>
              <select
                className="uf-input uf-select"
                name="gender"
                value={form.gender}
                onChange={onChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="uf-field">
              <label className="uf-label">Role *</label>
              <select
                className="uf-input uf-select"
                name="role"
                value={form.role}
                onChange={onChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="uf-field">
              <label className="uf-label">About</label>
              <input
                className="uf-input"
                name="about"
                value={form.about}
                onChange={onChange}
              />
            </div>

            <div className="uf-field">
              <label className="uf-label">Class</label>
              <input
                className="uf-input"
                name="classId"
                value={form.classId}
                onChange={onChange}
              />
            </div>

            <div className="uf-field">
              <label className="uf-label">Section</label>
              <input
                className="uf-input"
                name="sectionId"
                value={form.sectionId}
                onChange={onChange}
              />
            </div>

            <div className="uf-field">
              <label className="uf-label">Address</label>
              <input
                className="uf-input"
                name="address"
                value={form.address}
                onChange={onChange}
              />
            </div>

            <div className="uf-field">
              <label className="uf-label">Parent Contact</label>
              <input
                className="uf-input"
                name="parentContact"
                value={form.parentContact}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="uf-required-note">* Required fields</div>
        </div>
      </main>
    </div>
  );
}
