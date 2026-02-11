"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStudentRoutineAction } from "./../../../../lib/actions/routine-action";
import toast from "react-hot-toast";
import PageHeader from "./../../../_components/PageHeader";
import BackButton from "./../../../_components/BackButton";

import "./student-routine.css";

interface Period {
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId: string | null;
  teacherName: string;
  roomNumber?: string;
}

interface DayEntry {
  day: string;
  periods: Period[];
}

interface Routine {
  _id: string;
  classId: string;
  sectionId: string;
  academicYear: string;
  entries: DayEntry[];
  isActive: boolean;
  createdAt: string;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function StudentRoutinePage() {
  const router = useRouter();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    fetchRoutine();
  }, []);

  const fetchRoutine = async () => {
    try {
      setIsLoading(true);
      const result = await getStudentRoutineAction();

      if (!result.success) {
        toast.error(result.message || "Failed to load routine");
        return;
      }

      setRoutine(result.data || null);

      // Set current day index to today's day
      const todayIndex = new Date().getDay();
      setCurrentDayIndex(todayIndex);
    } catch (error: any) {
      toast.error("Failed to load routine");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentDay = () => {
    return DAYS[new Date().getDay()];
  };

  const getTomorrowDay = () => {
    const tomorrowIndex = (new Date().getDay() + 1) % 7;
    return DAYS[tomorrowIndex];
  };

  const handlePreviousDay = () => {
    setCurrentDayIndex((prev) => (prev === 0 ? 6 : prev - 1));
  };

  const handleNextDay = () => {
    setCurrentDayIndex((prev) => (prev === 6 ? 0 : prev + 1));
  };

  const getDayEntry = (day: string) => {
    if (!routine) return null;
    return routine.entries.find((e) => e.day === day);
  };

  const getDayType = (day: string) => {
    const today = getCurrentDay();
    const tomorrow = getTomorrowDay();

    if (day === today) return "today";
    if (day === tomorrow) return "tomorrow";

    const dayEntry = getDayEntry(day);
    if (!dayEntry || dayEntry.periods.length === 0) return "no-class";

    return "regular";
  };

  if (isLoading) {
    return (
      <div className="sr-page">
        <PageHeader />
        <div className="sr-loading">
          <div className="sr-spinner"></div>
          <p>Loading your routine...</p>
        </div>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="sr-page">
        <PageHeader />
        <main className="sr-content">
          <div className="sr-empty-state">
            <svg
              width="80"
              height="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h2>No Routine Available</h2>
            <p>Your class routine has not been created yet.</p>
            <p className="sr-empty-hint">Please contact your administrator.</p>
            <BackButton backUrl="/dashboard" />
          </div>
        </main>
      </div>
    );
  }

  const currentDay = DAYS[currentDayIndex];
  const currentDayEntry = getDayEntry(currentDay);
  const currentDayType = getDayType(currentDay);

  return (
    <div className="sr-page">
      <PageHeader />

      <main className="sr-content">
        <div className="sr-card">
          <div className="sr-card-header">
            <BackButton backUrl="/dashboard" />
            <div className="sr-card-header-center">
              <h2 className="sr-card-title">My Class Routine</h2>
              <p className="sr-card-sub">View your weekly class schedule</p>
            </div>
            <div className="sr-card-header-spacer"></div>
          </div>

          {/* Routine Info */}
          <div className="sr-info-bar">
            <div className="sr-info-item">
              <span className="sr-info-label">Class:</span>
              <span className="sr-info-value">{routine.classId}</span>
            </div>
            <div className="sr-info-item">
              <span className="sr-info-label">Section:</span>
              <span className="sr-info-value">{routine.sectionId}</span>
            </div>
            <div className="sr-info-item">
              <span className="sr-info-label">Academic Year:</span>
              <span className="sr-info-value">{routine.academicYear}</span>
            </div>
            <div className="sr-info-item">
              <span className="sr-info-label">Status:</span>
              <span
                className={`sr-status-badge ${
                  routine.isActive ? "active" : "inactive"
                }`}
              >
                {routine.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={`sr-day-navigation ${currentDayType}`}>
            <button
              className="sr-nav-btn sr-nav-prev"
              onClick={handlePreviousDay}
              aria-label="Previous day"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="sr-day-title-container">
              <h3 className="sr-current-day-title">
                {currentDay}
                {currentDayType === "today" && (
                  <span className="sr-today-indicator">Today</span>
                )}
                {currentDayType === "tomorrow" && (
                  <span className="sr-tomorrow-indicator">Tomorrow</span>
                )}
              </h3>
              <span className="sr-day-counter">{currentDay} Schedule</span>
            </div>

            <button
              className="sr-nav-btn sr-nav-next"
              onClick={handleNextDay}
              aria-label="Next day"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Mobile Single Day View */}
          <div className="sr-single-day-view">
            <div className="sr-day-content">
              {!currentDayEntry || currentDayEntry.periods.length === 0 ? (
                <div className={`sr-no-classes-card ${currentDayType}`}>
                  <svg
                    width="48"
                    height="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <h3>No Classes Scheduled</h3>
                  <p>There are no classes scheduled for {currentDay}.</p>
                </div>
              ) : (
                <>
                  <div className="sr-periods-header">
                    <span className="sr-periods-count">
                      {currentDayEntry.periods.length}{" "}
                      {currentDayEntry.periods.length === 1
                        ? "Period"
                        : "Periods"}
                    </span>
                  </div>

                  <div className="sr-periods-list">
                    {currentDayEntry.periods.map((period, idx) => (
                      <div
                        key={idx}
                        className={`sr-period-card ${currentDayType}`}
                      >
                        <div className="sr-period-header">
                          <span className="sr-period-number">
                            Period {period.periodNumber}
                          </span>
                          <span className="sr-period-time">
                            {period.startTime} - {period.endTime}
                          </span>
                        </div>
                        <div className="sr-period-body">
                          <div className="sr-period-subject">
                            {period.subject}
                          </div>
                          <div className="sr-period-details">
                            <span className="sr-period-teacher">
                              <svg
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                              {period.teacherName}
                            </span>
                            {period.roomNumber && (
                              <span className="sr-period-room">
                                <svg
                                  width="16"
                                  height="16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                </svg>
                                Room {period.roomNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Desktop View - All Days Grid */}
          <div className="sr-desktop-view">
            <div className="sr-days-grid">
              {DAYS.map((day) => {
                const dayEntry = getDayEntry(day);
                const dayType = getDayType(day);

                return (
                  <div key={day} className={`sr-day-card ${dayType}`}>
                    <div className="sr-day-header">
                      <h3 className="sr-day-title">
                        {day}
                        {dayType === "today" && (
                          <span className="sr-today-badge">Today</span>
                        )}
                        {dayType === "tomorrow" && (
                          <span className="sr-tomorrow-badge">Tomorrow</span>
                        )}
                      </h3>
                      {dayEntry && dayEntry.periods.length > 0 && (
                        <span className="sr-periods-count-badge">
                          {dayEntry.periods.length}{" "}
                          {dayEntry.periods.length === 1 ? "period" : "periods"}
                        </span>
                      )}
                    </div>

                    {!dayEntry || dayEntry.periods.length === 0 ? (
                      <div className="sr-no-classes">
                        <svg
                          width="40"
                          height="40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <p>No classes scheduled</p>
                      </div>
                    ) : (
                      <div className="sr-periods-list">
                        {dayEntry.periods.map((period, idx) => (
                          <div
                            key={idx}
                            className={`sr-period-card ${dayType}`}
                          >
                            <div className="sr-period-header">
                              <span className="sr-period-number">
                                Period {period.periodNumber}
                              </span>
                              <span className="sr-period-time">
                                {period.startTime} - {period.endTime}
                              </span>
                            </div>
                            <div className="sr-period-body">
                              <div className="sr-period-subject">
                                {period.subject}
                              </div>
                              <div className="sr-period-details">
                                <span className="sr-period-teacher">
                                  <svg
                                    width="16"
                                    height="16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                  </svg>
                                  {period.teacherName}
                                </span>
                                {period.roomNumber && (
                                  <span className="sr-period-room">
                                    <svg
                                      width="16"
                                      height="16"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    </svg>
                                    Room {period.roomNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
