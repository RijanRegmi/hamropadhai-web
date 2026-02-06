"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAllUsersAction,
  deleteUserAction,
} from "./../../../lib/actions/admin-action";
import { getCurrentUserId } from "./../../../lib/cookie";
import toast from "react-hot-toast";
import "./users.css";

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  phone: string;
  gender: string;
  role: string;
  profileImage: string | null;
  about?: string;
  classId?: string;
  sectionId?: string;
  address?: string;
  parentContact?: string;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    initializePage();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user._id.toLowerCase().includes(term) ||
          user.fullName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.username.toLowerCase().includes(term) ||
          user.phone.includes(term),
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const initializePage = async () => {
    try {
      // Get current user ID from server
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
      await fetchUsers(userId);
    } catch (error) {
      console.error("Error initializing page:", error);
      setIsLoading(false);
    }
  };

  const fetchUsers = async (excludeUserId: string | null = null) => {
    try {
      setIsLoading(true);
      const result = await getAllUsersAction();
      if (!result.success) {
        toast.error(result.message || "Failed to fetch users");
        return;
      }

      // Filter out the current logged-in admin
      const allUsers = result.data;
      const filteredData = excludeUserId
        ? allUsers.filter((user: User) => user._id !== excludeUserId)
        : allUsers;

      setUsers(filteredData);
      setFilteredUsers(filteredData);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (deleteConfirm !== userId) {
      setDeleteConfirm(userId);
      setTimeout(() => setDeleteConfirm(null), 3000); // Reset after 3 seconds
      return;
    }

    try {
      const result = await deleteUserAction(userId);
      if (!result.success) {
        toast.error(result.message || "Failed to delete user");
        return;
      }
      toast.success(result.message || "User deleted successfully!");
      await fetchUsers(currentUserId);
      setDeleteConfirm(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  if (isLoading) {
    return (
      <div className="users-page">
        <header className="users-header">
          <div className="users-header-inner">
            <div className="users-brand">
              <div className="users-brand-logo">📚</div>
              <span className="users-brand-title">HamroPadhai Admin</span>
            </div>
          </div>
        </header>
        <div className="users-loading">
          <div className="users-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <header className="users-header">
        <div className="users-header-inner">
          <div className="users-brand">
            <div className="users-brand-logo">📚</div>
            <span className="users-brand-title">HamroPadhai Admin</span>
          </div>
          <div className="users-header-actions">
            <button
              className="users-btn-logout"
              onClick={async () => {
                const { clearAuthCookies } =
                  await import("./../../../lib/cookie");
                await clearAuthCookies();
                toast.success("Logged out successfully!");
                setTimeout(() => {
                  router.push("/login");
                }, 1000);
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="users-content">
        <div className="users-container">
          {/* Header Section */}
          <div className="users-top">
            <div className="users-top-left">
              <h1 className="users-title">User Management</h1>
              <p className="users-subtitle">Manage all users in the system</p>
            </div>
            <button
              className="users-btn-create"
              onClick={() => router.push("/admin/users/create")}
            >
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
              Create User
            </button>
          </div>

          {/* Search Bar */}
          <div className="users-search-section">
            <div className="users-search-box">
              <svg
                className="users-search-icon"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="users-search-input"
                placeholder="Search by ID, name, email, username, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="users-search-clear"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="users-count">
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1 ? "user" : "users"}
            </div>
          </div>

          {/* Users Table */}
          {filteredUsers.length === 0 ? (
            <div className="users-empty">
              <svg
                width="64"
                height="64"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <p className="users-empty-text">
                {searchTerm
                  ? "No users found matching your search"
                  : "No users found"}
              </p>
              {searchTerm && (
                <button
                  className="users-btn-clear-search"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Profile</th>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="users-avatar">
                          {user.profileImage ? (
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050"}${user.profileImage}`}
                              alt={user.fullName}
                            />
                          ) : (
                            <div className="users-avatar-placeholder">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="users-cell-name">{user.fullName}</td>
                      <td className="users-cell-username">{user.username}</td>
                      <td className="users-cell-email">{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span
                          className={`users-badge-gender users-badge-${user.gender}`}
                        >
                          {user.gender}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`users-badge-role users-badge-${user.role}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <div className="users-actions">
                          <button
                            className="users-btn-edit"
                            onClick={() =>
                              router.push(`/admin/users/edit/${user._id}`)
                            }
                            title="Edit user"
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
                          </button>
                          <button
                            className={`users-btn-delete ${
                              deleteConfirm === user._id
                                ? "users-btn-delete-confirm"
                                : ""
                            }`}
                            onClick={() => handleDelete(user._id)}
                            title={
                              deleteConfirm === user._id
                                ? "Click again to confirm"
                                : "Delete user"
                            }
                          >
                            {deleteConfirm === user._id ? (
                              <>
                                <svg
                                  width="16"
                                  height="16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                                Confirm
                              </>
                            ) : (
                              <svg
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
