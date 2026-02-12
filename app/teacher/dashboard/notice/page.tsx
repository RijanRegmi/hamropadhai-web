"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getMyNoticesTeacherAction,
  markNoticeAsReadTeacherAction,
  getUnreadCountTeacherAction,
} from "../../../../lib/actions/notice-action";
import toast from "react-hot-toast";
import "./teacher-notice.css";

interface Notice {
  _id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high";
  targetClasses: Array<{ classId: string; sections: string[] }>;
  publishDate: string;
  isActive: boolean;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number;
  }>;
  createdBy: {
    fullName: string;
    username: string;
    email?: string;
    role?: string;
    profileImage?: string;
  };
  createdAt: string;
  hasRead?: boolean;
  readAt?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export default function TeacherNoticesPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());
  const [filterPriority, setFilterPriority] = useState("");
  const [filterRead, setFilterRead] = useState("");
  const [filterClass, setFilterClass] = useState("");

  const CLASSES = ["11", "12"];

  useEffect(() => {
    fetchNotices();
    fetchUnreadCount();
  }, []);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const result = await getMyNoticesTeacherAction();
      if (result.success) setNotices(result.data || []);
      else toast.error(result.message || "Failed to load notices");
    } catch {
      toast.error("Failed to load notices");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const result = await getUnreadCountTeacherAction();
      if (result.success) setUnreadCount(result.data?.unreadCount || 0);
    } catch {}
  };

  // ✅ FIX: no setState calls nested inside another setState updater
  const doMarkAsRead = useCallback(
    async (noticeId: string) => {
      if (markingIds.has(noticeId)) return;
      setMarkingIds((prev) => new Set(prev).add(noticeId));
      try {
        await markNoticeAsReadTeacherAction(noticeId);
        setNotices((prev) =>
          prev.map((n) => (n._id === noticeId ? { ...n, hasRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // silent
      } finally {
        setMarkingIds((prev) => {
          const next = new Set(prev);
          next.delete(noticeId);
          return next;
        });
      }
    },
    [markingIds],
  );

  const handleMarkAsRead = async (noticeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await doMarkAsRead(noticeId);
    toast.success("Marked as read");
  };

  // ✅ FIX: step 1 set state, step 2 async call — never nested
  const toggleExpand = async (noticeId: string) => {
    const isExpanded = expandedIds.has(noticeId);

    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (isExpanded) next.delete(noticeId);
      else next.add(noticeId);
      return next;
    });

    if (!isExpanded) {
      const notice = notices.find((n) => n._id === noticeId);
      if (notice && !notice.hasRead) {
        await doMarkAsRead(noticeId);
      }
    }
  };

  const downloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = `${API_URL}${fileUrl}`;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started");
  };

  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const getPriorityCfg = (priority: string) => {
    if (priority === "high")
      return { label: "High Priority", cls: "tn-p--high" };
    if (priority === "medium")
      return { label: "Medium Priority", cls: "tn-p--medium" };
    return { label: "Low Priority", cls: "tn-p--low" };
  };

  const getInitials = (name: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "A";

  const getTargetSummary = (
    targetClasses: Array<{ classId: string; sections: string[] }>,
  ) =>
    targetClasses.length === 0
      ? "All classes"
      : targetClasses
          .map((tc) => `Class ${tc.classId} (${tc.sections.join(", ")})`)
          .join(" • ");

  const filtered = notices.filter((n) => {
    if (filterPriority && n.priority !== filterPriority) return false;
    if (filterRead === "read" && !n.hasRead) return false;
    if (filterRead === "unread" && n.hasRead) return false;
    if (
      filterClass &&
      !n.targetClasses.some((tc) => tc.classId === filterClass)
    )
      return false;
    return true;
  });

  const hasFilters = filterPriority || filterRead || filterClass;

  if (isLoading) {
    return (
      <div className="tn-page">
        <div className="tn-loading">
          <div className="tn-spinner" />
          <p>Loading notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tn-page">
      {/* Hero */}
      <div className="tn-hero">
        <div className="tn-hero-inner">
          <button
            className="tn-back-btn"
            onClick={() => router.push("/teacher/dashboard")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <div className="tn-hero-text">
            <h1 className="tn-hero-title">News & Announcements</h1>
            <p className="tn-hero-sub">
              {unreadCount > 0
                ? `${unreadCount} unread notice${unreadCount !== 1 ? "s" : ""} waiting`
                : "You're all caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="tn-unread-pill">{unreadCount} New</span>
          )}
        </div>
      </div>

      <main className="tn-main">
        {/* Filters */}
        <div className="tn-filters">
          <select
            className="tn-filter-select"
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
            className="tn-filter-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <select
            className="tn-filter-select"
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          {hasFilters && (
            <button
              className="tn-filter-clear"
              onClick={() => {
                setFilterPriority("");
                setFilterRead("");
                setFilterClass("");
              }}
            >
              Clear Filters
            </button>
          )}
          <span className="tn-results-count">
            {filtered.length} notice{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="tn-empty">
            <div className="tn-empty-icon">📭</div>
            <h3>No Notices Found</h3>
            <p>
              {hasFilters
                ? "Try adjusting your filters"
                : "No notices for your classes yet"}
            </p>
          </div>
        ) : (
          <div className="tn-grid">
            {filtered.map((notice, idx) => {
              const isExpanded = expandedIds.has(notice._id);
              const isMarking = markingIds.has(notice._id);
              const pCfg = getPriorityCfg(notice.priority);
              const isLong = notice.content.length > 180;
              const preview = isLong
                ? notice.content.slice(0, 180) + "..."
                : notice.content;
              const dt = formatDateTime(notice.publishDate);
              const hasImgErr = imgErrors.has(notice._id);
              const profileSrc =
                notice.createdBy?.profileImage && !hasImgErr
                  ? `${API_URL}${notice.createdBy.profileImage}`
                  : null;

              return (
                <div
                  key={notice._id}
                  className={`tn-card${!notice.hasRead ? " tn-card--unread" : ""}`}
                  style={{ animationDelay: `${idx * 55}ms` }}
                >
                  {/* Priority + NEW */}
                  <div className="tn-card-top">
                    <span className={`tn-priority ${pCfg.cls}`}>
                      {notice.priority === "high" && (
                        <span className="tn-dot" />
                      )}
                      {pCfg.label}
                    </span>
                    {!notice.hasRead && (
                      <span className="tn-new-pill">NEW</span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="tn-card-title">{notice.title}</h3>

                  {/* Author + date/time */}
                  <div className="tn-author-row">
                    {profileSrc ? (
                      <img
                        src={profileSrc}
                        alt={notice.createdBy?.fullName || "Admin"}
                        className="tn-avatar tn-avatar--photo"
                        onError={() =>
                          setImgErrors((prev) => new Set(prev).add(notice._id))
                        }
                      />
                    ) : (
                      <div className="tn-avatar tn-avatar--initials">
                        {getInitials(notice.createdBy?.fullName || "Admin")}
                      </div>
                    )}
                    <div className="tn-author-meta">
                      <span className="tn-author-name">
                        {notice.createdBy?.fullName || "Admin"}
                      </span>
                      <div className="tn-author-time">
                        <span className="tn-time-chip">
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {dt.date}
                        </span>
                        <span className="tn-time-sep">·</span>
                        <span className="tn-time-chip">
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {dt.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Target classes */}
                  <div className="tn-target">
                    <svg
                      width="13"
                      height="13"
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
                    {getTargetSummary(notice.targetClasses)}
                  </div>

                  {/* Content */}
                  <p className="tn-card-content">
                    {isExpanded ? notice.content : preview}
                  </p>

                  {/* Attachments */}
                  {notice.attachments && notice.attachments.length > 0 && (
                    <div className="tn-attachments">
                      <span className="tn-attach-label">
                        Attachment{notice.attachments.length > 1 ? "s" : ""}:
                      </span>
                      {notice.attachments.map((file, i) => (
                        <button
                          key={i}
                          onClick={() =>
                            downloadFile(file.fileUrl, file.fileName)
                          }
                          className="tn-attach-btn"
                        >
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                          </svg>
                          <span className="tn-attach-name">
                            {file.fileName}
                          </span>
                          <span className="tn-attach-open">Open ↗</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="tn-actions">
                    {!notice.hasRead ? (
                      <button
                        onClick={(e) => handleMarkAsRead(notice._id, e)}
                        className="tn-btn-mark"
                        disabled={isMarking}
                      >
                        {isMarking ? (
                          <>
                            <span className="tn-btn-mark-spinner" />
                            Marking...
                          </>
                        ) : (
                          <>
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Mark as read
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="tn-btn-already-read">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Read
                      </span>
                    )}
                    {isLong && (
                      <button
                        onClick={() => toggleExpand(notice._id)}
                        className="tn-btn-expand"
                      >
                        {isExpanded ? "Show less" : "Read More"}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          style={{
                            transform: isExpanded
                              ? "rotate(180deg)"
                              : "rotate(0)",
                            transition: "transform .25s ease",
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
