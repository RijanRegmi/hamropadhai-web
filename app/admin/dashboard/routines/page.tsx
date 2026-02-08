"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAllRoutinesAction,
  deleteRoutineAction,
} from "./../../../../lib/actions/routine-action";
import toast from "react-hot-toast";
import "./routines-list.css";

interface Routine {
  _id: string;
  classId: string;
  sectionId: string;
  academicYear: string;
  isActive: boolean;
  entries: Array<{
    day: string;
    periods: Array<{
      periodNumber: number;
      startTime: string;
      endTime: string;
      subject: string;
      teacherName: string;
      roomNumber?: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function AdminRoutinesPage() {
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterClass, setFilterClass] = useState<string>("");
  const [filterSection, setFilterSection] = useState<string>("");

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      setIsLoading(true);
      const result = await getAllRoutinesAction();

      if (!result.success) {
        toast.error(result.message || "Failed to load routines");
        return;
      }

      console.log("Fetched routines:", result.data);
      setRoutines(result.data || []);
    } catch (error: any) {
      console.error("Error fetching routines:", error);
      toast.error("Failed to load routines");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (
    routineId: string,
    className: string,
    section: string,
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete the routine for Class ${className} - Section ${section}?`,
      )
    ) {
      return;
    }

    try {
      const result = await deleteRoutineAction(routineId);

      if (!result.success) {
        toast.error(result.message || "Failed to delete routine");
        return;
      }

      toast.success("Routine deleted successfully!");
      fetchRoutines(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting routine:", error);
      toast.error("Failed to delete routine");
    }
  };

  const filteredRoutines = routines.filter((routine) => {
    if (filterClass && routine.classId !== filterClass) return false;
    if (filterSection && routine.sectionId !== filterSection) return false;
    return true;
  });

  const getTotalPeriods = (routine: Routine) => {
    return routine.entries.reduce(
      (total, entry) => total + entry.periods.length,
      0,
    );
  };

  if (isLoading) {
    return (
      <div className="rl-page">
        <div className="rl-loading">
          <div className="rl-spinner"></div>
          <p>Loading routines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rl-page">
      <header className="rl-header">
        <div className="rl-header-inner">
          <div className="rl-brand">
            <div className="rl-brand-logo">📚</div>
            <span className="rl-brand-title">HamroPadhai Admin</span>
          </div>
          <button
            className="rl-btn-create"
            onClick={() => router.push("/admin/dashboard/routines/create")}
          >
            + Create New Routine
          </button>
        </div>
      </header>

      <main className="rl-content">
        <div className="rl-card">
          <div className="rl-card-header">
            <button
              className="sr-btn-back"
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
              <span className="sr-back-text">Back</span>
            </button>
            <div>
              <h2 className="rl-card-title">Class Routines</h2>
              <p className="rl-card-sub">
                Manage all class schedules ({filteredRoutines.length} routine
                {filteredRoutines.length !== 1 ? "s" : ""})
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="rl-filters">
            <select
              className="rl-filter-select"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>

            <select
              className="rl-filter-select"
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

            {(filterClass || filterSection) && (
              <button
                className="rl-btn-clear-filters"
                onClick={() => {
                  setFilterClass("");
                  setFilterSection("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Routines Grid */}
          {filteredRoutines.length === 0 ? (
            <div className="rl-empty-state">
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
              <h3>No Routines Found</h3>
              <p>
                {filterClass || filterSection
                  ? "No routines match your filters. Try adjusting the filters."
                  : "Get started by creating your first class routine."}
              </p>
              <button
                className="rl-btn-create-empty"
                onClick={() => router.push("/admin/dashboard/routines/create")}
              >
                Create First Routine
              </button>
            </div>
          ) : (
            <div className="rl-routines-grid">
              {filteredRoutines.map((routine) => (
                <div key={routine._id} className="rl-routine-card">
                  <div className="rl-routine-header">
                    <div className="rl-routine-title">
                      <h3>
                        Class {routine.classId} - Section {routine.sectionId}
                      </h3>
                      <span
                        className={`rl-status-badge ${
                          routine.isActive ? "active" : "inactive"
                        }`}
                      >
                        {routine.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="rl-routine-year">{routine.academicYear}</p>
                  </div>

                  <div className="rl-routine-stats">
                    <div className="rl-stat">
                      <span className="rl-stat-label">Days</span>
                      <span className="rl-stat-value">
                        {routine.entries.length}
                      </span>
                    </div>
                    <div className="rl-stat">
                      <span className="rl-stat-label">Total Periods</span>
                      <span className="rl-stat-value">
                        {getTotalPeriods(routine)}
                      </span>
                    </div>
                  </div>

                  <div className="rl-routine-days">
                    {routine.entries.slice(0, 3).map((entry, idx) => (
                      <div key={idx} className="rl-day-pill">
                        {entry.day.substring(0, 3)} ({entry.periods.length})
                      </div>
                    ))}
                    {routine.entries.length > 3 && (
                      <div className="rl-day-pill more">
                        +{routine.entries.length - 3} more
                      </div>
                    )}
                  </div>

                  <div className="rl-routine-actions">
                    <button
                      className="rl-btn-view"
                      onClick={() =>
                        router.push(
                          `/admin/dashboard/routines/edit/${routine._id}`,
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
                      View Details
                    </button>
                    <button
                      className="rl-btn-edit"
                      onClick={() =>
                        router.push(
                          `/admin/dashboard/routines/edit/${routine._id}`,
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
                      className="rl-btn-delete"
                      onClick={() =>
                        handleDelete(
                          routine._id,
                          routine.classId,
                          routine.sectionId,
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
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete
                    </button>
                  </div>

                  <div className="rl-routine-footer">
                    <span className="rl-routine-date">
                      Created {new Date(routine.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
