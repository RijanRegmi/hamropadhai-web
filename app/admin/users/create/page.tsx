"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserAction } from "./../../../../lib/actions/admin-action";
import toast from "react-hot-toast";
import "./user-form.css";

export default function CreateUserPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      if (
        !form.fullName ||
        !form.username ||
        !form.email ||
        !form.phone ||
        !form.password
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      const result = await createUserAction(form, profileImage);

      if (!result.success) {
        toast.error(result.message || "Failed to create user");
        return;
      }

      toast.success(result.message || "User created successfully!");
      setTimeout(() => {
        router.push("/admin/users");
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsSaving(false);
    }
  };

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
              {isSaving ? "Creating..." : "Create User"}
            </button>
          </div>
        </div>
      </header>

      <main className="uf-content">
        <div className="uf-card">
          <h2 className="uf-card-title">Create New User</h2>
          <p className="uf-card-sub">
            Fill in the details to create a new user
          </p>

          {/* Profile Image Upload */}
          <div className="uf-image-section">
            <label className="uf-label">Profile Image (Optional)</label>
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
                placeholder="John Doe"
                maxLength={50}
              />
            </div>

            <div className="uf-field">
              <label className="uf-label">Username *</label>
              <input
                className="uf-input"
                name="username"
                value={form.username}
                onChange={onChange}
                placeholder="johndoe"
                autoCapitalize="none"
                autoComplete="username"
                maxLength={20}
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.toLowerCase();
                }}
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
                placeholder="john@example.com"
                maxLength={64}
              />
            </div>

            <div className="uf-field">
              <label className="uf-label">Phone *</label>
              <input
                className="uf-input"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="+977 9800000000"
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^0-9]/g, "");
                }}
              />
            </div>

            <div className="uf-field">
              <label className="uf-label">Password *</label>
              <input
                className="uf-input"
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                maxLength={35}
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
                placeholder="About this user"
                maxLength={60}
              />
            </div>

            <div className="uf-field">
              <label className="uf-label">Class</label>
              <input
                className="uf-input"
                name="classId"
                value={form.classId}
                onChange={onChange}
                placeholder="class"
                maxLength={20}
              />
            </div>

            <div className="uf-field">
              <label className="uf-label">Section</label>
              <input
                className="uf-input"
                name="sectionId"
                value={form.sectionId}
                onChange={onChange}
                placeholder="Section"
                maxLength={20}
              />
            </div>

            <div className="uf-field">
              <label className="uf-label">Address</label>
              <input
                className="uf-input"
                name="address"
                value={form.address}
                onChange={onChange}
                placeholder="Kathmandu, Nepal"
                maxLength={35}
              />
            </div>

            <div className="uf-field">
              <label className="uf-label">Parent Contact</label>
              <input
                className="uf-input"
                name="parentContact"
                value={form.parentContact}
                onChange={onChange}
                placeholder="+977 9800000001"
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/[^0-9]/g, "");
                }}
              />
            </div>
          </div>

          <div className="uf-required-note">* Required fields</div>
        </div>
      </main>
    </div>
  );
}
