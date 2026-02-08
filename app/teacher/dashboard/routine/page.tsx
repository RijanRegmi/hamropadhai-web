"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTeacherRoutinesAction } from "./../../../../lib/actions/routine-action";
import toast from "react-hot-toast";
import "./teacher-routine.css";
import HamroPadhai from "./../../../../assets/images/HamroPadhai.png";
import Image from "next/image";

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

interface CombinedPeriod extends Period {
  classId: string;
  sectionId: string;
  academicYear: string;
}

interface CombinedDayEntry {
  day: string;
  periods: CombinedPeriod[];
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

export default function TeacherRoutinePage() {
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      setIsLoading(true);

      // Set current day index to today's day FIRST
      const todayIndex = new Date().getDay();
      setCurrentDayIndex(todayIndex);

      const result = await getTeacherRoutinesAction();

      if (!result.success) {
        toast.error(result.message || "Failed to load routines");
        return;
      }

      setRoutines(result.data || []);
    } catch (error: any) {
      toast.error("Failed to load routines");
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

  // Combine all periods from all routines for a given day
  const getCombinedDayEntries = (): CombinedDayEntry[] => {
    const combinedEntries: CombinedDayEntry[] = DAYS.map((day) => ({
      day,
      periods: [],
    }));

    routines.forEach((routine) => {
      routine.entries.forEach((entry) => {
        const dayIndex = DAYS.indexOf(entry.day);
        if (dayIndex !== -1) {
          const periodsWithClassInfo: CombinedPeriod[] = entry.periods.map(
            (period) => ({
              ...period,
              classId: routine.classId,
              sectionId: routine.sectionId,
              academicYear: routine.academicYear,
            }),
          );
          combinedEntries[dayIndex].periods.push(...periodsWithClassInfo);
        }
      });
    });

    // Sort periods by period number and time for each day
    combinedEntries.forEach((entry) => {
      entry.periods.sort((a, b) => {
        if (a.periodNumber !== b.periodNumber) {
          return a.periodNumber - b.periodNumber;
        }
        return a.startTime.localeCompare(b.startTime);
      });
    });

    return combinedEntries;
  };

  const getDayType = (day: string) => {
    const today = getCurrentDay();
    const tomorrow = getTomorrowDay();

    if (day === today) return "today";
    if (day === tomorrow) return "tomorrow";

    const combinedEntries = getCombinedDayEntries();
    const dayEntry = combinedEntries.find((e) => e.day === day);
    if (!dayEntry || dayEntry.periods.length === 0) return "no-class";

    return "regular";
  };

  if (isLoading) {
    return (
      <div className="tr-page">
        <div className="tr-loading">
          <div className="tr-spinner"></div>
          <p>Loading routines...</p>
        </div>
      </div>
    );
  }

  if (routines.length === 0) {
    return (
      <div className="tr-page">
        <header className="tr-header">
          <div className="tr-header-inner">
            <div className="tr-brand">
              <Image
                src={HamroPadhai}
                alt="HamroPadhai Logo"
                className="tr-brand-logo-img"
                width={150}
                height={40}
              />
            </div>
            <button
              className="tr-btn-back"
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
              <span className="tr-back-text">Back</span>
            </button>
          </div>
        </header>
        <main className="tr-content">
          <div className="tr-empty-state">
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
            <h2>No Routines Assigned</h2>
            <p>You are not assigned to any class routines yet.</p>
          </div>
        </main>
      </div>
    );
  }

  const combinedEntries = getCombinedDayEntries();
  const currentDay = DAYS[currentDayIndex];
  const currentDayEntry = combinedEntries[currentDayIndex];
  const currentDayType = getDayType(currentDay);

  // Get total classes count
  const totalClasses = routines.length;
  const activeClasses = routines.filter((r) => r.isActive).length;

  return (
    <div className="tr-page">
      <header className="tr-header">
        <div className="tr-header-inner">
          <div className="tr-brand">
            <Image
              src={HamroPadhai}
              alt="HamroPadhai Logo"
              className="tr-brand-logo-img"
              width={150}
              height={40}
            />
          </div>
        </div>
      </header>

      <main className="tr-content">
        <div className="tr-card">
          <div className="tr-card-header">
            <button
              className="tr-btn-back"
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
              <span className="tr-back-text">Back</span>
            </button>
            <div className="tr-card-header-center">
              <h2 className="tr-card-title">My Class Routines</h2>
              <p className="tr-card-sub">
                View all your assigned class schedules
              </p>
            </div>
            <div className="tr-card-header-spacer"></div>
          </div>

          {/* Summary Info Bar */}
          <div className="tr-summary-bar">
            <div className="tr-summary-item">
              <span className="tr-summary-icon">📚</span>
              <div className="tr-summary-text">
                <span className="tr-summary-value">{totalClasses}</span>
                <span className="tr-summary-label">Total Classes</span>
              </div>
            </div>
            <div className="tr-summary-item">
              <span className="tr-summary-icon">✅</span>
              <div className="tr-summary-text">
                <span className="tr-summary-value">{activeClasses}</span>
                <span className="tr-summary-label">Active</span>
              </div>
            </div>
            <div className="tr-summary-item">
              <span className="tr-summary-icon">📅</span>
              <div className="tr-summary-text">
                <span className="tr-summary-value">{getCurrentDay()}</span>
                <span className="tr-summary-label">Today</span>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={`tr-day-navigation ${currentDayType}`}>
            <button
              className="tr-nav-btn tr-nav-prev"
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

            <div className="tr-day-title-container">
              <h3 className="tr-current-day-title">
                {currentDay}
                {currentDayType === "today" && (
                  <span className="tr-today-indicator">Today</span>
                )}
                {currentDayType === "tomorrow" && (
                  <span className="tr-tomorrow-indicator">Tomorrow</span>
                )}
              </h3>
              <span className="tr-day-counter">{currentDay} Schedule</span>
            </div>

            <button
              className="tr-nav-btn tr-nav-next"
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
          <div className="tr-single-day-view">
            <div className="tr-day-content">
              {!currentDayEntry || currentDayEntry.periods.length === 0 ? (
                <div className={`tr-no-classes-card ${currentDayType}`}>
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
                  <div className="tr-periods-header">
                    <span className="tr-periods-count">
                      {currentDayEntry.periods.length}{" "}
                      {currentDayEntry.periods.length === 1
                        ? "Period"
                        : "Periods"}
                    </span>
                  </div>

                  <div className="tr-periods-list">
                    {currentDayEntry.periods.map((period, idx) => (
                      <div
                        key={idx}
                        className={`tr-period-card ${currentDayType}`}
                      >
                        <div className="tr-period-header">
                          <span className="tr-period-number">
                            Period {period.periodNumber}
                          </span>
                          <span className="tr-period-time">
                            {period.startTime} - {period.endTime}
                          </span>
                        </div>
                        <div className="tr-period-body">
                          <div className="tr-period-subject">
                            {period.subject}
                          </div>
                          <div className="tr-class-badge">
                            Class {period.classId} - Section {period.sectionId}
                          </div>
                          <div className="tr-period-details">
                            {period.roomNumber && (
                              <span className="tr-period-room">
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
          <div className="tr-desktop-view">
            <div className="tr-days-grid">
              {combinedEntries.map((dayEntry) => {
                const dayType = getDayType(dayEntry.day);

                return (
                  <div key={dayEntry.day} className={`tr-day-card ${dayType}`}>
                    <div className="tr-day-header">
                      <h3 className="tr-day-title">
                        {dayEntry.day}
                        {dayType === "today" && (
                          <span className="tr-today-badge">Today</span>
                        )}
                        {dayType === "tomorrow" && (
                          <span className="tr-tomorrow-badge">Tomorrow</span>
                        )}
                      </h3>
                      {dayEntry.periods.length > 0 && (
                        <span className="tr-periods-count-badge">
                          {dayEntry.periods.length}{" "}
                          {dayEntry.periods.length === 1 ? "period" : "periods"}
                        </span>
                      )}
                    </div>

                    {dayEntry.periods.length === 0 ? (
                      <div className="tr-no-classes">
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
                      <div className="tr-periods-list">
                        {dayEntry.periods.map((period, idx) => (
                          <div
                            key={idx}
                            className={`tr-period-card ${dayType}`}
                          >
                            <div className="tr-period-header">
                              <span className="tr-period-number">
                                Period {period.periodNumber}
                              </span>
                              <span className="tr-period-time">
                                {period.startTime} - {period.endTime}
                              </span>
                            </div>
                            <div className="tr-period-body">
                              <div className="tr-period-subject">
                                {period.subject}
                              </div>
                              <div className="tr-class-badge">
                                Class {period.classId} - Section{" "}
                                {period.sectionId}
                              </div>
                              <div className="tr-period-details">
                                {period.roomNumber && (
                                  <span className="tr-period-room">
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
