"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAllAssignmentsAdminAction,
  deleteAssignmentAction,
  getAssignmentHistoryAdminAction,
} from "../../../../lib/actions/assignment-action";
import toast from "react-hot-toast";
import "./assignments.css";
import PageHeader from "./../../../_components/PageHeader";

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
  submissions: any[];
  createdAt: string;
}

export default function AdminAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [historyAssignments, setHistoryAssignments] = useState<Assignment[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [filterClass, setFilterClass] = useState<string>("");
  const [filterSection, setFilterSection] = useState<string>("");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [viewMode, setViewMode] = useState<"active" | "history">("active");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);

      const [activeResult, historyResult] = await Promise.all([
        getAllAssignmentsAdminAction(),
        getAssignmentHistoryAdminAction(),
      ]);

      if (activeResult.success) {
        setAssignments(activeResult.data || []);
      } else {
        toast.error(activeResult.message || "Failed to load assignments");
      }

      if (historyResult.success) {
        setHistoryAssignments(historyResult.data || []);
      }
    } catch (error: any) {
      toast.error("Failed to load assignments");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (
    assignmentId: string,
    title: string,
    isHistory: boolean = false,
  ) => {
    const submissionsCount =
      (isHistory
        ? historyAssignments.find((a) => a._id === assignmentId)?.submissions
            ?.length
        : assignments.find((a) => a._id === assignmentId)?.submissions
            ?.length) || 0;

    const confirmMessage =
      submissionsCount > 0
        ? `⚠️ Warning: This assignment has ${submissionsCount} submission(s).\n\nAre you sure you want to delete "${title}"?\n\nThis action will permanently delete the assignment and all its submissions. This cannot be undone.`
        : `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const result = await deleteAssignmentAction(assignmentId);

      if (!result.success) {
        toast.error(result.message || "Failed to delete assignment");
        return;
      }

      toast.success(
        submissionsCount > 0
          ? `Assignment and ${submissionsCount} submission(s) deleted successfully!`
          : "Assignment deleted successfully!",
      );
      fetchAssignments();
    } catch (error: any) {
      toast.error("Failed to delete assignment");
      console.error(error);
    }
  };

  const getFilteredAssignments = () => {
    const sourceList = viewMode === "active" ? assignments : historyAssignments;

    return sourceList.filter((assignment) => {
      if (filterClass && assignment.classId !== filterClass) return false;
      if (filterSection && assignment.sectionId !== filterSection) return false;
      if (filterSubject && assignment.subject !== filterSubject) return false;
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

  const getDaysOverdue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="aa-page">
        <div className="aa-loading">
          <div className="aa-spinner"></div>
          <p>Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aa-page">
      <header className="aa-header">
        <div className="aa-header-inner">
          <PageHeader />
          <button
            className="aa-btn-create"
            onClick={() => router.push("/admin/dashboard/assignments/create")}
          >
            + Create Assignment
          </button>
        </div>
      </header>

      <main className="aa-content">
        <div className="aa-card">
          <div className="aa-card-header">
            <button
              className="aa-btn-back"
              onClick={() => router.push("/admin/dashboard")}
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
              <span className="aa-back-text">Back</span>
            </button>
            <div>
              <h2 className="aa-card-title">Assignments Management</h2>
              <p className="aa-card-sub">
                Create and manage class assignments (
                {filteredAssignments.length}{" "}
                {viewMode === "active" ? "active" : "archived"})
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="aa-view-toggle">
            <button
              className={`aa-toggle-btn ${viewMode === "active" ? "active" : ""}`}
              onClick={() => setViewMode("active")}
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
              Active ({assignments.length})
            </button>
            <button
              className={`aa-toggle-btn ${viewMode === "history" ? "active" : ""}`}
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
              History ({historyAssignments.length})
            </button>
          </div>

          {/* Filters */}
          <div className="aa-filters">
            <select
              className="aa-filter-select"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>

            <select
              className="aa-filter-select"
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
            >
              <option value="">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
              <option value="E">Section E</option>
            </select>

            <input
              type="text"
              className="aa-filter-input"
              placeholder="Filter by subject..."
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            />

            {(filterClass || filterSection || filterSubject) && (
              <button
                className="aa-btn-clear-filters"
                onClick={() => {
                  setFilterClass("");
                  setFilterSection("");
                  setFilterSubject("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Info Banner for History Mode */}
          {viewMode === "history" && filteredAssignments.length > 0 && (
            <div className="aa-info-banner">
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <div>
                <strong>Viewing archived assignments</strong>
                <p>
                  These assignments have passed their due date. You can still
                  view, edit, or delete them.
                </p>
              </div>
            </div>
          )}

          {/* Assignments Grid */}
          {filteredAssignments.length === 0 ? (
            <div className="aa-empty-state">
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
                {viewMode === "active"
                  ? filterClass || filterSection || filterSubject
                    ? "No assignments match your filters. Try adjusting the filters."
                    : "Get started by creating your first assignment."
                  : filterClass || filterSection || filterSubject
                    ? "No archived assignments match your filters."
                    : "No archived assignments yet."}
              </p>
              {viewMode === "active" &&
                !filterClass &&
                !filterSection &&
                !filterSubject && (
                  <button
                    className="aa-btn-create-empty"
                    onClick={() =>
                      router.push("/admin/dashboard/assignments/create")
                    }
                  >
                    Create First Assignment
                  </button>
                )}
            </div>
          ) : (
            <div className="aa-assignments-grid">
              {filteredAssignments.map((assignment) => {
                const timeStatus = getTimeStatus(assignment.dueDate);
                const submissionCount = assignment.submissions?.length || 0;
                const daysOverdue =
                  viewMode === "history"
                    ? getDaysOverdue(assignment.dueDate)
                    : 0;

                return (
                  <div
                    key={assignment._id}
                    className={`aa-assignment-card ${viewMode === "history" ? "history" : timeStatus.class}`}
                  >
                    <div className="aa-assignment-header">
                      <div className="aa-assignment-title">
                        <h3>{assignment.title}</h3>
                        {viewMode === "active" && (
                          <span className={`aa-time-badge ${timeStatus.class}`}>
                            {timeStatus.text}
                          </span>
                        )}
                        {viewMode === "history" && (
                          <span className="aa-time-badge archived">
                            {daysOverdue === 0
                              ? "Today"
                              : `${daysOverdue}d ago`}
                          </span>
                        )}
                      </div>
                      <p className="aa-assignment-subject">
                        {assignment.subject}
                      </p>
                    </div>

                    <div className="aa-assignment-meta">
                      <div className="aa-meta-item">
                        <span className="aa-meta-label">Class:</span>
                        <span className="aa-meta-value">
                          {assignment.classId} - {assignment.sectionId}
                        </span>
                      </div>
                      <div className="aa-meta-item">
                        <span className="aa-meta-label">Total Marks:</span>
                        <span className="aa-meta-value">
                          {assignment.totalMarks}
                        </span>
                      </div>
                      <div className="aa-meta-item">
                        <span className="aa-meta-label">Due Date:</span>
                        <span className="aa-meta-value">
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="aa-meta-item">
                        <span className="aa-meta-label">Submissions:</span>
                        <span className="aa-meta-value">{submissionCount}</span>
                      </div>
                    </div>

                    <div className="aa-assignment-description">
                      <p>{assignment.description.substring(0, 120)}...</p>
                    </div>

                    <div className="aa-assignment-actions">
                      <button
                        className="aa-btn-view"
                        onClick={() =>
                          router.push(
                            `/admin/dashboard/assignments/view/${assignment._id}`,
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
                        View
                        {submissionCount > 0 && (
                          <span className="aa-submission-badge">
                            {submissionCount}
                          </span>
                        )}
                      </button>
                      {/* ✅ EDIT AND DELETE AVAILABLE FOR BOTH ACTIVE AND HISTORY */}
                      <button
                        className="aa-btn-edit"
                        onClick={() =>
                          router.push(
                            `/admin/dashboard/assignments/edit/${assignment._id}`,
                          )
                        }
                        title={
                          viewMode === "history"
                            ? "Edit archived assignment"
                            : "Edit assignment"
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
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        className="aa-btn-delete"
                        onClick={() =>
                          handleDelete(
                            assignment._id,
                            assignment.title,
                            viewMode === "history",
                          )
                        }
                        title={
                          submissionCount > 0
                            ? `Delete assignment (${submissionCount} submission${submissionCount > 1 ? "s" : ""})`
                            : "Delete assignment"
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
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete
                      </button>
                    </div>

                    <div className="aa-assignment-footer">
                      <span className="aa-assignment-date">
                        Created{" "}
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </span>
                      {viewMode === "history" && submissionCount > 0 && (
                        <span className="aa-assignment-status">
                          📊 {submissionCount} submission
                          {submissionCount > 1 ? "s" : ""}
                        </span>
                      )}
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
