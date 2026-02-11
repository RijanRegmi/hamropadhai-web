"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getMyAssignmentsTeacherAction,
  getAssignmentHistoryTeacherAction,
} from "../../../../lib/actions/assignment-action";
import toast from "react-hot-toast";
import "../../../admin/dashboard/assignments/assignments.css";
import "./assignment.css";
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

export default function TeacherAssignmentsPage() {
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
        getMyAssignmentsTeacherAction(),
        getAssignmentHistoryTeacherAction(),
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

  const getGradingStats = (assignment: Assignment) => {
    const total = assignment.submissions?.length || 0;
    const graded =
      assignment.submissions?.filter(
        (s) => s.marks !== null && s.marks !== undefined,
      ).length || 0;
    const pending = total - graded;

    return { total, graded, pending };
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
      <PageHeader />

      <main className="aa-content">
        <div className="aa-card">
          <div className="aa-card-header">
            <button
              className="aa-btn-back"
              onClick={() => router.push("/teacher/dashboard")}
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
              <h2 className="aa-card-title">My Assignments</h2>
              <p className="aa-card-sub">
                View and grade your assigned class assignments (
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
                    : "You don't have any active assignments yet."
                  : "No archived assignments yet."}
              </p>
            </div>
          ) : (
            <div className="aa-assignments-grid">
              {filteredAssignments.map((assignment) => {
                const timeStatus = getTimeStatus(assignment.dueDate);
                const stats = getGradingStats(assignment);

                return (
                  <div
                    key={assignment._id}
                    className={`aa-assignment-card ${timeStatus.class}`}
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
                          <span className="aa-time-badge overdue">
                            Archived
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
                        <span className="aa-meta-value">{stats.total}</span>
                      </div>
                    </div>

                    {/* Grading Stats */}
                    <div className="aa-grading-stats">
                      <div className="aa-stat-bar">
                        <span className="aa-stat-label">
                          Graded: {stats.graded}/{stats.total}
                        </span>
                        <div className="aa-progress-bar">
                          <div
                            className="aa-progress-fill"
                            style={{
                              width:
                                stats.total > 0
                                  ? `${(stats.graded / stats.total) * 100}%`
                                  : "0%",
                            }}
                          ></div>
                        </div>
                      </div>
                      {stats.pending > 0 && (
                        <span className="aa-pending-badge">
                          {stats.pending} pending
                        </span>
                      )}
                    </div>

                    <div className="aa-assignment-description">
                      <p>{assignment.description.substring(0, 120)}...</p>
                    </div>

                    <div className="aa-assignment-actions">
                      <button
                        className="aa-btn-view"
                        onClick={() =>
                          router.push(
                            `/teacher/dashboard/assignments/viewandgrade/${assignment._id}`,
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
                        View & Grade
                      </button>
                    </div>

                    <div className="aa-assignment-footer">
                      <span className="aa-assignment-date">
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

      <style jsx>{`
        .aa-grading-stats {
          margin-bottom: 16px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .aa-stat-bar {
          margin-bottom: 8px;
        }

        .aa-stat-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          display: block;
          margin-bottom: 6px;
        }

        .aa-progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .aa-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          transition: width 0.3s ease;
        }

        .aa-pending-badge {
          display: inline-block;
          padding: 4px 10px;
          background: #fef3c7;
          color: #92400e;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}
