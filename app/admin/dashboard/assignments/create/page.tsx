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

  const getCurrentAcademicYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    if (currentMonth < 3) {
      return `${currentYear - 1}-${currentYear}`;
    } else {
      return `${currentYear}-${currentYear + 1}`;
    }
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
    assignedTeacherId: "", // REQUIRED field
  });

  useEffect(() => {
    if (form.classId && form.sectionId) {
      fetchFilteredStudents();
      fetchFilteredTeachers();
    } else {
      setFilteredStudents([]);
      setFilteredTeachers([]);
      setForm((prev) => ({ ...prev, assignedTeacherId: "" }));
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
        if (result.data.length > 0) {
          toast.success(
            `${result.data.length} student(s) found in Class ${form.classId}-${form.sectionId}`,
          );
        } else {
          toast.error(
            `No students found in Class ${form.classId}-${form.sectionId}. Please check enrollment.`,
            { duration: 4000 },
          );
        }
      } else {
        toast.error(result.message || "Failed to load students");
        setFilteredStudents([]);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
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
        if (result.data.length === 0) {
          toast.error(
            `⚠️ No teachers assigned to Class ${form.classId}-${form.sectionId}. Please assign a teacher first.`,
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

      // Max 10 files total
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

      // Date validation
      const dueDateTimeString = `${form.dueDate}T${form.dueTime}:00`;
      const dueDateTime = new Date(dueDateTimeString);
      const now = new Date();

      if (dueDateTime <= now) {
        toast.error("⏰ Due date and time must be in the future");
        return;
      }

      if (filteredStudents.length === 0) {
        toast.error(
          `❌ Cannot create assignment: No students found in Class ${form.classId} - Section ${form.sectionId}. Please enroll students first.`,
          { duration: 5000 },
        );
        return;
      }

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

      // Append files with the field name "attachments"
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      console.log("📤 Submitting assignment with", attachments.length, "files");
      console.log("📤 Assigned Teacher ID:", form.assignedTeacherId);

      const result = await createAssignmentWithFilesAction(formData);

      if (!result.success) {
        toast.error(result.message || "Failed to create assignment", {
          duration: 4000,
        });
        return;
      }

      toast.success(
        `✅ Assignment created successfully! ${filteredStudents.length} student(s) will be notified.`,
        { duration: 3000 },
      );

      setTimeout(() => {
        router.push("/admin/dashboard/assignments");
      }, 1500);
    } catch (error: any) {
      console.error("❌ Assignment creation error:", error);
      toast.error(error.message || "Failed to create assignment", {
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getProfileImageUrl = (profileImage?: string) => {
    if (!profileImage) return null;
    if (profileImage.startsWith("http")) return profileImage;
    return `${API_URL}${profileImage}`;
  };

  const today = new Date().toISOString().split("T")[0];
  const isFormValid = () => {
    return (
      form.title.trim() &&
      form.description.trim() &&
      form.subject &&
      form.classId &&
      form.sectionId &&
      form.dueDate &&
      form.dueTime &&
      form.assignedTeacherId && // ✅ REQUIRED
      filteredStudents.length > 0
    );
  };

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
              disabled={isSaving || !isFormValid()}
              title={
                !isFormValid()
                  ? "Please fill in all required fields including assigned teacher"
                  : "Create Assignment"
              }
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
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() + i - 2;
                  const academicYear = `${year}-${year + 1}`;
                  return (
                    <option key={academicYear} value={academicYear}>
                      {academicYear}
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
                style={{
                  color: filteredTeachers.length === 0 ? "red" : "inherit",
                }}
              >
                {filteredTeachers.length === 0 && form.classId && form.sectionId
                  ? "⚠️ No teachers available for this class/section. Please assign a teacher first."
                  : "Teacher assignment is required for creating assignments."}
              </span>
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

          {/* STUDENTS WITH PROFILE PICTURES */}
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
