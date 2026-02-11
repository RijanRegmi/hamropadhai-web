"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getMyAssignmentsStudentAction,
  getPendingAssignmentsAction,
  getSubmittedAssignmentsAction,
  getGradedAssignmentsAction,
  getAssignmentHistoryStudentAction,
} from "../../../../lib/actions/assignment-action";
import toast from "react-hot-toast";
import PageHeader from "./../../../_components/PageHeader"; // Adjust path as needed
import BackButton from "./../../../_components/BackButton"; // Adjust path as needed
import "./student-assignments.css";

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
  hasSubmitted?: boolean;
  isGraded?: boolean;
  mySubmission?: any;
  createdAt: string;
}

export default function StudentAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<
    "all" | "pending" | "submitted" | "graded" | "history"
  >("all");
  const [filterSubject, setFilterSubject] = useState<string>("");

  useEffect(() => {
    fetchAssignments();
  }, [viewMode]);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);

      let result;
      switch (viewMode) {
        case "pending":
          result = await getPendingAssignmentsAction();
          break;
        case "submitted":
          result = await getSubmittedAssignmentsAction();
          break;
        case "graded":
          result = await getGradedAssignmentsAction();
          break;
        case "history":
          result = await getAssignmentHistoryStudentAction();
          break;
        default:
          result = await getMyAssignmentsStudentAction();
      }

      if (result.success) {
        setAssignments(result.data || []);
      } else {
        toast.error(result.message || "Failed to load assignments");
      }
    } catch (error: any) {
      toast.error("Failed to load assignments");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredAssignments = () => {
    return assignments.filter((assignment) => {
      if (
        filterSubject &&
        !assignment.subject.toLowerCase().includes(filterSubject.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  };

  const filteredAssignments = getFilteredAssignments();

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

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.isGraded && assignment.mySubmission) {
      return {
        text: `Graded: ${assignment.mySubmission.marks}/${assignment.totalMarks}`,
        class: "graded",
      };
    }
    if (assignment.hasSubmitted) {
      return { text: "Submitted", class: "submitted" };
    }
    const timeStatus = getTimeStatus(assignment.dueDate);
    if (timeStatus.status === "overdue") {
      return { text: "Overdue - Not Submitted", class: "overdue" };
    }
    return { text: "Not Submitted", class: "pending" };
  };

  if (isLoading) {
    return (
      <div className="sa-page">
        <PageHeader />
        <div className="sa-loading">
          <div className="sa-spinner"></div>
          <p>Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sa-page">
      <PageHeader />

      <main className="sa-content">
        <div className="sa-card">
          <div className="sa-card-header">
            <BackButton backUrl="/dashboard" />
            <div>
              <h2 className="sa-card-title">My Assignments</h2>
              <p className="sa-card-sub">
                View and submit your class assignments (
                {filteredAssignments.length} assignments)
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="sa-view-toggle">
            <button
              className={`sa-toggle-btn ${viewMode === "all" ? "active" : ""}`}
              onClick={() => setViewMode("all")}
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              All
            </button>
            <button
              className={`sa-toggle-btn ${viewMode === "pending" ? "active" : ""}`}
              onClick={() => setViewMode("pending")}
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending
            </button>
            <button
              className={`sa-toggle-btn ${viewMode === "submitted" ? "active" : ""}`}
              onClick={() => setViewMode("submitted")}
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
              Submitted
            </button>
            <button
              className={`sa-toggle-btn ${viewMode === "graded" ? "active" : ""}`}
              onClick={() => setViewMode("graded")}
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Graded
            </button>
            <button
              className={`sa-toggle-btn ${viewMode === "history" ? "active" : ""}`}
              onClick={() => setViewMode("history")}
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button>
          </div>

          {/* Filters */}
          <div className="sa-filters">
            <input
              type="text"
              className="sa-filter-input"
              placeholder="Filter by subject..."
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            />
            {filterSubject && (
              <button
                className="sa-btn-clear-filters"
                onClick={() => setFilterSubject("")}
              >
                Clear Filter
              </button>
            )}
          </div>

          {/* Assignments Grid */}
          {filteredAssignments.length === 0 ? (
            <div className="sa-empty-state">
              <svg
                width="80"
                height="80"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3>No Assignments Found</h3>
              <p>
                {viewMode === "all" &&
                  "You don't have any active assignments yet."}
                {viewMode === "pending" && "No pending assignments to submit."}
                {viewMode === "submitted" &&
                  "You haven't submitted any assignments yet."}
                {viewMode === "graded" && "No graded assignments yet."}
                {viewMode === "history" && "No past assignments yet."}
              </p>
            </div>
          ) : (
            <div className="sa-assignments-grid">
              {filteredAssignments.map((assignment) => {
                const timeStatus = getTimeStatus(assignment.dueDate);
                const statusBadge = getStatusBadge(assignment);

                return (
                  <div
                    key={assignment._id}
                    className={`sa-assignment-card ${timeStatus.class}`}
                  >
                    <div className="sa-assignment-header">
                      <div className="sa-assignment-title">
                        <h3>{assignment.title}</h3>
                        <div className="sa-badges">
                          {viewMode !== "history" && (
                            <span
                              className={`sa-time-badge ${timeStatus.class}`}
                            >
                              {timeStatus.text}
                            </span>
                          )}
                          <span
                            className={`sa-status-badge ${statusBadge.class}`}
                          >
                            {statusBadge.text}
                          </span>
                        </div>
                      </div>
                      <p className="sa-assignment-subject">
                        {assignment.subject}
                      </p>
                    </div>

                    <div className="sa-assignment-meta">
                      <div className="sa-meta-item">
                        <span className="sa-meta-label">Class:</span>
                        <span className="sa-meta-value">
                          {assignment.classId} - {assignment.sectionId}
                        </span>
                      </div>
                      <div className="sa-meta-item">
                        <span className="sa-meta-label">Total Marks:</span>
                        <span className="sa-meta-value">
                          {assignment.totalMarks}
                        </span>
                      </div>
                      <div className="sa-meta-item">
                        <span className="sa-meta-label">Due Date:</span>
                        <span className="sa-meta-value">
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="sa-assignment-description">
                      <p>{assignment.description.substring(0, 120)}...</p>
                    </div>

                    <div className="sa-assignment-actions">
                      <button
                        className="sa-btn-view"
                        onClick={() =>
                          router.push(
                            `/dashboard/assignments/${assignment._id}`,
                          )
                        }
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        View Details
                      </button>
                      {!assignment.hasSubmitted &&
                        timeStatus.status !== "overdue" &&
                        viewMode !== "history" && (
                          <button
                            className="sa-btn-submit"
                            onClick={() =>
                              router.push(
                                `/dashboard/assignments/${assignment._id}/submit`,
                              )
                            }
                          >
                            <svg
                              width="16"
                              height="16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Submit Assignment
                          </button>
                        )}
                    </div>

                    <div className="sa-assignment-footer">
                      <span className="sa-assignment-date">
                        Created{" "}
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
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
