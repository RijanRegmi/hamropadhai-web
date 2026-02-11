"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getAssignmentByIdStudentAction,
  submitAssignmentAction,
} from "../../../../../../lib/actions/assignment-action";
import toast from "react-hot-toast";
import "./student-assignment-submit.css";
import BackButton from "./../../../../../_components/BackButton";
import PageHeader from "./../../../../../_components/PageHeader";

interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject: string;
  totalMarks: number;
  dueDate: string;
  hasSubmitted?: boolean;
}

export default function StudentAssignmentSubmitPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
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

      const assignmentData = result.data;
      setAssignment(assignmentData);

      // Check if already submitted or overdue
      if (assignmentData.hasSubmitted) {
        toast.error("You have already submitted this assignment");
        router.push(`/dashboard/assignments/${assignmentId}`);
        return;
      }

      const isOverdue = new Date(assignmentData.dueDate) < new Date();
      if (isOverdue) {
        toast.error("This assignment is overdue");
        router.push(`/dashboard/assignments/${assignmentId}`);
        return;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!textContent.trim() && files.length === 0) {
      toast.error("Please provide either text answer or upload files");
      return;
    }

    try {
      setIsSubmitting(true);

      // For now, we'll use a simple approach without actual file upload
      // In production, you'd upload files to server first and get URLs
      const submissionData = {
        textContent: textContent.trim() || undefined,
        files: files.map((file, index) => ({
          fileName: file.name,
          fileUrl: `/temp/${file.name}`, // This would be actual URL from server
          fileType: file.type.startsWith("image/") ? "image" : "document",
          fileSize: file.size,
        })),
      };

      const result = await submitAssignmentAction(assignmentId, submissionData);

      if (!result.success) {
        toast.error(result.message || "Failed to submit assignment");
        return;
      }

      toast.success("Assignment submitted successfully!");
      router.push(`/dashboard/assignments/${assignmentId}`);
    } catch (error: any) {
      toast.error("Failed to submit assignment");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sas-page">
        <div className="sas-loading">
          <div className="sas-spinner"></div>
          <p>Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  return (
    <div className="sas-page">
      {/* <PageHeader /> */}

      <main className="sas-content">
        <div className="sas-card">
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
          <div className="sas-card-header">
            <div>
              <h1 className="sas-title">Submit Assignment</h1>
              <p className="sas-subtitle">{assignment.title}</p>
            </div>
            <div className="sas-info-box">
              <div className="sas-info-item">
                <span className="sas-info-label">Subject:</span>
                <span className="sas-info-value">{assignment.subject}</span>
              </div>
              <div className="sas-info-item">
                <span className="sas-info-label">Total Marks:</span>
                <span className="sas-info-value">{assignment.totalMarks}</span>
              </div>
              <div className="sas-info-item">
                <span className="sas-info-label">Due Date:</span>
                <span className="sas-info-value">
                  {new Date(assignment.dueDate).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="sas-form">
            {/* Text Answer */}
            <div className="sas-form-group">
              <label htmlFor="textContent">Your Answer (Optional)</label>
              <textarea
                id="textContent"
                rows={8}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="sas-textarea"
                placeholder="Write your answer here..."
              />
              <span className="sas-form-help">
                Provide a text answer or upload files (or both)
              </span>
            </div>

            {/* File Upload */}
            <div className="sas-form-group">
              <label htmlFor="files">Upload Files (Optional)</label>
              <div className="sas-file-upload-area">
                <input
                  type="file"
                  id="files"
                  multiple
                  onChange={handleFileChange}
                  className="sas-file-input"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                />
                <label htmlFor="files" className="sas-file-label">
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
                  <span className="sas-file-label-text">
                    Click to browse or drag and drop files here
                  </span>
                  <span className="sas-file-label-hint">
                    PDF, DOC, PPT, XLS, TXT, Images (Max 10MB per file, 10 files
                    max)
                  </span>
                </label>
              </div>

              {files.length > 0 && (
                <div className="sas-files-list">
                  <h4>Selected Files ({files.length}/10):</h4>
                  {files.map((file, index) => (
                    <div key={index} className="sas-file-item">
                      <div className="sas-file-info">
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
                        <span className="sas-file-name">{file.name}</span>
                        <span className="sas-file-size">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="sas-btn-remove-file"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Important Notice */}
            <div className="sas-notice">
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
              <div className="sas-notice-content">
                <strong>Important:</strong>
                <ul>
                  <li>You can submit text, files, or both</li>
                  <li>Once submitted, you cannot modify your submission</li>
                  <li>
                    Make sure all information is correct before submitting
                  </li>
                </ul>
              </div>
            </div>

            {/* Form Actions */}
            <div className="sas-form-actions">
              <button
                type="button"
                className="sas-btn-cancel"
                onClick={() =>
                  router.push(`/dashboard/assignments/${assignmentId}`)
                }
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="sas-btn-submit"
                disabled={
                  isSubmitting || (!textContent.trim() && files.length === 0)
                }
              >
                {isSubmitting ? (
                  <>
                    <div className="sas-btn-spinner"></div>
                    Submitting...
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
                    Submit Assignment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
