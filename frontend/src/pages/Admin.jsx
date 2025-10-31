import React, { useEffect, useState } from "react";

function Admin() {
  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const adminId = localStorage.getItem("uId");
  const token = localStorage.getItem("token");

  // ✅ Fetch data based on active tab
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        if (activeTab === "reports" || activeTab === "deleted") {
          const res = await fetch("http://localhost:5000/api/poll/admin/reported-polls");
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to load reports");
          setReports(data.data);
        } 
        else if (activeTab === "users") {
          const res = await fetch("http://localhost:5000/api/admin/all", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          console.log(data);
          if (!res.ok) throw new Error(data.message || "Failed to load users");
          setUsers(data.users);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeTab]);

  // ✅ Handle poll dismissal
  async function dismissReport(pollId) {
    try {
      const response = await fetch(`http://localhost:5000/api/poll/admin/dismiss/${pollId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to dismiss report");

      setReports(prev =>
        prev.map(r => (r.poll_id === pollId ? { ...r, status: "dismissed" } : r))
      );
    } catch (err) {
      alert(err.message);
    }
  }

  // ✅ Confirm poll deletion
  async function confirmDelete() {
    if (!selectedPollId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:5000/api/poll/admin/delete/${selectedPollId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete");

      setReports(prev =>
        prev.map(r =>
          r.poll_id === selectedPollId ? { ...r, status: "deleted" } : r
        )
      );
      setShowDeleteModal(false);
      setSelectedPollId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  }

  // ✅ Restore poll
  async function restorePoll(pollId) {
    try {
      const response = await fetch(`http://localhost:5000/api/poll/admin/restore/${pollId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to restore poll");

      setReports(prev =>
        prev.map(r =>
          r.poll_id === pollId ? { ...r, status: "reviewed" } : r
        )
      );

      alert("Poll restored successfully!");
    } catch (err) {
      alert(err.message);
    }
  }

  // ✅ Delete user (soft delete)
  async function deleteUser(userId) {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/delete/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete user");

      setUsers(prev => prev.filter(u => u.id !== userId));
      alert("User soft deleted successfully!");
    } catch (err) {
      alert(err.message);
    }
  }

  // ✅ Filtered reports
  const filteredReports =
    activeTab === "reports"
      ? reports.filter(r => r.status === "pending" || r.status === "reviewed")
      : reports.filter(r => r.status === "deleted");

  return (
    <main className="admin-container">
      <h1 className="admin-heading">Admin Dashboard</h1>

      {/* Floating Menu */}
      <div className="admin-menu">
        <button
          className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          🧾 Reported Polls
        </button>
        <button
          className={`tab-btn ${activeTab === "deleted" ? "active" : ""}`}
          onClick={() => setActiveTab("deleted")}
        >
          🗑️ Deleted Polls
        </button>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 All Users
        </button>
      </div>

      {/* Loader / Error */}
      {loading && <p>Loading {activeTab}...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Content */}
      {!loading && activeTab !== "users" && (
        <>
          {filteredReports.length === 0 ? (
            <p className="no-reports">
              {activeTab === "reports"
                ? "No reported polls found 🎉"
                : "No deleted polls yet 🗂️"}
            </p>
          ) : (
            <section className="reports-grid">
              {filteredReports.map((r, index) => (
                <article key={index} className="report-card">
                  <div className="report-info">
                    <h3>
                      "{r.title}"
                      {r.status === "deleted" && (
                        <span className="deleted-badge"> (Deleted)</span>
                      )}
                    </h3>
                    <p><strong>Reason:</strong> {r.reason}</p>
                    {r.details && <p><strong>Details:</strong> {r.details}</p>}
                    <p><strong>Status:</strong> <span className={`status ${r.status}`}>{r.status}</span></p>
                    <p><strong>Reported by:</strong> {r.reported_by}</p>
                    <p className="report-date">
                      <strong>Reported on:</strong> {new Date(r.created_at).toLocaleString()}
                    </p>

                    {activeTab === "deleted" && (
                      <button className="restore-btn" onClick={() => restorePoll(r.poll_id)}>
                        Restore
                      </button>
                    )}
                  </div>

                  {activeTab === "reports" && (
                    <div className="report-actions">
                      <button
                        className="dismiss-btn"
                        onClick={() => dismissReport(r.poll_id)}
                        disabled={r.status === "dismissed"}
                      >
                        Dismiss
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          setSelectedPollId(r.poll_id);
                          setShowDeleteModal(true);
                        }}
                        disabled={r.status === "deleted"}
                      >
                        Delete Poll
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </section>
          )}
        </>
      )}

      {/* 👥 All Users Section */}
      {!loading && activeTab === "users" && (
        <section className="users-grid">
          {users.length === 0 ? (
            <p className="no-reports">No users found 👤</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="user-card">
                <h3>{u.username}</h3>
                <p><strong>Email:</strong> {u.email}</p>
                <p><strong>Role:</strong> {u.role}</p>
                <p><strong>Nickname:</strong> {u.nickname}</p>
                <p><strong>Gender:</strong> {u.gender ?? "n/a"}</p>
                <button
                  className="delete-btn"
                  onClick={() => deleteUser(u.id)}
                >
                  Delete User
                </button>
              </div>
            ))
          )}
        </section>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="profile-overlay">
          <div className="profile-modal">
            <h2 style={{ color: "#fff" }}>⚠️ ATTENTION</h2>
            <p style={{ color: "#ddd", marginBottom: "1rem" }}>
              You're performing a <code>DELETE</code> operation on this poll!
            </p>
            <div className="modal-actions">
              <button
                style={{ backgroundColor: "#D94446" }}
                className="save-btn"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPollId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export { Admin };
