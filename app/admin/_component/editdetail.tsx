"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  getProfileData,
  updateProfileAction,
  uploadProfileImageAction,
} from "./../../../lib/actions/profile-action";

import "./editdetail.css";
import book from "./../../../assets/images/books.png";
import HamroPadhai from "./../../../assets/images/HamroPadhai.png";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New state for image preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Store the file for later upload
    setSelectedFile(file);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // First, upload the image if a new one was selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("profileImage", selectedFile);

        const imageResult = await uploadProfileImageAction(formData);

        if (!imageResult.success) {
          toast.error(imageResult.message || "Failed to upload image");
          setIsSaving(false);
          return;
        }
      }

      // Then update the profile data
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

      // Clear preview and selected file
      setPreviewImage(null);
      setSelectedFile(null);

      router.push("/admin/dashboard/profile");
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
              <div className="ed-brand-logo">
                <Image src={book} alt="Logo" />
              </div>
              <Image src={HamroPadhai} alt="HamroPadhai" />
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

  const profileImageUrl = profile.profileImage
    ? `http://localhost:5050${profile.profileImage}`
    : null;

  // Use preview image if available, otherwise use the profile image
  const displayImage = previewImage || profileImageUrl;

  return (
    <div className="ed-page">
      <header className="ed-header">
        <div className="ed-header-inner">
          <div className="ed-brand">
            <div className="ed-brand-logo">
              <Image src={book} alt="Logo" />
            </div>
            <Image src={HamroPadhai} alt="HamroPadhai" />
          </div>
        </div>
      </header>

      <main className="ed-content">
        <div className="ed-card">
          <h2 className="ed-card-title">Edit Profile</h2>
          <p className="ed-card-sub">Update your personal information below</p>

          {/* Desktop Layout */}
          <div className="ed-desktop-layout">
            {/* Left Side - Profile Photo */}
            <div className="ed-profile-section">
              <div className="ed-avatar-wrapper" onClick={handleImageClick}>
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={profile.fullName}
                    className="ed-avatar-img"
                  />
                ) : (
                  <div className="ed-avatar-placeholder">
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

                <div className="ed-camera-btn">
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="ed-file-input-hidden"
                />
              </div>

              <p className="ed-profile-name">{profile.fullName}</p>
              <p className="ed-profile-username">@{profile.username}</p>
            </div>

            {/* Right Side - Form Fields */}
            <div className="ed-form-section">
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

              <div className="ed-field ed-field-full">
                <label className="ed-label">My email Address</label>
                <div className="ed-email-display">
                  <svg
                    width="20"
                    height="20"
                    fill="#6366f1"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  <span>{profile.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="ed-mobile-layout">
            {/* Profile Photo at Top */}
            <div className="ed-mobile-profile-section">
              <div className="ed-avatar-wrapper" onClick={handleImageClick}>
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={profile.fullName}
                    className="ed-avatar-img"
                  />
                ) : (
                  <div className="ed-avatar-placeholder">
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

                <div className="ed-camera-btn">
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="ed-file-input-hidden"
                />
              </div>

              <p className="ed-profile-name">{profile.fullName}</p>
              <p className="ed-profile-username">@{profile.username}</p>
            </div>

            {/* Form Fields Below */}
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

          <div className="ed-desktop-actions">
            <button
              className="ed-btn-save"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Updating..." : "Update"}
            </button>
            <button
              className="ed-btn-cancel"
              onClick={() => router.push("/admin/dashboard/profile")}
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
