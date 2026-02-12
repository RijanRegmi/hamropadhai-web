"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createAssignmentWithFilesAction,
  getFilteredTeachersForAssignmentAction,
} from "../../../../../lib/actions/assignment-action";
import { getFilteredStudentsAction } from "../../../../../lib/actions/admin-action";
import toast from "react-hot-toast";
import "./create-assignment.css";
import HamroPadhai from "./../../../../../assets/images/HamroPadhai.png";

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

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  // ✅ MULTI-SELECT: array of selected teacher IDs
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const getCurrentAcademicYear = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth();
    return m < 3 ? `${y - 1}-${y}` : `${y}-${y + 1}`;
  };

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    classId: "",
    sectionId: "",
    academicYear: getCurrentAcademicYear(),
    totalMarks: 100,
    dueDate: "",
    dueTime: "23:59",
  });

  useEffect(() => {
    if (form.classId && form.sectionId) {
      fetchFilteredStudents();
      fetchFilteredTeachers();
    } else {
      setFilteredStudents([]);
      setFilteredTeachers([]);
      setSelectedTeacherIds([]);
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
        if (result.data.length > 0)
          toast.success(`${result.data.length} student(s) found`);
        else
          toast.error(
            `No students in Class ${form.classId}-${form.sectionId}`,
            { duration: 4000 },
          );
      } else {
        toast.error(result.message || "Failed to load students");
        setFilteredStudents([]);
      }
    } catch {
      toast.error("Failed to load students");
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
        // Reset selection when class/section changes
        setSelectedTeacherIds([]);
        if (result.data.length === 0)
          toast.error(
            `No teachers for Class ${form.classId}-${form.sectionId}`,
            { duration: 5000 },
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

  // ✅ Toggle individual teacher selection
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
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (newFiles.some((f) => f.size > 10 * 1024 * 1024)) {
        toast.error("Some files exceed 10MB");
        return;
      }
      if (attachments.length + newFiles.length > 10) {
        toast.error("Maximum 10 files");
        return;
      }
      setAttachments((prev) => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) added`);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

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
      if (!form.dueTime) missing.push("Due Time");
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
      if (dueDateTime <= new Date()) {
        toast.error("Due date must be in the future");
        return;
      }
      if (filteredStudents.length === 0) {
        toast.error("No students in this class/section");
        return;
      }

      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("subject", form.subject);
      formData.append("classId", form.classId);
      formData.append("sectionId", form.sectionId);
      formData.append("academicYear", form.academicYear);
      formData.append("totalMarks", form.totalMarks.toString());
      formData.append("dueDate", dueDateTime.toISOString());
      // ✅ Send as JSON array string
      formData.append("assignedTeacherIds", JSON.stringify(selectedTeacherIds));
      attachments.forEach((f) => formData.append("attachments", f));

      const result = await createAssignmentWithFilesAction(formData);
      if (!result.success) {
        toast.error(result.message || "Failed to create assignment", {
          duration: 4000,
        });
        return;
      }

      toast.success(
        `✅ Assignment created! ${filteredStudents.length} student(s) notified.`,
        { duration: 3000 },
      );
      setTimeout(() => router.push("/admin/dashboard/assignments"), 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to create assignment");
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

  const today = new Date().toISOString().split("T")[0];
  const isFormValid = () =>
    form.title.trim() &&
    form.description.trim() &&
    form.subject &&
    form.classId &&
    form.sectionId &&
    form.dueDate &&
    form.dueTime &&
    selectedTeacherIds.length > 0 &&
    filteredStudents.length > 0;

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
              disabled={isSaving || !isFormValid()}
            >
              {isSaving ? "Creating..." : "Create Assignment"}
            </button>
          </div>
        </div>
      </header>

      <main className="af-content">
        <div className="af-card">
          <h2 className="af-card-title">Create New Assignment</h2>
          <p className="af-card-sub">
            Fill in the details to create a new assignment
          </p>

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
                placeholder="Provide detailed instructions..."
                maxLength={1000}
                rows={6}
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
                    PDF, DOC, PPT, XLS, TXT, Images (Max 10MB each)
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

          {/* ✅ CLICKABLE MULTI-SELECT TEACHER CARDS */}
          {form.classId && form.sectionId && (
            <div className="af-teachers-section">
              <div className="af-teachers-header">
                <div>
                  <h3 className="af-teachers-title">Assign Teachers *</h3>
                  <p className="af-teachers-subtitle">
                    {selectedTeacherIds.length === 0
                      ? "Click a teacher card to assign them to this assignment"
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
                    ⚠️ No teachers assigned to Class {form.classId}-
                    {form.sectionId}
                  </p>
                  <small>
                    Please assign a teacher to this class/section first
                  </small>
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
                        className={`af-teacher-item af-teacher-selectable${isSelected ? " af-teacher-selected" : ""}`}
                        onClick={() => toggleTeacher(teacher._id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) =>
                          e.key === "Enter" && toggleTeacher(teacher._id)
                        }
                        aria-pressed={isSelected}
                      >
                        {/* Selected checkmark */}
                        {isSelected && (
                          <div className="af-teacher-check">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
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

              {/* Selected summary */}
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
                    Assigned:{" "}
                    {filteredTeachers
                      .filter((t) => selectedTeacherIds.includes(t._id))
                      .map((t) => t.fullName)
                      .join(", ")}
                  </span>
                  <button
                    className="af-clear-teachers"
                    onClick={() => setSelectedTeacherIds([])}
                  >
                    Clear
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
              {isLoadingStudents ? (
                <div className="af-students-loading">
                  <div className="af-spinner-small" />
                  <span>Loading...</span>
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
                        <div className="af-student-badge">Will receive</div>
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
        </div>
      </main>
    </div>
  );
}
