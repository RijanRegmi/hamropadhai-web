"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAssignmentByIdAdminAction } from "../../../../../../lib/actions/assignment-action";
import { getFilteredStudentsAction } from "../../../../../../lib/actions/admin-action";
import toast from "react-hot-toast";
import "./assignment-view.css";
import PageHeader from "./../../../../../_components/PageHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

// Helper function to get profile image URL
const getProfileImageUrl = (profileImage?: string) => {
  if (!profileImage) return null;
  if (profileImage.startsWith("http")) return profileImage;
  return `${API_URL}${profileImage}`;
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

interface FileAttachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
}

interface Submission {
  _id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  files: FileAttachment[];
  textContent?: string;
  marks?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
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

interface StudentWithSubmission extends Student {
  submission?: Submission;
  hasSubmitted: boolean;
  isGraded: boolean;
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
  assignedTeacherId?: string;
  assignedTeacher?: {
    _id: string;
    fullName: string;
    username: string;
  };
  attachments?: FileAttachment[];
  submissions: Submission[];
  createdBy: {
    _id: string;
    fullName: string;
    username: string;
  };
  createdAt: string;
}

export default function AdminAssignmentViewPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [students, setStudents] = useState<StudentWithSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "submitted" | "not-submitted" | "pending" | "graded"
  >("all");

  useEffect(() => {
    fetchAssignmentAndStudents();
  }, [assignmentId]);

  const fetchAssignmentAndStudents = async () => {
    try {
      setIsLoading(true);

      const result = await getAssignmentByIdAdminAction(assignmentId);

      if (!result.success) {
        toast.error(result.message || "Failed to load assignment");
        router.push("/admin/dashboard/assignments");
        return;
      }

      const assignmentData = result.data;
      setAssignment(assignmentData);

      const studentsResult = await getFilteredStudentsAction(
        assignmentData.classId,
        assignmentData.sectionId,
      );

      if (!studentsResult.success) {
        toast.error("Failed to load students");
        return;
      }

      const studentsWithSubmissions: StudentWithSubmission[] =
        studentsResult.data.map((student: Student) => {
          const submission = assignmentData.submissions.find(
            (sub: Submission) => sub.studentId === student._id,
          );

          return {
            ...student,
            submission: submission || undefined,
            hasSubmitted: !!submission,
            isGraded: submission
              ? submission.marks !== null && submission.marks !== undefined
              : false,
          };
        });

      setStudents(studentsWithSubmissions);
    } catch (error: any) {
      toast.error("Failed to load assignment");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubmissionStats = () => {
    const total = students.length;
    const submitted = students.filter((s) => s.hasSubmitted).length;
    const notSubmitted = total - submitted;
    const graded = students.filter((s) => s.isGraded).length;
    const pending = submitted - graded;

    return {
      total,
      submitted,
      notSubmitted,
      pending,
      graded,
    };
  };

  const getFilteredStudents = () => {
    switch (filterStatus) {
      case "submitted":
        return students.filter((s) => s.hasSubmitted);
      case "not-submitted":
        return students.filter((s) => !s.hasSubmitted);
      case "pending":
        return students.filter((s) => s.hasSubmitted && !s.isGraded);
      case "graded":
        return students.filter((s) => s.isGraded);
      default:
        return students;
    }
  };

  const isOverdue = () => {
    if (!assignment) return false;
    return new Date(assignment.dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="av-page">
        <div className="av-loading">
          <div className="av-spinner"></div>
          <p>Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  const stats = getSubmissionStats();
  const filteredStudents = getFilteredStudents();

  return (
    <div className="av-page">
      <PageHeader />

      <main className="av-content">
        {/* Assignment Details Card */}
        <div className="av-card av-details-card">
          <button
            className={`back-btn`}
            onClick={() => router.push(`/admin/dashboard/assignments/`)}
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
          <div className="av-card-header">
            <div>
              <h1 className="av-assignment-title">{assignment.title}</h1>
              <p className="av-assignment-subject">{assignment.subject}</p>
            </div>
            <span
              className={`av-status-badge ${isOverdue() ? "overdue" : "active"}`}
            >
              {isOverdue() ? "Overdue" : "Active"}
            </span>
          </div>

          <div className="av-assignment-meta">
            <div className="av-meta-item">
              <span className="av-meta-label">Class & Section</span>
              <span className="av-meta-value">
                Class {assignment.classId} - Section {assignment.sectionId}
              </span>
            </div>
            <div className="av-meta-item">
              <span className="av-meta-label">Total Marks</span>
              <span className="av-meta-value">{assignment.totalMarks}</span>
            </div>
            <div className="av-meta-item">
              <span className="av-meta-label">Due Date</span>
              <span className="av-meta-value">
                {new Date(assignment.dueDate).toLocaleString()}
              </span>
            </div>
            <div className="av-meta-item">
              <span className="av-meta-label">Created By</span>
              <span className="av-meta-value">
                {assignment.createdBy.fullName}
              </span>
            </div>
            {assignment.assignedTeacher && (
              <div className="av-meta-item">
                <span className="av-meta-label">Assigned Teacher</span>
                <span className="av-meta-value">
                  {assignment.assignedTeacher.fullName}
                </span>
              </div>
            )}
            <div className="av-meta-item">
              <span className="av-meta-label">Academic Year</span>
              <span className="av-meta-value">{assignment.academicYear}</span>
            </div>
          </div>

          <div className="av-description-section">
            <h3 className="av-section-title">Description</h3>
            <p className="av-description-text">{assignment.description}</p>
          </div>

          {/* Assignment Attachments - UPDATED WITH DOWNLOAD */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="av-attachments-section">
              <h3 className="av-section-title">Assignment Attachments</h3>
              <div className="av-files-list">
                {assignment.attachments.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      handleFileDownload(file.fileUrl, file.fileName)
                    }
                    className="av-file-item av-file-download-btn"
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
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Statistics Card */}
        <div className="av-card av-stats-card">
          <h2 className="av-card-title">Submission Statistics</h2>
          <div className="av-stats-grid">
            <div className="av-stat-item">
              <div className="av-stat-icon av-stat-total">👥</div>
              <div className="av-stat-content">
                <span className="av-stat-label">Total Students</span>
                <span className="av-stat-value">{stats.total}</span>
              </div>
            </div>
            <div className="av-stat-item">
              <div className="av-stat-icon av-stat-submitted">✅</div>
              <div className="av-stat-content">
                <span className="av-stat-label">Submitted</span>
                <span className="av-stat-value">{stats.submitted}</span>
              </div>
            </div>
            <div className="av-stat-item">
              <div className="av-stat-icon av-stat-not-submitted">❌</div>
              <div className="av-stat-content">
                <span className="av-stat-label">Not Submitted</span>
                <span className="av-stat-value">{stats.notSubmitted}</span>
              </div>
            </div>
            <div className="av-stat-item">
              <div className="av-stat-icon av-stat-pending">⏳</div>
              <div className="av-stat-content">
                <span className="av-stat-label">Pending Grading</span>
                <span className="av-stat-value">{stats.pending}</span>
              </div>
            </div>
            <div className="av-stat-item">
              <div className="av-stat-icon av-stat-graded">⭐</div>
              <div className="av-stat-content">
                <span className="av-stat-label">Graded</span>
                <span className="av-stat-value">{stats.graded}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Submissions */}
        <div className="av-card av-submissions-card">
          <div className="av-submissions-header">
            <h2 className="av-card-title">
              Student Submissions ({filteredStudents.length})
            </h2>

            <div className="av-filter-buttons">
              <button
                className={`av-filter-btn ${filterStatus === "all" ? "active" : ""}`}
                onClick={() => setFilterStatus("all")}
              >
                All ({stats.total})
              </button>
              <button
                className={`av-filter-btn ${filterStatus === "submitted" ? "active" : ""}`}
                onClick={() => setFilterStatus("submitted")}
              >
                Submitted ({stats.submitted})
              </button>
              <button
                className={`av-filter-btn ${filterStatus === "not-submitted" ? "active" : ""}`}
                onClick={() => setFilterStatus("not-submitted")}
              >
                Not Submitted ({stats.notSubmitted})
              </button>
              <button
                className={`av-filter-btn ${filterStatus === "pending" ? "active" : ""}`}
                onClick={() => setFilterStatus("pending")}
              >
                Pending ({stats.pending})
              </button>
              <button
                className={`av-filter-btn ${filterStatus === "graded" ? "active" : ""}`}
                onClick={() => setFilterStatus("graded")}
              >
                Graded ({stats.graded})
              </button>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="av-empty-state">
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
            <div className="av-submissions-list">
              {filteredStudents.map((student) => {
                const profileUrl = getProfileImageUrl(student.profileImage);

                return (
                  <div key={student._id} className="av-submission-item">
                    <div className="av-submission-header">
                      <div className="av-student-info">
                        <div className="av-student-avatar">
                          {profileUrl ? (
                            <img
                              src={profileUrl}
                              alt={student.fullName}
                              className="av-avatar-image"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.parentElement!.innerText =
                                  student.fullName.charAt(0).toUpperCase();
                              }}
                            />
                          ) : (
                            student.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h4 className="av-student-name">
                            {student.fullName}
                          </h4>
                          <p className="av-submission-date">
                            @{student.username}
                          </p>
                        </div>
                      </div>
                      <div className="av-submission-status">
                        {!student.hasSubmitted ? (
                          <span className="av-grade-badge not-submitted">
                            Not Submitted
                          </span>
                        ) : student.isGraded ? (
                          <span className="av-grade-badge graded">
                            {student.submission!.marks}/{assignment.totalMarks}
                          </span>
                        ) : (
                          <span className="av-grade-badge pending">
                            Pending Grading
                          </span>
                        )}
                      </div>
                    </div>

                    {student.hasSubmitted && student.submission && (
                      <>
                        <div className="av-submission-meta">
                          <span>
                            Submitted:{" "}
                            {new Date(
                              student.submission.submittedAt,
                            ).toLocaleString()}
                          </span>
                        </div>

                        {student.submission.textContent && (
                          <div className="av-text-content">
                            <p>{student.submission.textContent}</p>
                          </div>
                        )}

                        {student.submission.files &&
                          student.submission.files.length > 0 && (
                            <div className="av-files-section">
                              <p className="av-files-label">Attached Files:</p>
                              <div className="av-files-list">
                                {student.submission.files.map((file, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() =>
                                      handleFileDownload(
                                        file.fileUrl,
                                        file.fileName,
                                      )
                                    }
                                    className="av-file-item av-file-download-btn"
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
                                ))}
                              </div>
                            </div>
                          )}

                        {student.submission.feedback && (
                          <div className="av-feedback-section">
                            <p className="av-feedback-label">
                              Teacher Feedback:
                            </p>
                            <p className="av-feedback-text">
                              {student.submission.feedback}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
