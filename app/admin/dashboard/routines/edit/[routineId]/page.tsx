"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getRoutineByIdAction,
  updateRoutineAction,
} from "../../../../../../lib/actions/routine-action";
import { getFilteredTeachersAction } from "../../../../../../lib/actions/admin-action";
import toast from "react-hot-toast";
import "./routine-edit.css";
import PageHeader from "./../../../../../_components/PageHeader";

interface Teacher {
  _id: string;
  fullName: string;
  email: string;
  classId: string | null;
  sectionId: string | null;
}

interface Period {
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId: string | null;
  teacherName: string;
  roomNumber: string;
  isConfirmed: boolean;
}

interface DayEntry {
  day: string;
  periods: Period[];
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
const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Nepali",
  "Computer Science",
  "Accountancy",
  "Economics",
  "Business Studies",
];
const ROOMS = [
  "101",
  "102",
  "103",
  "104",
  "105",
  "201",
  "202",
  "203",
  "204",
  "205",
];

export default function EditRoutinePage() {
  const router = useRouter();
  const params = useParams();
  const routineId = (params?.id ||
    params?.routineId ||
    params?.["[id]"]) as string;

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);

  // ── These are READ-ONLY after load — disabled in the form ─────────────────
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    if (routineId && routineId !== "undefined" && routineId !== "null") {
      fetchRoutine();
    } else {
      toast.error("Invalid routine ID");
      router.push("/admin/dashboard/routines");
    }
  }, [routineId]);

  // Fetch teachers once classId + sectionId are loaded from the routine
  useEffect(() => {
    if (classId && sectionId) fetchFilteredTeachers();
  }, [classId, sectionId]);

  const fetchRoutine = async () => {
    try {
      setIsLoading(true);
      const result = await getRoutineByIdAction(routineId);
      if (!result.success || !result.data) {
        toast.error(result.message || "Failed to load routine");
        router.push("/admin/dashboard/routines");
        return;
      }

      const routine = result.data;
      setClassId(routine.classId || "");
      setSectionId(routine.sectionId || "");
      setAcademicYear(routine.academicYear || "2024-2025");

      // All existing periods start as confirmed
      const entriesWithConfirmed = (routine.entries || []).map(
        (entry: any) => ({
          day: entry.day,
          periods: (entry.periods || []).map((period: any) => ({
            periodNumber: period.periodNumber || 0,
            startTime: period.startTime || "",
            endTime: period.endTime || "",
            subject: period.subject || "",
            teacherId: period.teacherId || null,
            teacherName: period.teacherName || "",
            roomNumber: period.roomNumber || "",
            isConfirmed: true,
          })),
        }),
      );
      setEntries(entriesWithConfirmed);
    } catch (error: any) {
      toast.error("Failed to load routine");
      router.push("/admin/dashboard/routines");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredTeachers = async () => {
    try {
      const result = await getFilteredTeachersAction(classId, sectionId);
      if (result.success) setFilteredTeachers(result.data);
    } catch {}
  };

  // ── Day management ─────────────────────────────────────────────────────────
  const addDay = () => {
    if (!selectedDay) {
      toast.error("Please select a day");
      return;
    }
    if (entries.some((e) => e.day === selectedDay)) {
      toast.error("Day already added");
      return;
    }
    setEntries([...entries, { day: selectedDay, periods: [] }]);
    setSelectedDay(null);
  };

  const removeDay = (day: string) =>
    setEntries(entries.filter((e) => e.day !== day));

  // ── Period management ──────────────────────────────────────────────────────
  const addPeriod = (day: string) => {
    setEntries(
      entries.map((entry) => {
        if (entry.day !== day) return entry;
        return {
          ...entry,
          periods: [
            ...entry.periods,
            {
              periodNumber: entry.periods.length + 1,
              startTime: "",
              endTime: "",
              subject: "",
              teacherId: null,
              teacherName: "",
              roomNumber: "",
              isConfirmed: false,
            },
          ],
        };
      }),
    );
  };

  const removePeriod = (day: string, idx: number) => {
    setEntries(
      entries.map((entry) => {
        if (entry.day !== day) return entry;
        const newPeriods = entry.periods.filter((_, i) => i !== idx);
        return {
          ...entry,
          periods: newPeriods.map((p, i) => ({ ...p, periodNumber: i + 1 })),
        };
      }),
    );
  };

  const updatePeriod = (
    day: string,
    idx: number,
    field: keyof Period,
    value: any,
  ) => {
    setEntries(
      entries.map((entry) => {
        if (entry.day !== day) return entry;
        return {
          ...entry,
          periods: entry.periods.map((period, i) => {
            if (i !== idx) return period;
            if (field === "teacherId") {
              const teacher = filteredTeachers.find((t) => t._id === value);
              return {
                ...period,
                teacherId: value || null,
                teacherName: teacher?.fullName || "",
              };
            }
            return { ...period, [field]: value };
          }),
        };
      }),
    );
  };

  const confirmPeriod = (day: string, idx: number) => {
    const period = entries.find((e) => e.day === day)?.periods[idx];
    if (!period) return;
    if (
      !period.startTime ||
      !period.endTime ||
      !period.subject ||
      !period.teacherId
    ) {
      toast.error("Please fill all required fields before confirming");
      return;
    }
    setEntries(
      entries.map((entry) => {
        if (entry.day !== day) return entry;
        return {
          ...entry,
          periods: entry.periods.map((p, i) =>
            i === idx ? { ...p, isConfirmed: true } : p,
          ),
        };
      }),
    );
    toast.success(`Period ${period.periodNumber} confirmed!`);
  };

  const editPeriod = (day: string, idx: number) => {
    setEntries(
      entries.map((entry) => {
        if (entry.day !== day) return entry;
        return {
          ...entry,
          periods: entry.periods.map((p, i) =>
            i === idx ? { ...p, isConfirmed: false } : p,
          ),
        };
      }),
    );
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      if (entries.length === 0) {
        toast.error("Please add at least one day");
        return;
      }

      for (const entry of entries) {
        if (entry.periods.length === 0) {
          toast.error(`Please add periods for ${entry.day}`);
          return;
        }
        for (const period of entry.periods) {
          if (!period.isConfirmed) {
            toast.error(
              `Confirm all periods first. ${entry.day} Period ${period.periodNumber} is not confirmed.`,
            );
            return;
          }
        }
      }

      const cleanedEntries = entries.map((entry) => ({
        day: entry.day,
        periods: entry.periods.map((period) => ({
          periodNumber: period.periodNumber,
          startTime: period.startTime,
          endTime: period.endTime,
          subject: period.subject,
          teacherId: period.teacherId,
          teacherName: period.teacherName,
          roomNumber: period.roomNumber || "",
        })),
      }));

      const result = await updateRoutineAction(routineId, {
        classId,
        sectionId,
        academicYear,
        entries: cleanedEntries,
      });
      if (!result.success) {
        toast.error(result.message || "Failed to update routine");
        return;
      }

      toast.success("Routine updated successfully!");
      setTimeout(() => router.push("/admin/dashboard/routines"), 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to update routine");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rf-page">
        <div className="rf-loading">
          <div className="rf-spinner" />
          <p>Loading routine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rf-page">
      <header className="rf-header">
        <div className="rf-header-inner">
          <PageHeader />
          <div className="rf-header-actions">
            <button
              className="rf-btn-save"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? "Updating..." : "Update Routine"}
            </button>
          </div>
        </div>
      </header>

      <main className="rf-content">
        <div className="rf-card">
          <button
            className="back-btn"
            onClick={() => router.push("/admin/dashboard/routines/")}
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

          <h2 className="rf-card-title">Edit Class Routine</h2>
          <p className="rf-card-sub">Update the routine details</p>

          {/* ── Class/Section/Year — READ ONLY ── */}
          <div className="rf-form-grid">
            <div className="rf-field">
              <label className="rf-label">Class</label>
              <input
                className="rf-input rf-input-disabled"
                value={`Class ${classId}`}
                disabled
                readOnly
              />
            </div>
            <div className="rf-field">
              <label className="rf-label">Section</label>
              <input
                className="rf-input rf-input-disabled"
                value={`Section ${sectionId}`}
                disabled
                readOnly
              />
            </div>
            <div className="rf-field">
              <label className="rf-label">Academic Year</label>
              <input
                className="rf-input rf-input-disabled"
                value={academicYear}
                disabled
                readOnly
              />
            </div>
          </div>

          {/* ── Read-only info notice ── */}
          <div className="rf-readonly-notice">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01"
              />
            </svg>
            Class, Section and Academic Year cannot be changed when editing.
            Create a new routine to change these.
          </div>

          {/* ── Teacher info ── */}
          <div className="rf-teacher-info">
            <p>
              {filteredTeachers.length} teacher(s) available for Class {classId}{" "}
              - Section {sectionId}
              {filteredTeachers.length > 0 && (
                <span style={{ marginLeft: "10px", fontSize: "12px" }}>
                  ({filteredTeachers.map((t) => t.fullName).join(", ")})
                </span>
              )}
            </p>
          </div>

          {/* ── Add Day ── */}
          <div className="rf-add-day-section">
            <h3 className="rf-section-title">Days & Periods</h3>
            <div className="rf-add-day-box">
              <select
                className="rf-input rf-select"
                value={selectedDay || ""}
                onChange={(e) => setSelectedDay(e.target.value)}
              >
                <option value="">Select a day to add</option>
                {DAYS.filter((day) => !entries.some((e) => e.day === day)).map(
                  (day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ),
                )}
              </select>
              <button className="rf-btn-add-day" onClick={addDay}>
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Day
              </button>
            </div>
          </div>

          {/* ── Days List ── */}
          <div className="rf-days-list">
            {entries.map((entry) => (
              <div key={entry.day} className="rf-day-card">
                <div className="rf-day-header">
                  <h4 className="rf-day-title">{entry.day}</h4>
                  <div className="rf-day-actions">
                    <button
                      className="rf-btn-add-period"
                      onClick={() => addPeriod(entry.day)}
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Add Period
                    </button>
                    <button
                      className="rf-btn-remove-day"
                      onClick={() => removeDay(entry.day)}
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
                    </button>
                  </div>
                </div>

                {entry.periods.length === 0 ? (
                  <div className="rf-no-periods">
                    No periods added. Click "Add Period" to start.
                  </div>
                ) : (
                  <div className="rf-periods-list">
                    {entry.periods.map((period, idx) => (
                      <div
                        key={idx}
                        className={`rf-period-item ${period.isConfirmed ? "confirmed" : ""}`}
                      >
                        <div className="rf-period-header-row">
                          <div className="rf-period-number">
                            Period {period.periodNumber}
                            {period.isConfirmed && (
                              <span className="rf-confirmed-check">
                                ✓ Confirmed
                              </span>
                            )}
                          </div>
                          {period.isConfirmed ? (
                            <button
                              className="rf-btn-edit-period"
                              onClick={() => editPeriod(entry.day, idx)}
                            >
                              Edit
                            </button>
                          ) : (
                            <button
                              className="rf-btn-remove-period"
                              onClick={() => removePeriod(entry.day, idx)}
                            >
                              <svg
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M18 6 6 18M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {!period.isConfirmed ? (
                          <>
                            <div className="rf-period-fields">
                              <div className="rf-period-time">
                                <input
                                  className="rf-input rf-input-sm"
                                  type="time"
                                  value={period.startTime}
                                  onChange={(e) =>
                                    updatePeriod(
                                      entry.day,
                                      idx,
                                      "startTime",
                                      e.target.value,
                                    )
                                  }
                                />
                                <span className="rf-time-separator">-</span>
                                <input
                                  className="rf-input rf-input-sm"
                                  type="time"
                                  value={period.endTime}
                                  onChange={(e) =>
                                    updatePeriod(
                                      entry.day,
                                      idx,
                                      "endTime",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>

                              <select
                                className="rf-input rf-input-sm rf-select"
                                value={period.subject}
                                onChange={(e) =>
                                  updatePeriod(
                                    entry.day,
                                    idx,
                                    "subject",
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="">Select Subject *</option>
                                {SUBJECTS.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>

                              {/* ── Teacher dropdown: only teachers assigned to this class/section ── */}
                              <select
                                className="rf-input rf-input-sm rf-select"
                                value={period.teacherId || ""}
                                onChange={(e) =>
                                  updatePeriod(
                                    entry.day,
                                    idx,
                                    "teacherId",
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="">Select Teacher *</option>
                                {filteredTeachers.map((teacher) => (
                                  <option key={teacher._id} value={teacher._id}>
                                    {teacher.fullName}
                                  </option>
                                ))}
                              </select>

                              <select
                                className="rf-input rf-input-sm"
                                value={period.roomNumber}
                                onChange={(e) =>
                                  updatePeriod(
                                    entry.day,
                                    idx,
                                    "roomNumber",
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="">Select Room</option>
                                {ROOMS.map((r) => (
                                  <option key={r} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="rf-period-confirm-section">
                              <button
                                className="rf-btn-confirm-period"
                                onClick={() => confirmPeriod(entry.day, idx)}
                              >
                                ✓ Confirm Period
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="rf-period-display">
                            <div className="rf-period-display-row">
                              <span className="rf-display-label">Time:</span>
                              <span className="rf-display-value">
                                {period.startTime} - {period.endTime}
                              </span>
                            </div>
                            <div className="rf-period-display-row">
                              <span className="rf-display-label">Subject:</span>
                              <span className="rf-display-value">
                                {period.subject}
                              </span>
                            </div>
                            <div className="rf-period-display-row">
                              <span className="rf-display-label">Teacher:</span>
                              <span className="rf-display-value">
                                {period.teacherName}
                              </span>
                            </div>
                            {period.roomNumber && (
                              <div className="rf-period-display-row">
                                <span className="rf-display-label">Room:</span>
                                <span className="rf-display-value">
                                  {period.roomNumber}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {entries.length === 0 && (
            <div className="rf-empty-state">
              <svg
                width="64"
                height="64"
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
              <p>No days added yet. Select a day above to get started.</p>
            </div>
          )}

          <div className="rf-required-note">* Required fields</div>
        </div>
      </main>
    </div>
  );
}
