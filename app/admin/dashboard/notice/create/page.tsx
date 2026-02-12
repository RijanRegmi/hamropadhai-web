"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createNoticeWithFilesAction } from "../../../../../lib/actions/notice-action";
import toast from "react-hot-toast";
import Image from "next/image";
import HamroPadhai from "./../../../../../assets/images/HamroPadhai.png";
import "./create-notice.css";

const CLASSES = ["11", "12"];
const SECTIONS = ["A", "B", "C", "D", "E"];
const PRIORITIES = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
];

interface ClassSectionPair {
  classId: string;
  sections: string[];
}

export default function CreateNoticePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [targetClasses, setTargetClasses] = useState<ClassSectionPair[]>([
    { classId: "", sections: [] },
  ]);

  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      const invalidFiles = newFiles.filter(
        (file) => file.size > 10 * 1024 * 1024,
      );
      if (invalidFiles.length > 0) {
        toast.error("Some files exceed 10MB limit");
        return;
      }

      if (attachments.length + newFiles.length > 10) {
        toast.error("Maximum 10 files allowed");
        return;
      }

      setAttachments((prev) => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) added`);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    toast.success("File removed");
  };

  const addClassSection = () => {
    setTargetClasses((prev) => [...prev, { classId: "", sections: [] }]);
  };

  const removeClassSection = (index: number) => {
    setTargetClasses((prev) => prev.filter((_, i) => i !== index));
  };

  const updateClassId = (index: number, classId: string) => {
    setTargetClasses((prev) =>
      prev.map((tc, i) =>
        i === index ? { ...tc, classId, sections: [] } : tc,
      ),
    );
  };

  const toggleSection = (classIndex: number, section: string) => {
    setTargetClasses((prev) =>
      prev.map((tc, i) => {
        if (i !== classIndex) return tc;
        const sections = tc.sections.includes(section)
          ? tc.sections.filter((s) => s !== section)
          : [...tc.sections, section];
        return { ...tc, sections };
      }),
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);

      const missingFields: string[] = [];
      if (!form.title.trim()) missingFields.push("Title");
      if (!form.content.trim()) missingFields.push("Content");

      if (missingFields.length > 0) {
        const errorMessage = `Please fill in the following required fields:\n• ${missingFields.join("\n• ")}`;
        toast.error(errorMessage, { duration: 5000 });
        return;
      }

      const validTargetClasses = targetClasses.filter(
        (tc) => tc.classId && tc.sections.length > 0,
      );

      if (validTargetClasses.length === 0) {
        toast.error("Please select at least one class and section");
        return;
      }

      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("content", form.content.trim());
      formData.append("priority", form.priority);
      formData.append("targetClasses", JSON.stringify(validTargetClasses));

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      console.log("📤 Submitting notice with", attachments.length, "files");

      const result = await createNoticeWithFilesAction(formData);

      if (!result.success) {
        toast.error(result.message || "Failed to create notice", {
          duration: 4000,
        });
        return;
      }

      toast.success("✅ Notice created successfully!", { duration: 3000 });

      setTimeout(() => {
        router.push("/admin/dashboard/notice");
      }, 1500);
    } catch (error: any) {
      console.error("❌ Notice creation error:", error);
      toast.error(error.message || "Failed to create notice", {
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="af-page">
      <header className="af-header">
        <div className="af-header-inner">
          <div className="af-brand">
            <Image
              src={HamroPadhai}
              alt="HamroPadhai Logo"
              className="af-brand-title"
              width={150}
              height={40}
              priority
            />
          </div>
          <div className="af-header-actions">
            <button
              className="af-btn-cancel"
              onClick={() => router.push("/admin/dashboard/notice")}
            >
              Cancel
            </button>
            <button
              className="af-btn-save"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? "Creating..." : "Create Notice"}
            </button>
          </div>
        </div>
      </header>

      <main className="af-content">
        <div className="af-card">
          <h2 className="af-card-title">Create New Notice</h2>
          <p className="af-card-sub">
            Fill in the details to create a new notice. The notice will be
            published immediately.
          </p>

          <div className="af-form-grid">
            <div className="af-field af-field-full">
              <label className="af-label">Notice Title *</label>
              <input
                className="af-input"
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="e.g., Important: Exam Schedule Update"
                maxLength={200}
              />
            </div>

            <div className="af-field af-field-full">
              <label className="af-label">Content *</label>
              <textarea
                className="af-textarea"
                name="content"
                value={form.content}
                onChange={onChange}
                placeholder="Enter the notice content..."
                maxLength={2000}
                rows={8}
              />
              <span className="af-char-count">
                {form.content.length}/2000 characters
              </span>
            </div>

            <div className="af-field af-field-full">
              <label className="af-label">Priority *</label>
              <select
                className="af-input af-select"
                name="priority"
                value={form.priority}
                onChange={onChange}
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Classes and Sections */}
            <div className="af-field af-field-full">
              <label className="af-label">Target Classes & Sections *</label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {targetClasses.map((tc, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "16px",
                      background: "#f9fafb",
                      borderRadius: "12px",
                      border: "2px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        marginBottom: "12px",
                        alignItems: "center",
                      }}
                    >
                      <select
                        className="af-input af-select"
                        value={tc.classId}
                        onChange={(e) => updateClassId(index, e.target.value)}
                        style={{ flex: 1 }}
                      >
                        <option value="">Select Class</option>
                        {CLASSES.map((cls) => (
                          <option key={cls} value={cls}>
                            Class {cls}
                          </option>
                        ))}
                      </select>
                      {targetClasses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeClassSection(index)}
                          style={{
                            padding: "8px 12px",
                            background: "#fee2e2",
                            border: "none",
                            borderRadius: "8px",
                            color: "#991b1b",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {tc.classId && (
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#6b7280",
                            marginBottom: "8px",
                          }}
                        >
                          Select Sections:
                        </label>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          {SECTIONS.map((section) => (
                            <label
                              key={section}
                              style={{
                                padding: "8px 16px",
                                background: tc.sections.includes(section)
                                  ? "#6366f1"
                                  : "#fff",
                                color: tc.sections.includes(section)
                                  ? "#fff"
                                  : "#111827",
                                border: "2px solid",
                                borderColor: tc.sections.includes(section)
                                  ? "#6366f1"
                                  : "#e5e7eb",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "14px",
                                transition: "all 0.2s",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={tc.sections.includes(section)}
                                onChange={() => toggleSection(index, section)}
                                style={{ display: "none" }}
                              />
                              Section {section}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addClassSection}
                  style={{
                    padding: "12px",
                    background: "#eff6ff",
                    border: "2px dashed #3b82f6",
                    borderRadius: "12px",
                    color: "#3b82f6",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  + Add Another Class
                </button>
              </div>
            </div>

            {/* FILE UPLOAD */}
            <div className="af-field af-field-full">
              <label className="af-label">
                Attachments ({attachments.length}/10) - Optional
              </label>
              <div className="af-file-upload-zone">
                <input
                  type="file"
                  id="file-upload"
                  className="af-file-input"
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                  disabled={attachments.length >= 10}
                />
                <label htmlFor="file-upload" className="af-file-label">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Click to upload files</span>
                  <span className="af-file-hint">
                    PDF, DOC, PPT, XLS, TXT, Images (Max 10MB each, 10 files
                    total)
                  </span>
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="af-attached-files">
                  {attachments.map((file, index) => (
                    <div key={index} className="af-file-item">
                      <div className="af-file-info">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                          <polyline points="13 2 13 9 20 9" />
                        </svg>
                        <span className="af-file-name">{file.name}</span>
                        <span className="af-file-size">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        type="button"
                        className="af-file-remove"
                        onClick={() => removeAttachment(index)}
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
