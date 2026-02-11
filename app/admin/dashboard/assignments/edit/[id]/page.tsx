"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getAssignmentByIdAdminAction,
  updateAssignmentWithFilesAction,
  getFilteredTeachersForAssignmentAction,
} from "../../../../../../lib/actions/assignment-action";
import { getFilteredStudentsAction } from "../../../../../../lib/actions/admin-action";
import toast from "react-hot-toast";
import "./edit-assignment.css";
import HamroPadhai from "./../../../../../../assets/images/HamroPadhai.png";

const CLASSES = ["11", "12"];
const SECTIONS = ["A", "B", "C", "D", "E"];
const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Nepali",
  "Computer Science",
  "Accountancy",
  "Economics",
  "Business Studies",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

interface Student {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  classId: string;
  sectionId: string;
  profileImage?: string;
}

interface Teacher {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  classId: string;
  sectionId: string;
  profileImage?: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject: string;
  classId: string;
  sectionId: string;
  academicYear: string;
  totalMarks: number;
  dueDate: string;
  isActive: boolean;
  createdAt: string;
  assignedTeacherId?: string;
  assignedTeacher?: {
    _id: string;
    fullName: string;
    username: string;
  };
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number;
  }>;
  submissions?: any[];
}

export default function EditAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<
    Array<{
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize?: number;
    }>
  >([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    classId: "",
    sectionId: "",
    academicYear: "",
    totalMarks: 100,
    dueDate: "",
    dueTime: "23:59",
    assignedTeacherId: "", // REQUIRED
  });

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  // Fetch filtered students when class/section changes
  useEffect(() => {
    if (form.classId && form.sectionId) {
      fetchFilteredStudents();
      fetchFilteredTeachers();
    } else {
      setFilteredStudents([]);
      setFilteredTeachers([]);
    }
  }, [form.classId, form.sectionId]);

  const fetchFilteredStudents = async () => {
    try {
      setIsLoadingStudents(true);
      const result = await getFilteredStudentsAction(
        form.classId,
        form.sectionId,
      );

      if (result.success) {
        setFilteredStudents(result.data);
      } else {
        setFilteredStudents([]);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setFilteredStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const fetchFilteredTeachers = async () => {
    try {
      setIsLoadingTeachers(true);
      const result = await getFilteredTeachersForAssignmentAction(
        form.classId,
        form.sectionId,
      );

      if (result.success) {
        setFilteredTeachers(result.data);
        if (result.data.length === 0) {
          toast.error(
            `⚠️ No teachers assigned to Class ${form.classId}-${form.sectionId}.`,
            { duration: 5000 },
          );
        }
      } else {
        setFilteredTeachers([]);
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      setFilteredTeachers([]);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const fetchAssignment = async () => {
    try {
      setIsLoading(true);
      const result = await getAssignmentByIdAdminAction(assignmentId);

      if (!result.success) {
        toast.error(result.message || "Failed to fetch assignment");
        router.push("/admin/dashboard/assignments");
        return;
      }

      setAssignment(result.data);
      setExistingAttachments(result.data.attachments || []);

      // Parse the dueDate to extract date and time
      const dueDate = new Date(result.data.dueDate);
      const formattedDate = dueDate.toISOString().split("T")[0];
      const hours = String(dueDate.getHours()).padStart(2, "0");
      const minutes = String(dueDate.getMinutes()).padStart(2, "0");
      const formattedTime = `${hours}:${minutes}`;

      setForm({
        title: result.data.title || "",
        description: result.data.description || "",
        subject: result.data.subject || "",
        classId: result.data.classId || "",
        sectionId: result.data.sectionId || "",
        academicYear: result.data.academicYear || "",
        totalMarks: result.data.totalMarks || 100,
        dueDate: formattedDate,
        dueTime: formattedTime,
        assignedTeacherId: result.data.assignedTeacherId || "", // Load existing teacher
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch assignment");
      router.push("/admin/dashboard/assignments");
    } finally {
      setIsLoading(false);
    }
  };

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Validate file size (10MB max per file)
      const invalidFiles = newFiles.filter(
        (file) => file.size > 10 * 1024 * 1024,
      );
      if (invalidFiles.length > 0) {
        toast.error("Some files exceed 10MB limit");
        return;
      }

      // Max 10 files total (including existing)
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

  const handleSubmit = async () => {
    try {
      setIsSaving(true);

      // Validation
      const missingFields: string[] = [];
      if (!form.title.trim()) missingFields.push("Assignment Title");
      if (!form.description.trim()) missingFields.push("Description");
      if (!form.subject) missingFields.push("Subject");
      if (!form.classId) missingFields.push("Class");
      if (!form.sectionId) missingFields.push("Section");
      if (!form.dueDate) missingFields.push("Due Date");
      if (!form.dueTime) missingFields.push("Due Time");
      if (!form.assignedTeacherId) missingFields.push("Assigned Teacher"); // ✅ REQUIRED

      if (missingFields.length > 0) {
        const errorMessage = `Please fill in the following required fields:\n• ${missingFields.join("\n• ")}`;
        toast.error(errorMessage, { duration: 5000 });
        return;
      }

      if (form.totalMarks < 1 || form.totalMarks > 1000) {
        toast.error("Total marks must be between 1 and 1000");
        return;
      }

      // Check if class/section changed
      const classChanged =
        assignment &&
        (assignment.classId !== form.classId ||
          assignment.sectionId !== form.sectionId);

      if (classChanged && filteredStudents.length === 0) {
        toast.error(
          `No students found in Class ${form.classId} - Section ${form.sectionId}`,
        );
        return;
      }

      // Combine date and time into ISO string
      const dueDateTimeString = `${form.dueDate}T${form.dueTime}:00`;
      const dueDateTime = new Date(dueDateTimeString);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("subject", form.subject);
      formData.append("classId", form.classId);
      formData.append("sectionId", form.sectionId);
      formData.append("academicYear", form.academicYear);
      formData.append("totalMarks", form.totalMarks.toString());
      formData.append("dueDate", dueDateTime.toISOString());

      // ✅ ALWAYS append assignedTeacherId (REQUIRED)
      formData.append("assignedTeacherId", form.assignedTeacherId);

      // Append existing attachments as JSON string
      formData.append(
        "existingAttachments",
        JSON.stringify(existingAttachments),
      );

      // Append new files
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      console.log(
        "📤 Updating assignment with",
        attachments.length,
        "new files",
      );
      console.log("📤 Existing files:", existingAttachments.length);
      console.log("📤 Assigned Teacher ID:", form.assignedTeacherId);

      const result = await updateAssignmentWithFilesAction(
        assignmentId,
        formData,
      );

      if (!result.success) {
        toast.error(result.message || "Failed to update assignment");
        return;
      }

      if (classChanged) {
        toast.success(
          `Assignment updated! Now visible to ${filteredStudents.length} student(s) in Class ${form.classId}-${form.sectionId}`,
        );
      } else {
        toast.success("Assignment updated successfully!");
      }

      setTimeout(() => {
        router.push("/admin/dashboard/assignments");
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to update assignment");
    } finally {
      setIsSaving(false);
    }
  };

  const getProfileImageUrl = (profileImage?: string) => {
    if (!profileImage) return null;
    if (profileImage.startsWith("http")) return profileImage;
    return `${API_URL}${profileImage}`;
  };

  if (isLoading) {
    return (
      <div className="af-page">
        <header className="af-header">
          <div className="af-header-inner">
            <div className="af-brand">
              <img
                src={HamroPadhai.src}
                alt="HamroPadhai Logo"
                className="af-brand-logo"
              />
              <span className="af-brand-title">HamroPadhai Admin</span>
            </div>
          </div>
        </header>
        <div className="af-loading">
          <div className="af-spinner"></div>
          <p>Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (!assignment) return null;

  const today = new Date().toISOString().split("T")[0];

  const getMinTime = () => {
    if (form.dueDate === today) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return "00:00";
  };

  const getAcademicYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];

    for (let i = -2; i <= 2; i++) {
      const startYear = currentYear + i;
      const endYear = startYear + 1;
      options.push(`${startYear}-${endYear}`);
    }

    return options;
  };

  const submissionCount = assignment.submissions?.length || 0;
  const totalFiles = existingAttachments.length + attachments.length;

  return (
    <div className="af-page">
      <header className="af-header">
        <div className="af-header-inner">
          <div className="af-brand">
            <img
              src={HamroPadhai.src}
              alt="HamroPadhai Logo"
              className="af-brand-title"
            />
          </div>
          <div className="af-header-actions">
            <button
              className="af-btn-cancel"
              onClick={() => router.push("/admin/dashboard/assignments")}
            >
              Cancel
            </button>
            <button
              className="af-btn-save"
              onClick={handleSubmit}
              disabled={isSaving || !form.assignedTeacherId}
              title={
                !form.assignedTeacherId
                  ? "Teacher assignment is required"
                  : "Update Assignment"
              }
            >
              {isSaving ? "Updating..." : "Update Assignment"}
            </button>
          </div>
        </div>
      </header>

      <main className="af-content">
        <div className="af-card">
          <h2 className="af-card-title">Edit Assignment</h2>
          <p className="af-card-sub">Update assignment information</p>

          {/* Submission Warning */}
          {submissionCount > 0 && (
            <div className="af-warning-box">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <strong>
                  ⚠️ {submissionCount} student(s) have already submitted
                </strong>
                <p>
                  Changing class/section, teacher, or due date may affect
                  existing submissions. Consider creating a new assignment
                  instead.
                </p>
              </div>
            </div>
          )}

          <div className="af-form-grid">
            <div className="af-field af-field-full">
              <label className="af-label">Assignment Title *</label>
              <input
                className="af-input"
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="e.g., Algebra Chapter 5 Practice"
                maxLength={100}
              />
            </div>

            <div className="af-field af-field-full">
              <label className="af-label">Description *</label>
              <textarea
                className="af-textarea"
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Provide detailed instructions for the assignment..."
                maxLength={1000}
                rows={6}
              />
              <span className="af-char-count">
                {form.description.length}/1000 characters
              </span>
            </div>

            <div className="af-field">
              <label className="af-label">Subject *</label>
              <select
                className="af-input af-select"
                name="subject"
                value={form.subject}
                onChange={onChange}
              >
                <option value="">Select Subject</option>
                {SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div className="af-field">
              <label className="af-label">Class *</label>
              <select
                className="af-input af-select"
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

            <div className="af-field">
              <label className="af-label">Section *</label>
              <select
                className="af-input af-select"
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

            <div className="af-field">
              <label className="af-label">Academic Year *</label>
              <select
                className="af-input af-select"
                name="academicYear"
                value={form.academicYear}
                onChange={onChange}
              >
                {getAcademicYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="af-field">
              <label className="af-label">Total Marks *</label>
              <input
                className="af-input"
                type="number"
                name="totalMarks"
                value={form.totalMarks}
                onChange={onChange}
                min="1"
                max="1000"
                placeholder="100"
              />
            </div>

            <div className="af-field">
              <label className="af-label">Due Date *</label>
              <input
                className="af-input"
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={onChange}
                min={today}
              />
            </div>

            <div className="af-field">
              <label className="af-label">Due Time *</label>
              <input
                className="af-input"
                type="time"
                name="dueTime"
                value={form.dueTime}
                onChange={onChange}
                min={form.dueDate === today ? getMinTime() : "00:00"}
              />
              <span className="af-field-hint">
                {form.dueDate && form.dueTime && (
                  <>
                    Due:{" "}
                    {new Date(
                      `${form.dueDate}T${form.dueTime}`,
                    ).toLocaleString()}
                  </>
                )}
              </span>
            </div>

            {/* ✅ REQUIRED TEACHER FIELD */}
            <div className="af-field af-field-full">
              <label className="af-label">Assign Teacher *</label>
              <select
                className="af-input af-select"
                name="assignedTeacherId"
                value={form.assignedTeacherId}
                onChange={onChange}
                disabled={!form.classId || !form.sectionId || isLoadingTeachers}
                required
              >
                <option value="">
                  {!form.classId || !form.sectionId
                    ? "Select class and section first"
                    : isLoadingTeachers
                      ? "Loading teachers..."
                      : "Select a teacher (Required)"}
                </option>
                {filteredTeachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.fullName} (@{teacher.username})
                  </option>
                ))}
              </select>
              <span
                className="af-field-hint"
                style={{ color: !form.assignedTeacherId ? "red" : "inherit" }}
              >
                {!form.assignedTeacherId && form.classId && form.sectionId
                  ? "⚠️ Teacher assignment is required. Please select a teacher."
                  : "Teacher will be responsible for grading this assignment."}
              </span>
            </div>

            {/* File Attachments */}
            <div className="af-field af-field-full">
              <label className="af-label">
                Attachments ({totalFiles}/10) - Optional
              </label>

              {/* Existing Files */}
              {existingAttachments.length > 0 && (
                <div
                  className="af-attached-files"
                  style={{ marginBottom: "1rem" }}
                >
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#666",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Existing files:
                  </p>
                  {existingAttachments.map((file, index) => (
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
                        <span className="af-file-name">{file.fileName}</span>
                        <span className="af-file-size">
                          {file.fileSize
                            ? (file.fileSize / 1024).toFixed(1) + " KB"
                            : "Unknown"}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="af-file-remove"
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
              <div className="af-file-upload-zone">
                <input
                  type="file"
                  id="file-upload"
                  className="af-file-input"
                  onChange={handleFileChange}
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                  disabled={totalFiles >= 10}
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
                  <span>Click to upload additional files</span>
                  <span className="af-file-hint">
                    PDF, DOC, PPT, XLS, TXT, Images (Max 10MB each)
                  </span>
                </label>
              </div>

              {/* New Files */}
              {attachments.length > 0 && (
                <div
                  className="af-attached-files"
                  style={{ marginTop: "1rem" }}
                >
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#666",
                      marginBottom: "0.5rem",
                    }}
                  >
                    New files to upload:
                  </p>
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

          {/* TEACHERS WITH PROFILE PICTURES */}
          {form.classId && form.sectionId && filteredTeachers.length > 0 && (
            <div className="af-teachers-section">
              <div className="af-teachers-header">
                <h3 className="af-teachers-title">Available Teachers</h3>
                <span className="af-teachers-count">
                  {filteredTeachers.length} teacher(s)
                </span>
              </div>
              <div className="af-teachers-list">
                {filteredTeachers.map((teacher) => {
                  const profileUrl = getProfileImageUrl(teacher.profileImage);
                  return (
                    <div key={teacher._id} className="af-teacher-item">
                      <div className="af-teacher-avatar">
                        {profileUrl ? (
                          <img
                            src={profileUrl}
                            alt={teacher.fullName}
                            className="af-avatar-image"
                          />
                        ) : (
                          teacher.fullName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="af-teacher-info">
                        <div className="af-teacher-name">
                          {teacher.fullName}
                        </div>
                        <div className="af-teacher-username">
                          @{teacher.username}
                        </div>
                      </div>
                      <div className="af-teacher-badge">
                        {form.assignedTeacherId === teacher._id
                          ? "✓ Selected"
                          : "Available"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Student List Preview */}
          {form.classId && form.sectionId && (
            <div className="af-students-section">
              <div className="af-students-header">
                <h3 className="af-students-title">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Students in Class {form.classId} - Section {form.sectionId}
                </h3>
                <span className="af-students-count">
                  {isLoadingStudents
                    ? "Loading..."
                    : `${filteredStudents.length} student(s)`}
                </span>
              </div>

              {isLoadingStudents ? (
                <div className="af-students-loading">
                  <div className="af-spinner-small"></div>
                  <span>Loading students...</span>
                </div>
              ) : filteredStudents.length > 0 ? (
                <div className="af-students-list">
                  {filteredStudents.map((student) => {
                    const profileUrl = getProfileImageUrl(student.profileImage);
                    return (
                      <div key={student._id} className="af-student-item">
                        <div className="af-student-avatar">
                          {profileUrl ? (
                            <img
                              src={profileUrl}
                              alt={student.fullName}
                              className="af-avatar-image"
                            />
                          ) : (
                            student.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="af-student-info">
                          <div className="af-student-name">
                            {student.fullName}
                          </div>
                          <div className="af-student-username">
                            @{student.username}
                          </div>
                        </div>
                        <div className="af-student-badge">Will see</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="af-students-empty">
                  <svg
                    width="48"
                    height="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <p>No students found in this class and section</p>
                  <small>Please check if students are enrolled</small>
                </div>
              )}
            </div>
          )}

          <div className="af-info-box">
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
              Updates will be immediately visible to students. Be careful when
              changing the due date/time, total marks, or assigned teacher.
            </span>
          </div>

          <div className="af-assignment-info">
            <div className="af-info-item">
              <span className="af-info-label">Created:</span>
              <span className="af-info-value">
                {new Date(assignment.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="af-info-item">
              <span className="af-info-label">Status:</span>
              <span
                className={`af-status-badge ${assignment.isActive ? "active" : "inactive"}`}
              >
                {assignment.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="af-info-item">
              <span className="af-info-label">Submissions:</span>
              <span className="af-info-value">{submissionCount}</span>
            </div>
            {assignment.assignedTeacher && (
              <div className="af-info-item">
                <span className="af-info-label">Currently Assigned:</span>
                <span className="af-info-value">
                  {assignment.assignedTeacher.fullName} (@
                  {assignment.assignedTeacher.username})
                </span>
              </div>
            )}
          </div>

          <div className="af-required-note">
            * Required fields | Changes are saved immediately
          </div>
        </div>
      </main>
    </div>
  );
}
