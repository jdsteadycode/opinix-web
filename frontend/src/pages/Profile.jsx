// grab modules..
import { useState, useEffect } from "react";
import {Link} from "react-router-dom";

// () -> Profile Component..
function Profile() {
  // initial state array..
  const [user, setUser] = useState({});
  const [createdPolls, setCreatedPolls] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [formData, setFormData] = useState({});
  const token = localStorage.getItem("token");
  const uId = localStorage.getItem("uId");

  // After profile loads..
  useEffect(() => {
    // () -> handle fetch user..
    async function fetchUser() {
      const res = await fetch("http://localhost:5000/api/user/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUser(data.user);
      setFormData(data.user);
    }
    fetchUser();
  }, [token]);

  // After Profile loads..
  useEffect(() => {

    // () -> handle created polls of user..
    async function fetchCreatedPolls() {

      // handle safely..
      try {
        const res = await fetch(`http://localhost:5000/api/user/me/${uId}/my-polls`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        // get the data..
        const data = await res.json();

        // update the state..
        if (res.ok) setCreatedPolls(data.data || []);
      } 
      // when error..
      catch (err) {
        console.error("Error fetching created polls:", err);
      }
    }
    fetchCreatedPolls();
  }, [token]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // () -> Update Profile Handler
  async function handleProfileSave() {
    try {
      const fData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === "profileImage" && value instanceof File) {
            fData.append("profileImage", value);
          } else {
            fData.append(key, value);
          }
        }
      });

      const res = await fetch("http://localhost:5000/api/user/me/update", {
        method: "PATCH",
        body: fData,
      });
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setShowUpdateModal(false);
      } else {
        alert("Failed to update profile!");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while updating!");
    }
  }

  // () -> handle poll delete..
  async function handlePollDelete(pollId, userId) {

    // try safely..
    try {

      // make an api call..
      const apiCall = await fetch(`http://localhost:5000/api/user/me/delete-poll/${pollId}`, {
        "method": "DELETE",
        "headers": {
          "Content-Type": "application/json",
        },
        "body": JSON.stringify({ userId }),
      });

      // get the response..
      const response = await apiCall.json();

      // when response is success..
      if(response.ok) console.log("poll deleted successfully..");

      console.log(response);
    }

    // handle error..
    catch(error) {

      // check log..
      console.log(error);
    }
  }

  // return jsx..
  return (
    <main className="profile-container">
      {/* LEFT SIDE — Details */}
      <section className="profile-info-section">
        <h1>👤 Profile Overview</h1>
        <p className="bio-text">{user?.bio || "No bio provided yet."}</p>

        <h2>📊 Stats</h2>
        <div className="profile-stats">
          <div className="stat-card">Created Polls: {user?.stats?.createdPolls || 0}</div>
          <div className="stat-card">Voted Polls: {user?.stats?.votedPolls || 0}</div>
          <div className="stat-card">Total Votes: {user?.stats?.totalVotes || 0}</div>
        </div>

        <h2>⚙️ Settings</h2>
        <div className="profile-actions">
          <button onClick={() => setShowViewModal(true)}>View Profile</button>
          <button onClick={() => setShowUpdateModal(true)}>Update Profile</button>
        </div>

        {/* 🟢 Created Polls Section */}
        <h2 style={{ marginTop: "30px" }}>🗳️ Created Polls</h2>
        {createdPolls.length === 0 ? (
          <p className="no-polls">You haven’t created any polls yet.</p>
        ) : (
          <ul className="created-polls-list">
            {createdPolls.map((poll) => (
              <li key={poll.id} className="poll-item">
                {poll.is_active == 1 
                ? (
                <Link
                  to={`/poll/${poll.id}`}
                  style={{
                    textDecoration: "none",
                    color: "#fff",
                  }}
                >
                  <span>{poll.title}</span>
                </Link> 
                ) :
                 <span>{poll.title}</span>}
                <span className={`poll-status ${poll.is_active ? "active" : "inactive"}`}>
                  {poll.is_active ? "Active" : "Deleted"}
                </span>

                {/* delete poll button */}
                {poll.is_active == 1 ? (<button
                  className="delete-poll-btn"
                  onClick={(e) => {handlePollDelete(poll.id, uId)}}
                >
                  ❌
                </button>) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* RIGHT SIDE — Profile Image */}
      <section className="profile-photo-section">
        <div className="profile-photo-card">
          <img
            src={
              formData.profileImage instanceof File
                ? URL.createObjectURL(formData.profileImage)
                : `http://localhost:5000/uploads/${formData.profileImage}`
            }
            alt="Profile"
          />
        </div>
      </section>

      {/* 🔍 View Profile Modal */}
      {showViewModal && (
        <div className="profile-overlay">
          <div className="profile-modal">
            <h2>👤 Profile Details</h2>
            <p><b>Nickname:</b> {user?.nickname ?? "N/A"}</p>
            <p><b>Email:</b> {user?.email ?? "N/A"}</p>
            <p><b>Phone:</b> {user?.phone ?? "N/A"}</p>
            <p><b>Gender:</b> {user?.gender ?? "N/A"}</p>
            <p><b>DOB:</b> {user?.birthdate ? new Date(user.birthdate).toISOString().split("T")[0] : "N/A"}</p>
            <p><b>Bio:</b> {user?.bio ?? "N/A"}</p>

            <div className="modal-actions">
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ Update Profile Modal */}
      {showUpdateModal && (
        <div className="profile-overlay">
          <div className="profile-modal">
            <h2>✏️ Update Profile</h2>
            <img
              width={100}
              height={100}
              style={{ borderRadius: "50%" }}
              src={
                formData.profileImage instanceof File
                  ? URL.createObjectURL(formData.profileImage)
                  : `http://localhost:5000/uploads/${formData.profileImage}`
              }
            />
            <input
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, profileImage: e.target.files[0] })}
            />
            <input
              type="text"
              name="nickname"
              placeholder="Nickname"
              value={formData.nickname || ""}
              onChange={handleChange}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone || ""}
              onChange={handleChange}
            />
            <select name="gender" value={formData.gender || ""} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input
              type="text"
              onFocus={(e) =>
                (e.target.type = e.target.type === "text" ? "date" : "text")
              }
              name="birthdate"
              placeholder="Birth Date"
              value={formData.birthdate || ""}
              onChange={handleChange}
            />
            <textarea
              name="bio"
              placeholder="Bio"
              value={formData.bio || ""}
              onChange={handleChange}
            />

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowUpdateModal(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleProfileSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export { Profile };
