"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMyAssignmentsStudentAction } from "../../../../lib/actions/assignment-action";
import Navbar from "./../../_components/Navbar";
import BackButton from "../../../_components/BackButton";
import "./calendar.css";

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  dueDate: string;
  classId: string;
  sectionId: string;
  totalMarks: number;
  submissions?: any[];
}

interface DayEvents {
  [dateKey: string]: Assignment[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "#6366f1",
  Physics: "#8b5cf6",
  Chemistry: "#a855f7",
  Biology: "#10b981",
  English: "#f59e0b",
  Nepali: "#ef4444",
  "Computer Science": "#3b82f6",
  Accountancy: "#f97316",
  Economics: "#14b8a6",
  "Business Studies": "#ec4899",
};

function getSubjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] || "#6366f1";
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export default function StudentCalendarPage() {
  const router = useRouter();
  const today = new Date();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [dayEvents, setDayEvents] = useState<DayEvents>({});
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await getMyAssignmentsStudentAction();
      if (result.success && result.data) {
        setAssignments(result.data);
        buildDayEvents(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const buildDayEvents = (list: Assignment[]) => {
    const map: DayEvents = {};
    list.forEach((a) => {
      const key = toDateKey(new Date(a.dueDate));
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    setDayEvents(map);
  };

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
    setSelectedDay(null);
  };
  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(today);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(new Date(currentYear, currentMonth, day));
  };

  const selectedKey = selectedDay ? toDateKey(selectedDay) : null;
  const selectedEvents = selectedKey ? dayEvents[selectedKey] || [] : [];

  const monthEventsCount = Object.entries(dayEvents)
    .filter(([key]) => {
      const [y, m] = key.split("-").map(Number);
      return y === currentYear && m === currentMonth;
    })
    .reduce((sum, [, evts]) => sum + evts.length, 0);

  const upcoming = assignments
    .filter((a) => {
      const diff = new Date(a.dueDate).getTime() - Date.now();
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    })
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();
  const isSelected = (day: number) =>
    selectedDay?.getDate() === day &&
    selectedDay?.getMonth() === currentMonth &&
    selectedDay?.getFullYear() === currentYear;

  return (
    <div className="cal-page">
      <Navbar />

      <main className="cal-content">
        <div className="cal-back-row">
          <BackButton backUrl="/dashboard" />
        </div>

        {/* ── Stats ── */}
        <div className="cal-stats-row">
          <div className="cal-stat-card">
            <div className="cal-stat-icon cal-stat-icon--blue">
              <svg
                width="20"
                height="20"
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
            </div>
            <div>
              <p className="cal-stat-label">This Month</p>
              <p className="cal-stat-value">{monthEventsCount} due</p>
            </div>
          </div>
          <div className="cal-stat-card">
            <div className="cal-stat-icon cal-stat-icon--amber">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <p className="cal-stat-label">Next 7 Days</p>
              <p className="cal-stat-value">{upcoming.length} due</p>
            </div>
          </div>
          <div className="cal-stat-card">
            <div className="cal-stat-icon cal-stat-icon--purple">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <div>
              <p className="cal-stat-label">Total Active</p>
              <p className="cal-stat-value">{assignments.length} tasks</p>
            </div>
          </div>
        </div>

        <div className="cal-main-grid">
          {/* ── Calendar ── */}
          <div className="cal-card">
            <div className="cal-header">
              <button className="cal-nav-btn" onClick={prevMonth}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="cal-month-label">
                <h2>{MONTHS[currentMonth]}</h2>
                <span>{currentYear}</span>
              </div>
              <button className="cal-nav-btn" onClick={nextMonth}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            <button className="cal-today-btn" onClick={goToToday}>
              Today
            </button>

            <div className="cal-day-names">
              {DAYS.map((d) => (
                <span key={d} className="cal-day-name">
                  {d}
                </span>
              ))}
            </div>

            {isLoading ? (
              <div className="cal-grid-loading">
                <div className="cal-spinner" />
                <p>Loading calendar...</p>
              </div>
            ) : (
              <div className="cal-grid">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="cal-cell cal-cell--empty"
                  />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const key = toDateKey(
                    new Date(currentYear, currentMonth, day),
                  );
                  const events = dayEvents[key] || [];
                  const hasEvent = events.length > 0;

                  return (
                    <div
                      key={day}
                      className={`cal-cell
                        ${isToday(day) ? "cal-cell--today" : ""}
                        ${isSelected(day) ? "cal-cell--selected" : ""}
                        ${hasEvent ? "cal-cell--has-event" : ""}
`}
                      onClick={() => handleDayClick(day)}
                    >
                      <span className="cal-cell-number">{day}</span>

                      {hasEvent && (
                        <div className="cal-dots">
                          {events.slice(0, 3).map((evt, idx) => (
                            <span
                              key={idx}
                              className="cal-dot"
                              style={{
                                background: getSubjectColor(evt.subject),
                              }}
                            />
                          ))}
                          {events.length > 3 && (
                            <span className="cal-dot-more">
                              +{events.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      {hasEvent && (
                        <div
                          className="cal-event-pill"
                          style={{
                            borderColor: getSubjectColor(events[0].subject),
                          }}
                        >
                          <span
                            className="cal-event-pill-dot"
                            style={{
                              background: getSubjectColor(events[0].subject),
                            }}
                          />
                          <span className="cal-event-pill-text">
                            {events[0].title}
                          </span>
                          {events.length > 1 && (
                            <span className="cal-event-pill-more">
                              +{events.length - 1}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="cal-legend">
              <span className="cal-legend-item">
                <span
                  className="cal-legend-dot"
                  style={{ background: "#6366f1" }}
                />
                Assignment due
              </span>
            </div>
          </div>

          {/* ── Side panel ── */}
          <div className="cal-side">
            {/* Selected day */}
            <div className="cal-side-card">
              <h3 className="cal-side-title">
                {selectedDay
                  ? `${MONTHS[selectedDay.getMonth()]} ${selectedDay.getDate()}, ${selectedDay.getFullYear()}`
                  : "Select a day"}
              </h3>

              {!selectedDay ? (
                <div className="cal-side-empty">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <p>Click a date to see events</p>
                </div>
              ) : selectedEvents.length === 0 ? (
                <div className="cal-side-empty">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  <p>No assignments due</p>
                  <small>Free day! 🎉</small>
                </div>
              ) : (
                <div className="cal-events-list">
                  {selectedEvents.map((a) => {
                    const color = getSubjectColor(a.subject);
                    const dueDate = new Date(a.dueDate);
                    const hasSubmitted =
                      a.submissions && a.submissions.length > 0;
                    return (
                      <div
                        key={a._id}
                        className="cal-event-card"
                        style={{ borderLeftColor: color }}
                        onClick={() =>
                          router.push(`/dashboard/assignments/${a._id}`)
                        }
                      >
                        <div className="cal-event-header">
                          <span
                            className="cal-event-subject"
                            style={{ color, background: color + "18" }}
                          >
                            {a.subject}
                          </span>
                          {hasSubmitted && (
                            <span className="cal-event-submitted">
                              ✓ Submitted
                            </span>
                          )}
                        </div>
                        <h4 className="cal-event-title">{a.title}</h4>
                        <div className="cal-event-meta">
                          <span>
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Due{" "}
                            {dueDate.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span>
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            {a.totalMarks} marks
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Due this week */}
            <div className="cal-side-card">
              <h3 className="cal-side-title">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Due This Week
              </h3>
              {upcoming.length === 0 ? (
                <div className="cal-side-empty">
                  <p>Nothing due this week 🎉</p>
                </div>
              ) : (
                <div className="cal-upcoming-list">
                  {upcoming.map((a) => {
                    const color = getSubjectColor(a.subject);
                    const diffMs = new Date(a.dueDate).getTime() - Date.now();
                    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffD = Math.floor(diffH / 24);
                    const urgency =
                      diffD === 0
                        ? "today"
                        : diffD === 1
                          ? "tomorrow"
                          : "upcoming";
                    return (
                      <div
                        key={a._id}
                        className={`cal-upcoming-item cal-upcoming-item--${urgency}`}
                        onClick={() =>
                          router.push(`/dashboard/assignments/${a._id}`)
                        }
                      >
                        <div
                          className="cal-upcoming-bar"
                          style={{ background: color }}
                        />
                        <div className="cal-upcoming-info">
                          <p className="cal-upcoming-title">{a.title}</p>
                          <p className="cal-upcoming-subject">{a.subject}</p>
                        </div>
                        <div
                          className={`cal-upcoming-badge cal-upcoming-badge--${urgency}`}
                        >
                          {diffD === 0
                            ? diffH <= 0
                              ? "Now"
                              : `${diffH}h`
                            : diffD === 1
                              ? "Tomorrow"
                              : `${diffD}d`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
