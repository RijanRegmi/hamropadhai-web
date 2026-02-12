"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getNoticeByIdAdminAction,
  updateNoticeWithFilesAction,
} from "../../../../../../lib/actions/notice-action";
import toast from "react-hot-toast";
import Image from "next/image";
import HamroPadhai from "./../../../../../../assets/images/HamroPadhai.png";
import "./edit-notice.css";

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

interface AttachmentFile {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
}

interface Notice {
  _id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high";
  targetClasses: ClassSectionPair[];
  isActive: boolean;
  attachments?: AttachmentFile[];
  createdAt: string;
}

export default function EditNoticePage() {
  const router = useRouter();
  const params = useParams();
  const noticeId = params.id as string;

  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<
    AttachmentFile[]
  >([]);
  const [targetClasses, setTargetClasses] = useState<ClassSectionPair[]>([
    { classId: "", sections: [] },
  ]);

  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  useEffect(() => {
    fetchNotice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noticeId]);

  const fetchNotice = async () => {
    try {
      setIsLoading(true);
      const result = await getNoticeByIdAdminAction(noticeId);

      if (!result.success) {
        toast.error(result.message || "Failed to fetch notice");
        router.push("/admin/dashboard/notice");
        return;
      }

      setNotice(result.data);
      setExistingAttachments(result.data.attachments || []);
      setTargetClasses(
        result.data.targetClasses.length > 0
          ? result.data.targetClasses
          : [{ classId: "", sections: [] }],
      );

      setForm({
        title: result.data.title || "",
        content: result.data.content || "",
        priority: result.data.priority || "medium",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch notice");
      router.push("/admin/dashboard/notice");
    } finally {
      setIsLoading(false);
    }
  };

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

      if (
        existingAttachments.length + attachments.length + newFiles.length >
        10
      ) {
        toast.error("Maximum 10 files allowed in total");
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

  const removeExistingAttachment = (index: number) => {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
    toast.success("Existing file will be removed on save");
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
      formData.append(
        "existingAttachments",
        JSON.stringify(existingAttachments),
      );

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const result = await updateNoticeWithFilesAction(noticeId, formData);

      if (!result.success) {
        toast.error(result.message || "Failed to update notice");
        return;
      }

      toast.success("✅ Notice updated successfully!");

      setTimeout(() => {
        router.push("/admin/dashboard/notice");
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to update notice");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="edit-page">
        <header className="edit-header">
          <div className="edit-header-inner">
            <div className="edit-brand">
              <Image
                src={HamroPadhai}
                alt="HamroPadhai Logo"
                className="edit-brand-title"
                width={150}
                height={40}
                priority
              />
            </div>
          </div>
        </header>
        <div className="edit-loading">
          <div className="edit-spinner"></div>
          <p>Loading notice...</p>
        </div>
      </div>
    );
  }

  if (!notice) return null;

  const totalFiles = existingAttachments.length + attachments.length;

  return (
    <div className="edit-page">
      <header className="edit-header">
        <div className="edit-header-inner">
          <div className="edit-brand">
            <Image
              src={HamroPadhai}
              alt="HamroPadhai Logo"
              className="edit-brand-title"
              width={150}
              height={40}
              priority
            />
          </div>
          <div className="edit-header-actions">
            <button
              className="edit-btn-cancel"
              onClick={() => router.push("/admin/dashboard/notice")}
            >
              Cancel
            </button>
            <button
              className="edit-btn-save"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? "Updating..." : "Update Notice"}
            </button>
          </div>
        </div>
      </header>

      <main className="edit-content">
        <div className="edit-card">
          <h2 className="edit-card-title">Edit Notice</h2>
          <p className="edit-card-sub">
            Update notice information. Changes will be visible immediately.
          </p>

          <div className="edit-form-grid">
            <div className="edit-field edit-field-full">
              <label className="edit-label">Notice Title *</label>
              <input
                className="edit-input"
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="e.g., Important: Exam Schedule Update"
                maxLength={200}
              />
            </div>

            <div className="edit-field edit-field-full">
              <label className="edit-label">Content *</label>
              <textarea
                className="edit-textarea"
                name="content"
                value={form.content}
                onChange={onChange}
                placeholder="Enter the notice content..."
                maxLength={2000}
                rows={8}
              />
              <span className="edit-char-count">
                {form.content.length}/2000 characters
              </span>
            </div>

            <div className="edit-field edit-field-full">
              <label className="edit-label">Priority *</label>
              <select
                className="edit-input edit-select"
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
            <div className="edit-field edit-field-full">
              <label className="edit-label">Target Classes & Sections *</label>
              <div className="edit-class-container">
                {targetClasses.map((tc, index) => (
                  <div key={index} className="edit-class-box">
                    <div className="edit-class-header">
                      <select
                        className="edit-input edit-select"
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
                          className="edit-btn-remove-class"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {tc.classId && (
                      <div>
                        <label className="edit-section-label">
                          Select Sections:
                        </label>
                        <div className="edit-sections-grid">
                          {SECTIONS.map((section) => (
                            <label
                              key={section}
                              className={`edit-section-badge ${
                                tc.sections.includes(section) ? "active" : ""
                              }`}
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
                  className="edit-btn-add-class"
                >
                  + Add Another Class
                </button>
              </div>
            </div>

            {/* File Attachments */}
            <div className="edit-field edit-field-full">
              <label className="edit-label">
                Attachments ({totalFiles}/10) - Optional
              </label>

              {/* Existing Files */}
              {existingAttachments.length > 0 && (
                <div className="edit-attached-files existing-files">
                  <p className="edit-files-label">Existing files:</p>
                  {existingAttachments.map((file, index) => (
                    <div key={index} className="edit-file-item existing">
                      <div className="edit-file-info">
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
                        <span className="edit-file-name">{file.fileName}</span>
                        <span className="edit-file-size">
                          {file.fileSize
                            ? (file.fileSize / 1024).toFixed(1) + " KB"
                            : "Unknown"}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="edit-file-remove"
                        onClick={() => removeExistingAttachment(index)}
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

              {/* Upload New Files */}
              <div className="edit-file-upload-zone">
                <input
                  type="file"
                  id="file-upload"
                  className="edit-file-input"
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                  disabled={totalFiles >= 10}
                />
                <label htmlFor="file-upload" className="edit-file-label">
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
                  <span>Click to upload additional files</span>
                  <span className="edit-file-hint">
                    PDF, DOC, PPT, XLS, TXT, Images (Max 10MB each)
                  </span>
                </label>
              </div>

              {/* New Files */}
              {attachments.length > 0 && (
                <div className="edit-attached-files new-files">
                  <p className="edit-files-label">New files to upload:</p>
                  {attachments.map((file, index) => (
                    <div key={index} className="edit-file-item new">
                      <div className="edit-file-info">
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
                        <span className="edit-file-name">{file.name}</span>
                        <span className="edit-file-size">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        type="button"
                        className="edit-file-remove"
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

          <div className="edit-info-box">
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
            <span>
              Updates will be immediately visible to students and teachers.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
