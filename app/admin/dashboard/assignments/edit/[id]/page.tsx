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
  assignedTeacherIds?: string[];
  assignedTeachers?: { _id: string; fullName: string; username: string }[];
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
  // ✅ MULTI-SELECT
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

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
  });

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

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
      setFilteredStudents(result.success ? result.data : []);
    } catch {
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
        // Keep existing selection if teachers are still available
        setSelectedTeacherIds((prev) =>
          prev.filter((id) => result.data.some((t: Teacher) => t._id === id)),
        );
      } else {
        setFilteredTeachers([]);
      }
    } catch {
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

      const dueDate = new Date(result.data.dueDate);
      const formattedDate = dueDate.toISOString().split("T")[0];
      const hours = String(dueDate.getHours()).padStart(2, "0");
      const minutes = String(dueDate.getMinutes()).padStart(2, "0");

      setForm({
        title: result.data.title || "",
        description: result.data.description || "",
        subject: result.data.subject || "",
        classId: result.data.classId || "",
        sectionId: result.data.sectionId || "",
        academicYear: result.data.academicYear || "",
        totalMarks: result.data.totalMarks || 100,
        dueDate: formattedDate,
        dueTime: `${hours}:${minutes}`,
      });

      // ✅ Pre-select existing teachers
      const existingIds =
        result.data.assignedTeacherIds ||
        result.data.assignedTeachers?.map((t: any) => t._id || t) ||
        [];
      setSelectedTeacherIds(existingIds.map((id: any) => id.toString()));
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch assignment");
      router.push("/admin/dashboard/assignments");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTeacher = (teacherId: string) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId],
    );
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
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    if (newFiles.some((f) => f.size > 10 * 1024 * 1024)) {
      toast.error("Some files exceed 10MB");
      return;
    }
    if (
      existingAttachments.length + attachments.length + newFiles.length >
      10
    ) {
      toast.error("Maximum 10 files total");
      return;
    }
    setAttachments((prev) => [...prev, ...newFiles]);
    toast.success(`${newFiles.length} file(s) added`);
  };

  const removeAttachment = (index: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  const removeExistingAttachment = (index: number) =>
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      const missing: string[] = [];
      if (!form.title.trim()) missing.push("Title");
      if (!form.description.trim()) missing.push("Description");
      if (!form.subject) missing.push("Subject");
      if (!form.classId) missing.push("Class");
      if (!form.sectionId) missing.push("Section");
      if (!form.dueDate) missing.push("Due Date");
      if (selectedTeacherIds.length === 0) missing.push("At least one Teacher");

      if (missing.length > 0) {
        toast.error(`Please fill in: ${missing.join(", ")}`, {
          duration: 5000,
        });
        return;
      }
      if (form.totalMarks < 1 || form.totalMarks > 1000) {
        toast.error("Total marks must be 1–1000");
        return;
      }

      const dueDateTime = new Date(`${form.dueDate}T${form.dueTime}:00`);
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("subject", form.subject);
      formData.append("classId", form.classId);
      formData.append("sectionId", form.sectionId);
      formData.append("academicYear", form.academicYear);
      formData.append("totalMarks", form.totalMarks.toString());
      formData.append("dueDate", dueDateTime.toISOString());
      // ✅ Send as JSON array
      formData.append("assignedTeacherIds", JSON.stringify(selectedTeacherIds));
      formData.append(
        "existingAttachments",
        JSON.stringify(existingAttachments),
      );
      attachments.forEach((f) => formData.append("attachments", f));

      const result = await updateAssignmentWithFilesAction(
        assignmentId,
        formData,
      );
      if (!result.success) {
        toast.error(result.message || "Failed to update assignment");
        return;
      }

      toast.success("Assignment updated successfully!");
      setTimeout(() => router.push("/admin/dashboard/assignments"), 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to update assignment");
    } finally {
      setIsSaving(false);
    }
  };

  const getProfileImageUrl = (profileImage?: string) => {
    if (!profileImage) return null;
    return profileImage.startsWith("http")
      ? profileImage
      : `${API_URL}${profileImage}`;
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (isLoading)
    return (
      <div className="af-page">
        <header className="af-header">
          <div className="af-header-inner">
            <div className="af-brand">
              <img
                src={HamroPadhai.src}
                alt="HamroPadhai"
                className="af-brand-title"
              />
            </div>
          </div>
        </header>
        <div className="af-loading">
          <div className="af-spinner" />
          <p>Loading assignment...</p>
        </div>
      </div>
    );

  if (!assignment) return null;

  const today = new Date().toISOString().split("T")[0];
  const submissionCount = assignment.submissions?.length || 0;
  const totalFiles = existingAttachments.length + attachments.length;

  return (
    <div className="af-page">
      <header className="af-header">
        <div className="af-header-inner">
          <div className="af-brand">
            <img
              src={HamroPadhai.src}
              alt="HamroPadhai"
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
              disabled={isSaving || selectedTeacherIds.length === 0}
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
                  Changing teachers or due date may affect existing submissions.
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
                maxLength={1000}
                rows={5}
              />
              <span className="af-char-count">
                {form.description.length}/1000
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
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
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
                {CLASSES.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
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
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    Section {s}
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
                {[...Array(5)].map((_, i) => {
                  const y = new Date().getFullYear() + i - 2;
                  return (
                    <option key={y} value={`${y}-${y + 1}`}>
                      {y}-{y + 1}
                    </option>
                  );
                })}
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
              />
            </div>

            {/* FILE ATTACHMENTS */}
            <div className="af-field af-field-full">
              <label className="af-label">
                Attachments ({totalFiles}/10) - Optional
              </label>
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

          {/* ✅ CLICKABLE MULTI-SELECT TEACHER CARDS */}
          {form.classId && form.sectionId && (
            <div className="af-teachers-section">
              <div className="af-teachers-header">
                <div>
                  <h3 className="af-teachers-title">Assign Teachers *</h3>
                  <p className="af-teachers-subtitle">
                    {selectedTeacherIds.length === 0
                      ? "Click a card to select. Only selected teachers can view and grade."
                      : `${selectedTeacherIds.length} teacher${selectedTeacherIds.length > 1 ? "s" : ""} selected`}
                  </p>
                </div>
                <span className="af-teachers-count">
                  {isLoadingTeachers
                    ? "Loading..."
                    : `${filteredTeachers.length} available`}
                </span>
              </div>

              {isLoadingTeachers ? (
                <div className="af-students-loading">
                  <div className="af-spinner-small" />
                  <span>Loading teachers...</span>
                </div>
              ) : filteredTeachers.length === 0 ? (
                <div className="af-students-empty">
                  <p>
                    ⚠️ No teachers for Class {form.classId}-{form.sectionId}
                  </p>
                </div>
              ) : (
                <div className="af-teachers-list">
                  {filteredTeachers.map((teacher) => {
                    const isSelected = selectedTeacherIds.includes(teacher._id);
                    const hasErr = imgErrors.has(teacher._id);
                    const profileUrl =
                      teacher.profileImage && !hasErr
                        ? getProfileImageUrl(teacher.profileImage)
                        : null;

                    return (
                      <div
                        key={teacher._id}
                        className={`af-teacher-item af-teacher-clickable${isSelected ? " af-teacher-selected" : ""}`}
                        onClick={() => toggleTeacher(teacher._id)}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={(e) =>
                          e.key === "Enter" && toggleTeacher(teacher._id)
                        }
                      >
                        <div
                          className={`af-teacher-check-circle${isSelected ? " visible" : ""}`}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <div className="af-teacher-avatar">
                          {profileUrl ? (
                            <img
                              src={profileUrl}
                              alt={teacher.fullName}
                              className="af-avatar-image"
                              onError={() =>
                                setImgErrors((prev) =>
                                  new Set(prev).add(teacher._id),
                                )
                              }
                            />
                          ) : (
                            <span>{getInitials(teacher.fullName)}</span>
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
                        <div
                          className={`af-teacher-badge${isSelected ? " af-teacher-badge-selected" : ""}`}
                        >
                          {isSelected ? "✓ Selected" : "Available"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedTeacherIds.length > 0 && (
                <div className="af-selected-summary">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>
                    <strong>Assigned:</strong>{" "}
                    {filteredTeachers
                      .filter((t) => selectedTeacherIds.includes(t._id))
                      .map((t) => t.fullName)
                      .join(", ")}
                  </span>
                  <button
                    className="af-clear-teachers"
                    onClick={() => setSelectedTeacherIds([])}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STUDENTS */}
          {form.classId && form.sectionId && (
            <div className="af-students-section">
              <div className="af-students-header">
                <h3 className="af-students-title">
                  Students in Class {form.classId} - Section {form.sectionId}
                </h3>
                <span className="af-students-count">
                  {isLoadingStudents
                    ? "Loading..."
                    : `${filteredStudents.length} student(s)`}
                </span>
              </div>
              {filteredStudents.length > 0 ? (
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
                            getInitials(student.fullName)
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
                  <p>No students found in this class and section</p>
                </div>
              )}
            </div>
          )}

          <div className="af-assignment-info">
            <div className="af-info-item">
              <span className="af-info-label">Created</span>
              <span className="af-info-value">
                {new Date(assignment.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="af-info-item">
              <span className="af-info-label">Status</span>
              <span
                className={`af-status-badge ${assignment.isActive ? "active" : "inactive"}`}
              >
                {assignment.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="af-info-item">
              <span className="af-info-label">Submissions</span>
              <span className="af-info-value">{submissionCount}</span>
            </div>
          </div>
          <div className="af-required-note">* Required fields</div>
        </div>
      </main>
    </div>
  );
}
