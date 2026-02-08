"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createRoutineAction } from "../../../../../lib/actions/routine-action";

import {
  getAllUsersAction,
  getFilteredTeachersAction,
} from "../../../../../lib/actions/admin-action";
import toast from "react-hot-toast";
import "./routine.css";

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
  isConfirmed: boolean; // NEW: Track if period is confirmed
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

const CLASSES = ["11", "12"];
const SECTIONS = ["A", "B", "C", "D", "E"];

export default function CreateRoutinePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);

  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [isClassSectionConfirmed, setIsClassSectionConfirmed] = useState(false);

  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Fetch filtered teachers when class/section is confirmed
  useEffect(() => {
    if (classId && sectionId && isClassSectionConfirmed) {
      fetchFilteredTeachers();
    } else {
      setFilteredTeachers([]);
    }
  }, [classId, sectionId, isClassSectionConfirmed]);

  const fetchTeachers = async () => {
    try {
      setIsLoadingTeachers(true);
      const result = await getAllUsersAction();
      console.log("Fetch teachers result:", result);

      if (result.success) {
        const teacherUsers = result.data.filter(
          (user: any) => user.role === "teacher",
        );
        console.log("Teacher users found:", teacherUsers);
        setAllTeachers(teacherUsers);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const fetchFilteredTeachers = async () => {
    try {
      setIsLoadingTeachers(true);
      const result = await getFilteredTeachersAction(classId, sectionId);
      console.log("Filtered teachers result:", result);

      if (result.success) {
        setFilteredTeachers(result.data);
        console.log(
          `Found ${result.data.length} teachers for Class ${classId} - Section ${sectionId}`,
        );
      } else {
        toast.error(result.message || "Failed to load teachers");
        setFilteredTeachers([]);
      }
    } catch (error) {
      console.error("Error fetching filtered teachers:", error);
      toast.error("Failed to load teachers");
      setFilteredTeachers([]);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const handleConfirmClassSection = () => {
    if (!classId || !sectionId) {
      toast.error("Please select both class and section");
      return;
    }
    setIsClassSectionConfirmed(true);
    toast.success(`Class ${classId} - Section ${sectionId} confirmed!`);
  };

  const handleChangeClassSection = () => {
    setIsClassSectionConfirmed(false);
    setEntries([]);
    setSelectedDay(null);
    toast("You can now change class and section");
  };

  const addDay = () => {
    if (!isClassSectionConfirmed) {
      toast.error("Please confirm class and section first");
      return;
    }

    if (!selectedDay) {
      toast.error("Please select a day");
      return;
    }

    if (entries.some((e) => e.day === selectedDay)) {
      toast.error("This day is already added");
      return;
    }

    setEntries([
      ...entries,
      {
        day: selectedDay,
        periods: [],
      },
    ]);
    setSelectedDay(null);
  };

  const removeDay = (day: string) => {
    setEntries(entries.filter((e) => e.day !== day));
  };

  const addPeriod = (day: string) => {
    setEntries(
      entries.map((entry) => {
        if (entry.day === day) {
          const nextPeriodNumber = entry.periods.length + 1;
          return {
            ...entry,
            periods: [
              ...entry.periods,
              {
                periodNumber: nextPeriodNumber,
                startTime: "",
                endTime: "",
                subject: "",
                teacherId: null,
                teacherName: "",
                roomNumber: "",
                isConfirmed: false, // NEW: Period starts unconfirmed
              },
            ],
          };
        }
        return entry;
      }),
    );
  };

  const removePeriod = (day: string, periodIndex: number) => {
    setEntries(
      entries.map((entry) => {
        if (entry.day === day) {
          const newPeriods = entry.periods.filter((_, i) => i !== periodIndex);
          // Renumber periods
          return {
            ...entry,
            periods: newPeriods.map((p, i) => ({ ...p, periodNumber: i + 1 })),
          };
        }
        return entry;
      }),
    );
  };

  const updatePeriod = (
    day: string,
    periodIndex: number,
    field: keyof Period,
    value: any,
  ) => {
    setEntries(
      entries.map((entry) => {
        if (entry.day === day) {
          return {
            ...entry,
            periods: entry.periods.map((period, i) => {
              if (i === periodIndex) {
                // If teacher is selected, update teacherName
                if (field === "teacherId") {
                  const teacher = filteredTeachers.find((t) => t._id === value);
                  return {
                    ...period,
                    teacherId: value || null,
                    teacherName: teacher ? teacher.fullName : "",
                  };
                }
                return { ...period, [field]: value };
              }
              return period;
            }),
          };
        }
        return entry;
      }),
    );
  };

  // NEW: Confirm period function
  const confirmPeriod = (day: string, periodIndex: number) => {
    const entry = entries.find((e) => e.day === day);
    if (!entry) return;

    const period = entry.periods[periodIndex];

    // Validate period data
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
        if (entry.day === day) {
          return {
            ...entry,
            periods: entry.periods.map((p, i) => {
              if (i === periodIndex) {
                return { ...p, isConfirmed: true };
              }
              return p;
            }),
          };
        }
        return entry;
      }),
    );

    toast.success(`Period ${period.periodNumber} confirmed!`);
  };

  // NEW: Edit period function
  const editPeriod = (day: string, periodIndex: number) => {
    setEntries(
      entries.map((entry) => {
        if (entry.day === day) {
          return {
            ...entry,
            periods: entry.periods.map((p, i) => {
              if (i === periodIndex) {
                return { ...p, isConfirmed: false };
              }
              return p;
            }),
          };
        }
        return entry;
      }),
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);

      // Validation
      if (!classId || !sectionId || !academicYear) {
        toast.error("Please fill in class, section, and academic year");
        return;
      }

      if (!isClassSectionConfirmed) {
        toast.error("Please confirm class and section first");
        return;
      }

      if (entries.length === 0) {
        toast.error("Please add at least one day");
        return;
      }

      // Validate all periods
      for (const entry of entries) {
        if (entry.periods.length === 0) {
          toast.error(`Please add periods for ${entry.day}`);
          return;
        }

        for (const period of entry.periods) {
          if (!period.isConfirmed) {
            toast.error(
              `Please confirm all periods. ${entry.day} Period ${period.periodNumber} is not confirmed.`,
            );
            return;
          }

          if (
            !period.startTime ||
            !period.endTime ||
            !period.subject ||
            !period.teacherName
          ) {
            toast.error(
              `Please fill all fields for ${entry.day} Period ${period.periodNumber}`,
            );
            return;
          }
        }
      }

      // Remove isConfirmed field before sending to backend
      const cleanedEntries = entries.map((entry) => ({
        day: entry.day,
        periods: entry.periods.map((period) => ({
          periodNumber: period.periodNumber,
          startTime: period.startTime,
          endTime: period.endTime,
          subject: period.subject,
          teacherId: period.teacherId,
          teacherName: period.teacherName,
          roomNumber: period.roomNumber,
        })),
      }));

      console.log("Submitting routine data:", {
        classId,
        sectionId,
        academicYear,
        entries: cleanedEntries,
      });

      const result = await createRoutineAction({
        classId,
        sectionId,
        academicYear,
        entries: cleanedEntries,
      });

      console.log("Create routine result:", result);

      if (!result.success) {
        toast.error(result.message || "Failed to create routine");
        return;
      }

      toast.success(result.message || "Routine created successfully!");
      setTimeout(() => {
        router.push("/admin/dashboard/routines");
      }, 1000);
    } catch (error: any) {
      console.error("Error creating routine:", error);
      toast.error(error.message || "Failed to create routine");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rf-page">
      <header className="rf-header">
        <div className="rf-header-inner">
          <div className="rf-brand">
            <div className="rf-brand-logo">📚</div>
            <span className="rf-brand-title">HamroPadhai Admin</span>
          </div>
          <div className="rf-header-actions">
            <button
              className="rf-btn-cancel"
              onClick={() => router.push("/admin/dashboard/routines")}
            >
              Cancel
            </button>
            <button
              className="rf-btn-save"
              onClick={handleSubmit}
              disabled={isSaving || !isClassSectionConfirmed}
            >
              {isSaving ? "Creating..." : "Create Routine"}
            </button>
          </div>
        </div>
      </header>

      <main className="rf-content">
        <div className="rf-card">
          <h2 className="rf-card-title">Create Class Routine</h2>
          <p className="rf-card-sub">
            Fill in the details to create a new routine
          </p>

          {/* Basic Info */}
          <div className="rf-form-grid">
            <div className="rf-field">
              <label className="rf-label">Class *</label>
              <select
                className="rf-input rf-select"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                disabled={isClassSectionConfirmed}
              >
                <option value="">Select Class</option>
                {CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </div>

            <div className="rf-field">
              <label className="rf-label">Section *</label>
              <select
                className="rf-input rf-select"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                disabled={isClassSectionConfirmed}
              >
                <option value="">Select Section</option>
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    Section {sec}
                  </option>
                ))}
              </select>
            </div>

            <div className="rf-field">
              <label className="rf-label">Academic Year *</label>
              <input
                className="rf-input"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2024-2025"
                disabled={isClassSectionConfirmed}
              />
            </div>
          </div>

          {/* Confirmation Button */}
          <div className="rf-confirm-section">
            {!isClassSectionConfirmed ? (
              <button
                className="rf-btn-confirm"
                onClick={handleConfirmClassSection}
                disabled={!classId || !sectionId || !academicYear}
              >
                ✓ Confirm Class & Section
              </button>
            ) : (
              <div className="rf-confirmed-badge">
                <span className="rf-confirmed-text">
                  ✓ Confirmed: Class {classId} - Section {sectionId}
                </span>
                <button
                  className="rf-btn-change"
                  onClick={handleChangeClassSection}
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {isClassSectionConfirmed && (
            <>
              {/* Teacher Count Info */}
              <div className="rf-teacher-info">
                <p>
                  {filteredTeachers.length} teacher(s) available for Class{" "}
                  {classId} - Section {sectionId}
                  {filteredTeachers.length > 0 && (
                    <span style={{ marginLeft: "10px", fontSize: "12px" }}>
                      ({filteredTeachers.map((t) => t.fullName).join(", ")})
                    </span>
                  )}
                </p>
              </div>

              {/* Add Day Section */}
              <div className="rf-add-day-section">
                <h3 className="rf-section-title">Days & Periods</h3>
                <div className="rf-add-day-box">
                  <select
                    className="rf-input rf-select"
                    value={selectedDay || ""}
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    <option value="">Select a day to add</option>
                    {DAYS.filter(
                      (day) => !entries.some((e) => e.day === day),
                    ).map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
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

              {/* Days List */}
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
                                  title="Edit period"
                                >
                                  Edit
                                </button>
                              ) : (
                                <button
                                  className="rf-btn-remove-period"
                                  onClick={() => removePeriod(entry.day, idx)}
                                  title="Remove period"
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
                                      placeholder="Start"
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
                                      placeholder="End"
                                    />
                                  </div>

                                  <input
                                    className="rf-input rf-input-sm"
                                    value={period.subject}
                                    onChange={(e) =>
                                      updatePeriod(
                                        entry.day,
                                        idx,
                                        "subject",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Subject *"
                                  />

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
                                      <option
                                        key={teacher._id}
                                        value={teacher._id}
                                      >
                                        {teacher.fullName}
                                      </option>
                                    ))}
                                  </select>

                                  <input
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
                                    placeholder="Room (optional)"
                                  />
                                </div>

                                <div className="rf-period-confirm-section">
                                  <button
                                    className="rf-btn-confirm-period"
                                    onClick={() =>
                                      confirmPeriod(entry.day, idx)
                                    }
                                  >
                                    ✓ Confirm Period
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="rf-period-display">
                                <div className="rf-period-display-row">
                                  <span className="rf-display-label">
                                    Time:
                                  </span>
                                  <span className="rf-display-value">
                                    {period.startTime} - {period.endTime}
                                  </span>
                                </div>
                                <div className="rf-period-display-row">
                                  <span className="rf-display-label">
                                    Subject:
                                  </span>
                                  <span className="rf-display-value">
                                    {period.subject}
                                  </span>
                                </div>
                                <div className="rf-period-display-row">
                                  <span className="rf-display-label">
                                    Teacher:
                                  </span>
                                  <span className="rf-display-value">
                                    {period.teacherName}
                                  </span>
                                </div>
                                {period.roomNumber && (
                                  <div className="rf-period-display-row">
                                    <span className="rf-display-label">
                                      Room:
                                    </span>
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
            </>
          )}

          <div className="rf-required-note">* Required fields</div>
        </div>
      </main>
    </div>
  );
}
