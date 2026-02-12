"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAllNoticesAdminAction,
  deleteNoticeAction,
} from "../../../../lib/actions/notice-action";
import toast from "react-hot-toast";
import "./notice.css";
import PageHeader from "./../../../_components/PageHeader";

interface Notice {
  _id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high";
  targetClasses: Array<{
    classId: string;
    sections: string[];
  }>;
  isPinned: boolean;
  publishDate: string;
  expiryDate?: string;
  isActive: boolean;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number;
  }>;
  readBy: string[];
  createdAt: string;
}

const CLASSES = ["11", "12"];
const SECTIONS = ["A", "B", "C", "D", "E"];

export default function AdminNoticesPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterClass, setFilterClass] = useState<string>("");
  const [filterSection, setFilterSection] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const result = await getAllNoticesAdminAction();

      if (result.success) {
        setNotices(result.data || []);
      } else {
        toast.error(result.message || "Failed to load notices");
      }
    } catch (error: any) {
      toast.error("Failed to load notices");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (noticeId: string, title: string) => {
    const confirmMessage = `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const result = await deleteNoticeAction(noticeId);

      if (!result.success) {
        toast.error(result.message || "Failed to delete notice");
        return;
      }

      toast.success("Notice deleted successfully!");
      fetchNotices();
    } catch (error: any) {
      toast.error("Failed to delete notice");
      console.error(error);
    }
  };

  const getFilteredNotices = () => {
    return notices.filter((notice) => {
      if (filterClass) {
        const hasClass = notice.targetClasses.some(
          (tc) => tc.classId === filterClass,
        );
        if (!hasClass) return false;
      }

      if (filterSection) {
        const hasSection = notice.targetClasses.some((tc) =>
          tc.sections.includes(filterSection),
        );
        if (!hasSection) return false;
      }

      if (filterPriority && notice.priority !== filterPriority) return false;

      return true;
    });
  };

  const filteredNotices = getFilteredNotices();

  const getTargetSummary = (
    targetClasses: Array<{ classId: string; sections: string[] }>,
  ) => {
    if (targetClasses.length === 0) return "No recipients";

    const summary = targetClasses
      .map((tc) => `Class ${tc.classId} (${tc.sections.join(", ")})`)
      .join(" • ");

    return summary.length > 50 ? summary.substring(0, 50) + "..." : summary;
  };

  if (isLoading) {
    return (
      <div className="notice-page">
        <div className="notice-loading">
          <div className="notice-spinner"></div>
          <p>Loading notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notice-page">
      <header className="notice-header">
        <div className="notice-header-inner">
          <PageHeader />
          <button
            className="notice-btn-create"
            onClick={() => router.push("/admin/dashboard/notice/create")}
          >
            + Create Notice
          </button>
        </div>
      </header>

      <main className="notice-content">
        <div className="notice-card">
          <div className="notice-card-header">
            <button
              className="notice-btn-back"
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
              <span className="notice-back-text">Back</span>
            </button>
            <div>
              <h2 className="notice-card-title">Notices Management</h2>
              <p className="notice-card-sub">
                Create and manage notices ({filteredNotices.length} total)
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="notice-filters">
            <select
              className="notice-filter-select"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>

            <select
              className="notice-filter-select"
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
            >
              <option value="">All Sections</option>
              {SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>

            <select
              className="notice-filter-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {(filterClass || filterSection || filterPriority) && (
              <button
                className="notice-btn-clear-filters"
                onClick={() => {
                  setFilterClass("");
                  setFilterSection("");
                  setFilterPriority("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Notices Grid */}
          {filteredNotices.length === 0 ? (
            <div className="notice-empty-state">
              <svg
                width="80"
                height="80"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3>No Notices Found</h3>
              <p>
                {filterClass || filterSection || filterPriority
                  ? "No notices match your filters. Try adjusting the filters."
                  : "Get started by creating your first notice."}
              </p>
              {!filterClass && !filterSection && !filterPriority && (
                <button
                  className="notice-btn-create-empty"
                  onClick={() => router.push("/admin/dashboard/notice/create")}
                >
                  Create First Notice
                </button>
              )}
            </div>
          ) : (
            <div className="notice-grid">
              {filteredNotices.map((notice) => {
                const isExpired =
                  notice.expiryDate && new Date(notice.expiryDate) < new Date();
                const readCount = notice.readBy?.length || 0;

                return (
                  <div
                    key={notice._id}
                    className={`notice-item ${notice.isPinned ? "pinned" : ""}`}
                  >
                    <div className="notice-item-header">
                      <h3 className="notice-item-title">{notice.title}</h3>
                      <div className="notice-badges">
                        {notice.isPinned && (
                          <span className="notice-badge pinned">📌 Pinned</span>
                        )}
                        <span className={`notice-badge ${notice.priority}`}>
                          {notice.priority}
                        </span>
                        {isExpired && (
                          <span
                            className="notice-badge"
                            style={{ background: "#fee2e2", color: "#991b1b" }}
                          >
                            Expired
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="notice-item-content">
                      <p className="notice-item-text">{notice.content}</p>
                    </div>

                    <div className="notice-item-meta">
                      <div className="notice-meta-item">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>{getTargetSummary(notice.targetClasses)}</span>
                      </div>

                      <div className="notice-meta-item">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {new Date(notice.publishDate).toLocaleDateString()}
                        </span>
                      </div>

                      {notice.attachments && notice.attachments.length > 0 && (
                        <div className="notice-attachment-badge">
                          <svg
                            width="14"
                            height="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          {notice.attachments.length} file
                          {notice.attachments.length > 1 ? "s" : ""}
                        </div>
                      )}

                      <div className="notice-stats-badge">
                        <svg
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {readCount} read
                      </div>
                    </div>

                    <div className="notice-item-actions">
                      <button
                        className="notice-btn notice-btn-edit"
                        onClick={() =>
                          router.push(
                            `/admin/dashboard/notice/edit/${notice._id}`,
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
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        className="notice-btn notice-btn-delete"
                        onClick={() => handleDelete(notice._id, notice.title)}
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
