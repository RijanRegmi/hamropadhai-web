"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getAssignmentByIdTeacherAction,
  gradeSubmissionAction,
} from "../../../../../../lib/actions/assignment-action";
import toast from "react-hot-toast";
import "./teacher-assignment-detail.css";
import PageHeader from "./../../../../../_components/PageHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

interface FileAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
}

interface Submission {
  _id?: string;
  studentId: string;
  studentName: string;
  submittedAt: Date | string;
  files: FileAttachment[];
  textContent?: string;
  marks?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: Date | string;
}

interface Student {
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
  attachments?: FileAttachment[];
  submissions: Submission[];
  isActive: boolean;
  createdAt: string;
  students?: StudentWithSubmission[];
}

interface StudentWithSubmission extends Student {
  submission?: Submission;
  hasSubmitted: boolean;
  isGraded: boolean;
}

// Helper function to get profile image URL
const getProfileImageUrl = (profileImage?: string) => {
  if (!profileImage) return null;

  // If it's already a full URL, return as is
  if (
    profileImage.startsWith("http://") ||
    profileImage.startsWith("https://")
  ) {
    return profileImage;
  }

  // If it starts with a slash, append to API_URL
  if (profileImage.startsWith("/")) {
    return `${API_URL}${profileImage}`;
  }

  // Otherwise, assume it's a relative path and append
  return `${API_URL}/${profileImage}`;
};

// Helper function to handle file download
const handleFileDownload = (fileUrl: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Student Card Component
function StudentCard({ student, assignment, onGrade }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const profileUrl = getProfileImageUrl(student.profileImage);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="tad-student-card">
      {/* Collapsed Header */}
      <div
        className="tad-student-card-header"
        onClick={() => student.hasSubmitted && setIsExpanded(!isExpanded)}
        style={{ cursor: student.hasSubmitted ? "pointer" : "default" }}
      >
        <div className="tad-student-info">
          <div className="tad-student-avatar">
            {profileUrl && !imageError ? (
              <img
                src={profileUrl}
                alt={student.fullName}
                className="tad-avatar-image"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="tad-avatar-initials">
                {getInitials(student.fullName)}
              </span>
            )}
          </div>
          <div>
            <h4 className="tad-student-name">{student.fullName}</h4>
            <p className="tad-student-username">@{student.username}</p>
          </div>
        </div>

        <div className="tad-student-status">
          {!student.hasSubmitted ? (
            <span className="tad-status-badge not-submitted">
              NOT SUBMITTED
            </span>
          ) : student.isGraded ? (
            <span className="tad-status-badge graded">
              GRADED: {student.submission?.marks}/{assignment.totalMarks}
            </span>
          ) : (
            <span className="tad-status-badge pending">PENDING GRADING</span>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {student.hasSubmitted && student.submission && isExpanded && (
        <div className="tad-student-card-body">
          <div className="tad-submission-info">
            <span className="tad-submitted-label">
              Submitted:{" "}
              {new Date(student.submission.submittedAt).toLocaleString()}
            </span>
          </div>

          {student.submission.textContent && (
            <div className="tad-section">
              <h5 className="tad-section-title">TEXT ANSWER:</h5>
              <div className="tad-section-content">
                {student.submission.textContent}
              </div>
            </div>
          )}

          {student.submission.files && student.submission.files.length > 0 && (
            <div className="tad-section">
              <h5 className="tad-section-title">ATTACHED FILES:</h5>
              <div className="tad-files-grid">
                {student.submission.files.map(
                  (file: FileAttachment, idx: number) => (
                    <button
                      key={idx}
                      onClick={() =>
                        handleFileDownload(file.fileUrl, file.fileName)
                      }
                      className="tad-file-link"
                      type="button"
                    >
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
                      {file.fileName}
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        style={{ marginLeft: "auto" }}
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {student.submission.feedback && (
            <div className="tad-section">
              <h5 className="tad-section-title">YOUR FEEDBACK:</h5>
              <div className="tad-section-content">
                {student.submission.feedback}
              </div>
            </div>
          )}

          <button
            className="tad-btn-update-grade"
            onClick={(e) => {
              e.stopPropagation();
              onGrade(student);
            }}
          >
            {student.isGraded ? "Update Grade" : "Grade Submission"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function TeacherAssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [students, setStudents] = useState<StudentWithSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "submitted" | "not-submitted" | "graded" | "pending"
  >("all");

  // Grading modal state
  const [gradingStudent, setGradingStudent] =
    useState<StudentWithSubmission | null>(null);
  const [gradingMarks, setGradingMarks] = useState<number>(0);
  const [gradingFeedback, setGradingFeedback] = useState<string>("");
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    fetchAssignmentAndStudents();
  }, [assignmentId]);

  const fetchAssignmentAndStudents = async () => {
    try {
      setIsLoading(true);

      const assignmentResult =
        await getAssignmentByIdTeacherAction(assignmentId);

      if (!assignmentResult.success) {
        toast.error(assignmentResult.message || "Failed to load assignment");
        router.push("/teacher/dashboard/assignments");
        return;
      }

      const assignmentData = assignmentResult.data;
      setAssignment(assignmentData);

      if (assignmentData.students && Array.isArray(assignmentData.students)) {
        console.log(
          "✅ Setting students from assignment data:",
          assignmentData.students.length,
        );

        // Log profile image data for debugging
        assignmentData.students.forEach((student: StudentWithSubmission) => {
          console.log(`Student ${student.fullName}:`, {
            profileImage: student.profileImage,
            profileUrl: getProfileImageUrl(student.profileImage),
          });
        });

        setStudents(assignmentData.students);
      } else {
        console.error(
          "❌ No students array in assignment data:",
          assignmentData,
        );
        toast.error("Failed to load student data");
        setStudents([]);
      }
    } catch (error: any) {
      toast.error("Failed to load assignment details");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredStudents = () => {
    switch (filterStatus) {
      case "submitted":
        return students.filter((s) => s.hasSubmitted);
      case "not-submitted":
        return students.filter((s) => !s.hasSubmitted);
      case "graded":
        return students.filter((s) => s.isGraded);
      case "pending":
        return students.filter((s) => s.hasSubmitted && !s.isGraded);
      default:
        return students;
    }
  };

  const handleGradeClick = (student: StudentWithSubmission) => {
    setGradingStudent(student);
    setGradingMarks(student.submission?.marks || 0);
    setGradingFeedback(student.submission?.feedback || "");
  };

  const handleSubmitGrade = async () => {
    if (!gradingStudent || !assignment) return;

    if (gradingMarks > assignment.totalMarks) {
      toast.error(`Marks cannot exceed ${assignment.totalMarks}`);
      return;
    }

    if (gradingMarks < 0) {
      toast.error("Marks cannot be negative");
      return;
    }

    try {
      setIsGrading(true);

      const result = await gradeSubmissionAction(assignmentId, {
        studentId: gradingStudent._id,
        marks: gradingMarks,
        feedback: gradingFeedback,
      });

      if (!result.success) {
        toast.error(result.message || "Failed to grade submission");
        return;
      }

      toast.success("Submission graded successfully!");
      setGradingStudent(null);
      setGradingMarks(0);
      setGradingFeedback("");

      await fetchAssignmentAndStudents();
    } catch (error) {
      toast.error("Failed to submit grade");
      console.error(error);
    } finally {
      setIsGrading(false);
    }
  };

  const getStats = () => {
    const total = students.length;
    const submitted = students.filter((s) => s.hasSubmitted).length;
    const notSubmitted = total - submitted;
    const graded = students.filter((s) => s.isGraded).length;
    const pending = submitted - graded;

    return { total, submitted, notSubmitted, graded, pending };
  };

  if (isLoading) {
    return (
      <div className="tad-page">
        <div className="tad-loading">
          <div className="tad-spinner"></div>
          <p>Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  const stats = getStats();
  const filteredStudents = getFilteredStudents();
  const isOverdue = new Date(assignment.dueDate) < new Date();

  return (
    <div className="tad-page">
      <PageHeader />

      <main className="tad-content">
        {/* Assignment Info Card */}
        <div className="tad-card tad-info-card">
          <button
            className={`back-btn`}
            onClick={() => router.push(`/teacher/dashboard/assignments/`)}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
            <span className="back-btn-text">Back</span>
          </button>
          <div className="tad-card-header">
            <div>
              <h1 className="tad-title">{assignment.title}</h1>
              <p className="tad-subject">{assignment.subject}</p>
            </div>
            <span
              className={`tad-status-badge ${isOverdue ? "overdue" : "active"}`}
            >
              {isOverdue ? "Overdue" : "Active"}
            </span>
          </div>

          <div className="tad-meta-grid">
            <div className="tad-meta-item">
              <span className="tad-meta-label">Class & Section</span>
              <span className="tad-meta-value">
                Class {assignment.classId} - Section {assignment.sectionId}
              </span>
            </div>
            <div className="tad-meta-item">
              <span className="tad-meta-label">Total Marks</span>
              <span className="tad-meta-value">{assignment.totalMarks}</span>
            </div>
            <div className="tad-meta-item">
              <span className="tad-meta-label">Due Date</span>
              <span className="tad-meta-value">
                {new Date(assignment.dueDate).toLocaleString()}
              </span>
            </div>
            <div className="tad-meta-item">
              <span className="tad-meta-label">Academic Year</span>
              <span className="tad-meta-value">{assignment.academicYear}</span>
            </div>
          </div>

          <div className="tad-description">
            <h3>Description</h3>
            <p>{assignment.description}</p>
          </div>

          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="tad-attachments">
              <h3>Assignment Attachments</h3>
              <div className="tad-files-list">
                {assignment.attachments.map(
                  (file: FileAttachment, idx: number) => (
                    <button
                      key={idx}
                      onClick={() =>
                        handleFileDownload(file.fileUrl, file.fileName)
                      }
                      className="tad-file-item"
                      type="button"
                    >
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
                      <span>{file.fileName}</span>
                      <svg
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        style={{ marginLeft: "auto" }}
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        {/* Statistics Card */}
        <div className="tad-card tad-stats-card">
          <h2>Submission Statistics</h2>
          <div className="tad-stats-grid">
            <div className="tad-stat-item">
              <div className="tad-stat-icon total">👥</div>
              <div className="tad-stat-content">
                <span className="tad-stat-label">Total Students</span>
                <span className="tad-stat-value">{stats.total}</span>
              </div>
            </div>
            <div className="tad-stat-item">
              <div className="tad-stat-icon submitted">✅</div>
              <div className="tad-stat-content">
                <span className="tad-stat-label">Submitted</span>
                <span className="tad-stat-value">{stats.submitted}</span>
              </div>
            </div>
            <div className="tad-stat-item">
              <div className="tad-stat-icon not-submitted">❌</div>
              <div className="tad-stat-content">
                <span className="tad-stat-label">Not Submitted</span>
                <span className="tad-stat-value">{stats.notSubmitted}</span>
              </div>
            </div>
            <div className="tad-stat-item">
              <div className="tad-stat-icon graded">⭐</div>
              <div className="tad-stat-content">
                <span className="tad-stat-label">Graded</span>
                <span className="tad-stat-value">{stats.graded}</span>
              </div>
            </div>
            <div className="tad-stat-item">
              <div className="tad-stat-icon pending">⏳</div>
              <div className="tad-stat-content">
                <span className="tad-stat-label">Pending Grading</span>
                <span className="tad-stat-value">{stats.pending}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="tad-card tad-students-card">
          <div className="tad-students-header">
            <h2>Student Submissions ({filteredStudents.length})</h2>

            <div className="tad-filter-buttons">
              <button
                className={`tad-filter-btn ${filterStatus === "all" ? "active" : ""}`}
                onClick={() => setFilterStatus("all")}
              >
                All ({stats.total})
              </button>
              <button
                className={`tad-filter-btn ${filterStatus === "submitted" ? "active" : ""}`}
                onClick={() => setFilterStatus("submitted")}
              >
                Submitted ({stats.submitted})
              </button>
              <button
                className={`tad-filter-btn ${filterStatus === "not-submitted" ? "active" : ""}`}
                onClick={() => setFilterStatus("not-submitted")}
              >
                Not Submitted ({stats.notSubmitted})
              </button>
              <button
                className={`tad-filter-btn ${filterStatus === "graded" ? "active" : ""}`}
                onClick={() => setFilterStatus("graded")}
              >
                Graded ({stats.graded})
              </button>
              <button
                className={`tad-filter-btn ${filterStatus === "pending" ? "active" : ""}`}
                onClick={() => setFilterStatus("pending")}
              >
                Pending ({stats.pending})
              </button>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="tad-empty-state">
              <svg
                width="64"
                height="64"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No students found</p>
            </div>
          ) : (
            <div className="tad-students-list">
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student._id}
                  student={student}
                  assignment={assignment}
                  onGrade={handleGradeClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Grading Modal */}
      {gradingStudent && (
        <div
          className="tad-modal-overlay"
          onClick={() => setGradingStudent(null)}
        >
          <div className="tad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tad-modal-header">
              <h2>Grade Submission</h2>
              <button
                className="tad-modal-close"
                onClick={() => setGradingStudent(null)}
              >
                ×
              </button>
            </div>

            <div className="tad-modal-body">
              <div className="tad-modal-student">
                <strong>Student:</strong> {gradingStudent.fullName}
              </div>

              <div className="tad-form-group">
                <label htmlFor="marks">
                  Marks (out of {assignment.totalMarks})
                  <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="marks"
                  min="0"
                  max={assignment.totalMarks}
                  value={gradingMarks}
                  onChange={(e) => setGradingMarks(Number(e.target.value))}
                  className="tad-input"
                />
              </div>

              <div className="tad-form-group">
                <label htmlFor="feedback">Feedback (Optional)</label>
                <textarea
                  id="feedback"
                  rows={4}
                  value={gradingFeedback}
                  onChange={(e) => setGradingFeedback(e.target.value)}
                  className="tad-textarea"
                  placeholder="Enter feedback for the student..."
                />
              </div>
            </div>

            <div className="tad-modal-footer">
              <button
                className="tad-btn-cancel"
                onClick={() => setGradingStudent(null)}
                disabled={isGrading}
              >
                Cancel
              </button>
              <button
                className="tad-btn-submit"
                onClick={handleSubmitGrade}
                disabled={isGrading}
              >
                {isGrading ? "Submitting..." : "Submit Grade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
