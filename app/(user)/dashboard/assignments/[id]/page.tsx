"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getAssignmentByIdStudentAction,
  submitAssignmentWithFilesAction,
} from "../../../../../lib/actions/assignment-action";
import toast from "react-hot-toast";
import "./student-assignment-detail.css";
import BackButton from "./../../../../_components/BackButton";
import PageHeader from "./../../../../_components/PageHeader";

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
  isActive: boolean;
  hasSubmitted?: boolean;
  isGraded?: boolean;
  mySubmission?: Submission;
  createdAt: string;
}

export default function StudentAssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Resubmit modal state
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      setIsLoading(true);
      const result = await getAssignmentByIdStudentAction(assignmentId);

      if (!result.success) {
        toast.error(result.message || "Failed to load assignment");
        router.push("/dashboard/assignments");
        return;
      }

      setAssignment(result.data);

      // Pre-fill text content if already submitted
      if (result.data.mySubmission?.textContent) {
        setTextContent(result.data.mySubmission.textContent);
      }
    } catch (error: any) {
      toast.error("Failed to load assignment");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Validate file size (10MB per file)
      const invalidFiles = newFiles.filter(
        (file) => file.size > 10 * 1024 * 1024,
      );
      if (invalidFiles.length > 0) {
        toast.error("Some files exceed 10MB limit");
        return;
      }

      // Limit to 10 files total
      if (files.length + newFiles.length > 10) {
        toast.error("Maximum 10 files allowed");
        return;
      }

      setFiles([...files, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!textContent.trim() && files.length === 0) {
      toast.error("Please provide either text answer or upload files");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create FormData for file upload
      const formData = new FormData();

      // Add text content
      if (textContent.trim()) {
        formData.append("textContent", textContent.trim());
      }

      // Add files
      files.forEach((file) => {
        formData.append("files", file);
      });

      const result = await submitAssignmentWithFilesAction(
        assignmentId,
        formData,
      );

      if (!result.success) {
        toast.error(result.message || "Failed to submit assignment");
        return;
      }

      toast.success(
        assignment?.hasSubmitted
          ? "Assignment resubmitted successfully!"
          : "Assignment submitted successfully!",
      );
      setShowResubmitModal(false);
      setFiles([]);

      // Refresh assignment data
      await fetchAssignment();
    } catch (error: any) {
      toast.error("Failed to submit assignment");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Improved download function with fetch API and blob handling
  const handleDownloadFile = async (fileUrl: string, fileName: string) => {
    const toastId = toast.loading(`Downloading ${fileName}...`);

    try {
      // Get API URL from environment
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

      // Build full URL
      let fullUrl = fileUrl;
      if (fileUrl.startsWith("/uploads") || fileUrl.startsWith("uploads")) {
        fullUrl = `${apiUrl}/${fileUrl.replace(/^\//, "")}`;
      }

      // Fetch the file as a blob
      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          // Add credentials if your API requires authentication
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);

      toast.success(`Downloaded: ${fileName}`, { id: toastId });
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(`Failed to download ${fileName}`, { id: toastId });
    }
  };

  const getTimeStatus = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return { status: "overdue", text: "Overdue", class: "overdue" };
    if (diffDays === 0)
      return { status: "today", text: "Due Today", class: "today" };
    if (diffDays === 1)
      return { status: "tomorrow", text: "Due Tomorrow", class: "tomorrow" };
    if (diffDays <= 3)
      return { status: "soon", text: `${diffDays} days left`, class: "soon" };
    return { status: "ok", text: `${diffDays} days left`, class: "ok" };
  };

  if (isLoading) {
    return (
      <div className="sad-page">
        <div className="sad-loading">
          <div className="sad-spinner"></div>
          <p>Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  const timeStatus = getTimeStatus(assignment.dueDate);
  const isOverdue = timeStatus.status === "overdue";
  const canSubmit = !isOverdue && !assignment.isGraded;

  return (
    <div className="sad-page">
      <main className="sad-content">
        {/* Assignment Info Card */}
        <div className="sad-card sad-info-card">
          <button
            className={`back-btn`}
            onClick={() => router.push(`/dashboard/assignments/`)}
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

          <div className="sad-card-header">
            <div>
              <h1 className="sad-title">{assignment.title}</h1>
              <p className="sad-subject">{assignment.subject}</p>
            </div>
            <div className="sad-badges">
              <span className={`sad-status-badge ${timeStatus.class}`}>
                {timeStatus.text}
              </span>
              {assignment.hasSubmitted && (
                <span className="sad-status-badge submitted">Submitted</span>
              )}
              {assignment.isGraded && (
                <span className="sad-status-badge graded">Graded</span>
              )}
            </div>
          </div>

          <div className="sad-meta-grid">
            <div className="sad-meta-item">
              <span className="sad-meta-label">Class & Section</span>
              <span className="sad-meta-value">
                Class {assignment.classId} - Section {assignment.sectionId}
              </span>
            </div>
            <div className="sad-meta-item">
              <span className="sad-meta-label">Total Marks</span>
              <span className="sad-meta-value">{assignment.totalMarks}</span>
            </div>
            <div className="sad-meta-item">
              <span className="sad-meta-label">Due Date</span>
              <span className="sad-meta-value">
                {new Date(assignment.dueDate).toLocaleString()}
              </span>
            </div>
            <div className="sad-meta-item">
              <span className="sad-meta-label">Academic Year</span>
              <span className="sad-meta-value">{assignment.academicYear}</span>
            </div>
          </div>

          <div className="sad-description">
            <h3>Description</h3>
            <p>{assignment.description}</p>
          </div>

          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="sad-attachments">
              <h3>Assignment Files</h3>
              <div className="sad-files-list">
                {assignment.attachments.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      handleDownloadFile(file.fileUrl, file.fileName)
                    }
                    className="sad-file-item sad-file-download-btn"
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
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      className="sad-download-icon"
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

          {canSubmit && (
            <div className="sad-submit-section">
              <button
                className="sad-btn-submit-main"
                onClick={() => setShowResubmitModal(true)}
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {assignment.hasSubmitted
                  ? "Resubmit Assignment"
                  : "Submit Assignment"}
              </button>
            </div>
          )}

          {isOverdue && !assignment.hasSubmitted && (
            <div className="sad-alert sad-alert-error">
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                This assignment is overdue. Submissions are no longer accepted.
              </span>
            </div>
          )}

          {assignment.isGraded && (
            <div className="sad-alert sad-alert-error">
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>
                This assignment has been graded. You cannot resubmit after
                grading.
              </span>
            </div>
          )}
        </div>

        {/* My Submission Card */}
        {assignment.hasSubmitted && assignment.mySubmission && (
          <div className="sad-card sad-submission-card">
            <h2 className="sad-card-title">My Submission</h2>

            <div className="sad-submission-meta">
              <div className="sad-meta-item">
                <span className="sad-meta-label">Submitted On</span>
                <span className="sad-meta-value">
                  {new Date(
                    assignment.mySubmission.submittedAt,
                  ).toLocaleString()}
                </span>
              </div>
              {assignment.isGraded &&
                assignment.mySubmission.marks !== undefined && (
                  <>
                    <div className="sad-meta-item">
                      <span className="sad-meta-label">Marks Obtained</span>
                      <span className="sad-meta-value sad-marks">
                        {assignment.mySubmission.marks}/{assignment.totalMarks}
                      </span>
                    </div>
                    {assignment.mySubmission.gradedAt && (
                      <div className="sad-meta-item">
                        <span className="sad-meta-label">Graded On</span>
                        <span className="sad-meta-value">
                          {new Date(
                            assignment.mySubmission.gradedAt,
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </>
                )}
            </div>

            {assignment.mySubmission.textContent && (
              <div className="sad-text-content">
                <strong>Your Answer:</strong>
                <p>{assignment.mySubmission.textContent}</p>
              </div>
            )}

            {assignment.mySubmission.files &&
              assignment.mySubmission.files.length > 0 && (
                <div className="sad-files-section">
                  <strong>Your Submitted Files:</strong>
                  <div className="sad-files-list">
                    {assignment.mySubmission.files.map((file, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          handleDownloadFile(file.fileUrl, file.fileName)
                        }
                        className="sad-file-item sad-file-download-btn"
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
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          className="sad-download-icon"
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

            {assignment.mySubmission.feedback && (
              <div className="sad-feedback-section">
                <strong>Teacher's Feedback:</strong>
                <p>{assignment.mySubmission.feedback}</p>
              </div>
            )}

            {!assignment.isGraded && (
              <div className="sad-alert sad-alert-info">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Your submission is pending evaluation by your teacher.
                </span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Resubmit Modal */}
      {showResubmitModal && (
        <div
          className="sad-modal-overlay"
          onClick={() => !isSubmitting && setShowResubmitModal(false)}
        >
          <div className="sad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sad-modal-header">
              <h2>
                {assignment.hasSubmitted
                  ? "Resubmit Assignment"
                  : "Submit Assignment"}
              </h2>
              <button
                className="sad-modal-close"
                onClick={() => setShowResubmitModal(false)}
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleResubmit} className="sad-modal-form">
              {/* Text Answer */}
              <div className="sad-form-group">
                <label htmlFor="textContent">Your Answer (Optional)</label>
                <textarea
                  id="textContent"
                  rows={8}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="sad-textarea"
                  placeholder="Write your answer here..."
                  disabled={isSubmitting}
                />
                <span className="sad-form-help">
                  Provide a text answer or upload files (or both)
                </span>
              </div>

              {/* File Upload */}
              <div className="sad-form-group">
                <label htmlFor="files">Upload Files (Optional)</label>
                <div className="sad-file-upload-area">
                  <input
                    type="file"
                    id="files"
                    multiple
                    onChange={handleFileChange}
                    className="sad-file-input"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="files" className="sad-file-label">
                    <svg
                      width="40"
                      height="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="sad-file-label-text">
                      Click to browse or drag and drop files here
                    </span>
                    <span className="sad-file-label-hint">
                      PDF, DOC, PPT, XLS, TXT, Images (Max 10MB per file, 10
                      files max)
                    </span>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="sad-files-list-modal">
                    <h4>Selected Files ({files.length}/10):</h4>
                    {files.map((file, index) => (
                      <div key={index} className="sad-file-item-modal">
                        <div className="sad-file-info">
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
                          <span className="sad-file-name">{file.name}</span>
                          <span className="sad-file-size">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="sad-btn-remove-file"
                          disabled={isSubmitting}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {assignment.hasSubmitted && (
                <div className="sad-notice">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="sad-notice-content">
                    <strong>Important:</strong>
                    <p>
                      Resubmitting will replace your previous submission. Your
                      previous files and text will be replaced with this new
                      submission.
                    </p>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="sad-form-actions">
                <button
                  type="button"
                  className="sad-btn-cancel"
                  onClick={() => setShowResubmitModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sad-btn-submit"
                  disabled={
                    isSubmitting || (!textContent.trim() && files.length === 0)
                  }
                >
                  {isSubmitting ? (
                    <>
                      <div className="sad-btn-spinner"></div>
                      {assignment.hasSubmitted
                        ? "Resubmitting..."
                        : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {assignment.hasSubmitted ? "Resubmit" : "Submit"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
