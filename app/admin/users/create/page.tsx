"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserAction } from "./../../../../lib/actions/admin-action";
import toast from "react-hot-toast";
import "./user-form.css";

const CLASSES = ["11", "12"];
const SECTIONS = ["A", "B", "C", "D", "E"];

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

  // For teacher multi-select
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Reset class/section selections when role changes
    if (name === "role") {
      setSelectedClasses([]);
      setSelectedSections([]);
      setForm((prev) => ({ ...prev, classId: "", sectionId: "" }));
    }
  };

  const toggleClass = (cls: string) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls],
    );
  };

  const toggleSection = (sec: string) => {
    setSelectedSections((prev) =>
      prev.includes(sec) ? prev.filter((s) => s !== sec) : [...prev, sec],
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

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

      // Role-specific validation and data preparation
      let finalClassId = "";
      let finalSectionId = "";

      if (form.role === "teacher") {
        if (selectedClasses.length === 0 || selectedSections.length === 0) {
          toast.error(
            "Please select at least one class and section for teacher",
          );
          return;
        }
        // Store as JSON string for teachers
        finalClassId = JSON.stringify(selectedClasses);
        finalSectionId = JSON.stringify(selectedSections);
      } else if (form.role === "user") {
        if (!form.classId || !form.sectionId) {
          toast.error("Please select class and section for student");
          return;
        }
        // Store as single values for students
        finalClassId = form.classId;
        finalSectionId = form.sectionId;
      }
      // Admin role: leave classId and sectionId empty

      const result = await createUserAction(
        { ...form, classId: finalClassId, sectionId: finalSectionId },
        profileImage,
      );

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
                <option value="user">Student</option>
                <option value="teacher">Teacher</option>
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
          </div>

          {/* Class and Section Selection - Role-based */}
          {form.role === "teacher" && (
            <div className="uf-multi-select-section">
              <div className="uf-multi-select-group">
                <label className="uf-label uf-label-multi">
                  Classes (Select one or more) *
                </label>
                <div className="uf-checkbox-grid">
                  {CLASSES.map((cls) => (
                    <label key={cls} className="uf-checkbox-card">
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(cls)}
                        onChange={() => toggleClass(cls)}
                        className="uf-checkbox-input"
                      />
                      <div className="uf-checkbox-content">
                        <div className="uf-checkbox-icon">
                          {selectedClasses.includes(cls) && (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span className="uf-checkbox-label">Class {cls}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="uf-multi-select-group">
                <label className="uf-label uf-label-multi">
                  Sections (Select one or more) *
                </label>
                <div className="uf-checkbox-grid">
                  {SECTIONS.map((sec) => (
                    <label key={sec} className="uf-checkbox-card">
                      <input
                        type="checkbox"
                        checked={selectedSections.includes(sec)}
                        onChange={() => toggleSection(sec)}
                        className="uf-checkbox-input"
                      />
                      <div className="uf-checkbox-content">
                        <div className="uf-checkbox-icon">
                          {selectedSections.includes(sec) && (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span className="uf-checkbox-label">Section {sec}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {form.role === "user" && (
            <div className="uf-form-grid" style={{ marginTop: "24px" }}>
              <div className="uf-field">
                <label className="uf-label">Class *</label>
                <select
                  className="uf-input uf-select"
                  name="classId"
                  value={form.classId}
                  onChange={onChange}
                >
                  <option value="">Select Class</option>
                  {CLASSES.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="uf-field">
                <label className="uf-label">Section *</label>
                <select
                  className="uf-input uf-select"
                  name="sectionId"
                  value={form.sectionId}
                  onChange={onChange}
                >
                  <option value="">Select Section</option>
                  {SECTIONS.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {form.role === "admin" && (
            <div className="uf-info-box">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Admin users don't require class or section assignment</span>
            </div>
          )}

          <div
            className="uf-form-grid"
            style={{ marginTop: form.role === "admin" ? "24px" : "0" }}
          >
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
