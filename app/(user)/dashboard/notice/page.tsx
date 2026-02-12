"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getMyNoticesStudentAction,
  markNoticeAsReadStudentAction,
  getUnreadCountStudentAction,
} from "../../../../lib/actions/notice-action";
import toast from "react-hot-toast";
import "./student-notice.css";

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

export default function StudentNoticesPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNotices();
    fetchUnreadCount();
  }, []);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const result = await getMyNoticesStudentAction();
      if (result.success) {
        setNotices(result.data || []);
      } else {
        toast.error(result.message || "Failed to load notices");
      }
    } catch {
      toast.error("Failed to load notices");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const result = await getUnreadCountStudentAction();
      if (result.success) setUnreadCount(result.data?.unreadCount || 0);
    } catch {}
  };

  // ✅ FIX: proper async handler, no setState inside setState updater
  const doMarkAsRead = useCallback(
    async (noticeId: string) => {
      // Prevent double-clicking
      if (markingIds.has(noticeId)) return;

      setMarkingIds((prev) => new Set(prev).add(noticeId));
      try {
        await markNoticeAsReadStudentAction(noticeId);
        setNotices((prev) =>
          prev.map((n) => (n._id === noticeId ? { ...n, hasRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // silently fail — not critical
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

  // ✅ FIX: toggleExpand is now fully async — no state calls nested inside setState updater
  const toggleExpand = async (noticeId: string) => {
    const isExpanded = expandedIds.has(noticeId);

    // Step 1 — toggle the expanded set
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (isExpanded) {
        next.delete(noticeId);
      } else {
        next.add(noticeId);
      }
      return next;
    });

    // Step 2 — if opening, mark as read (completely separate from the setState above)
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
      return { label: "High Priority", cls: "sn-p--high" };
    if (priority === "medium")
      return { label: "Medium Priority", cls: "sn-p--medium" };
    return { label: "Low Priority", cls: "sn-p--low" };
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

  if (isLoading) {
    return (
      <div className="sn-page">
        <div className="sn-loading">
          <div className="sn-spinner" />
          <p>Loading notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sn-page">
      {/* ── Hero ── */}
      <div className="sn-hero">
        <div className="sn-hero-inner">
          <button
            className="sn-back-btn"
            onClick={() => router.push("/dashboard")}
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
          <div className="sn-hero-text">
            <h1 className="sn-hero-title">News & Announcements</h1>
            <p className="sn-hero-sub">
              {unreadCount > 0
                ? `${unreadCount} unread notice${unreadCount !== 1 ? "s" : ""} waiting`
                : "You're all caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="sn-unread-pill">{unreadCount} New</span>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      <main className="sn-main">
        {notices.length === 0 ? (
          <div className="sn-empty">
            <div className="sn-empty-icon">📭</div>
            <h3>No Notices Yet</h3>
            <p>Check back later for updates from your school</p>
          </div>
        ) : (
          <div className="sn-grid">
            {notices.map((notice, idx) => {
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
                  className={`sn-card${!notice.hasRead ? " sn-card--unread" : ""}`}
                  style={{ animationDelay: `${idx * 55}ms` }}
                >
                  {/* Priority + NEW */}
                  <div className="sn-card-top">
                    <span className={`sn-priority ${pCfg.cls}`}>
                      {notice.priority === "high" && (
                        <span className="sn-dot" />
                      )}
                      {pCfg.label}
                    </span>
                    {!notice.hasRead && (
                      <span className="sn-new-pill">NEW</span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="sn-card-title">{notice.title}</h3>

                  {/* Author + date/time */}
                  <div className="sn-author-row">
                    {profileSrc ? (
                      <img
                        src={profileSrc}
                        alt={notice.createdBy?.fullName || "Admin"}
                        className="sn-avatar sn-avatar--photo"
                        onError={() =>
                          setImgErrors((prev) => new Set(prev).add(notice._id))
                        }
                      />
                    ) : (
                      <div className="sn-avatar sn-avatar--initials">
                        {getInitials(notice.createdBy?.fullName || "Admin")}
                      </div>
                    )}
                    <div className="sn-author-meta">
                      <span className="sn-author-name">
                        {notice.createdBy?.fullName || "Admin"}
                      </span>
                      <div className="sn-author-time">
                        <span className="sn-time-chip">
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
                        <span className="sn-time-sep">·</span>
                        <span className="sn-time-chip">
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

                  {/* Content */}
                  <p className="sn-card-content">
                    {isExpanded ? notice.content : preview}
                  </p>

                  {/* Attachments */}
                  {notice.attachments && notice.attachments.length > 0 && (
                    <div className="sn-attachments">
                      <span className="sn-attach-label">
                        Attachment{notice.attachments.length > 1 ? "s" : ""}:
                      </span>
                      {notice.attachments.map((file, i) => (
                        <button
                          key={i}
                          onClick={() =>
                            downloadFile(file.fileUrl, file.fileName)
                          }
                          className="sn-attach-btn"
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
                          <span className="sn-attach-name">
                            {file.fileName}
                          </span>
                          <span className="sn-attach-open">Open ↗</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* ── Actions ── */}
                  <div className="sn-actions">
                    {/* Mark as read — text link style like the design */}
                    {!notice.hasRead ? (
                      <button
                        onClick={(e) => handleMarkAsRead(notice._id, e)}
                        className="sn-btn-mark"
                        disabled={isMarking}
                      >
                        {isMarking ? (
                          <>
                            <span className="sn-btn-mark-spinner" />
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
                      <span className="sn-btn-already-read">
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

                    {/* Read More */}
                    {isLong && (
                      <button
                        onClick={() => toggleExpand(notice._id)}
                        className="sn-btn-expand"
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
