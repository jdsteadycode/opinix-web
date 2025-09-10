// grab modules
import { useState, useEffect } from "react";

// () -> Profile Component
function Profile() {

    // initial state array for user details**
    const [user, setUser] = useState({});

    // initial state array  for update-user-profile**
    const [showUpdateModal, setShowUpdateModal] = useState(false);   
    const [showViewModal, setShowViewModal] = useState(false);   
    const [formData, setFormData] = useState({});   

    // grab the token?
    const token = localStorage.getItem("token");

    // interact with backend for user-details
    useEffect(function () {
        async function fetchUser() {
            // initiate the call
            const response = await fetch(`http://localhost:5000/api/user/me`, {
                "method": "GET",
                "headers": {
                    "Authorization": `Bearer ${token}`
                },
            });

            // get the user-data
            const data = await response.json();
            
            // check log**
            // console.log(data.user);

            // update the state
            setUser(data.user);
            setFormData(data.user);
        }
        
        // invoke the function
        fetchUser();
    }, []);

    // () -> handle update form data change!
    function handleChange(event) {
        // update the state*
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    }

    // () -> handle profile save (updations)**
    async function handleProfileSave(event) {

        // safe**
        try {

            // FormData as data contains file as well!
            const fData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (key === "profileImage") {
                        // only append if it's a File
                        if (value instanceof File) {
                            fData.append("profileImage", value);
                        }
                    } else {
                        fData.append(key, value);
                    }
                }
            });

            // try to make backend request!
            const profileUpdateRequest = await fetch(`http://localhost:5000/api/user/me/update`, {
                "method": "PATCH",
                "body": fData,
            });

            // recieve the response
            const profileUpdateOutcome = await profileUpdateRequest.json();

            // check for the status
            if(profileUpdateRequest.ok) {

                // update the state**
                setUser(profileUpdateOutcome.user);

                // collapse the model
                setShowUpdateModal(false);

            } 
            // otherwise,
            else {

                // throw error
                console.error("Update Failed!");
            }
        }
        // handle run-time error
        catch(error) {

            // throw request error
            console.error("Server Error!");
        }
    }

    // check log**
    // console.log(user);

    // return jsx
    return(
            <main className="app-content app-profile-content">

                {/* Profile Heading */}
                <section className="profile-heading">
                    <h1>🧑‍💻 {user?.nickname ?? "N/A"}</h1>
                    <div className="profile-details">
                        <p>Email: {user?.email ?? "N/A"}</p>
                        <p>Phone: {user?.phone ?? "N/A"}</p>
                        <p>DOB: {user?.birthdate ? new Date(user.birthdate).toISOString().split("T")[0] : "N/A"}</p>
                    </div>
                </section>

                {/* Profile container */}
                <section className="profile-analytics-container">
                    <h1>📊 Stats</h1>
                    <div className="profile-analytic-cards">
                        <div className="analytics-card">
                            <h2>Created polls: {user?.stats?.createdPolls}</h2>
                        </div>
                        <div className="analytics-card">
                            <h2>Voted polls: {user?.stats?.votedPolls}</h2>
                        </div>
                        <div className="analytics-card">
                            <h2>Total votes: {user?.stats?.totalVotes}</h2>
                        </div>
                    </div>
                </section>

                {/* Profile settings */}
                <section className="profile-settings">
                    <h1>⚙️ Settings</h1>
                    <div className="profile-privilleges">
                        <button 
                            onClick={() => setShowViewModal(true)}
                            className="profile-privillges-button">
                            View Profile
                        </button>
                        <button 
                            onClick={() => setShowUpdateModal(true)}
                            className="profile-privillges-button"
                        >
                            Update Profile
                        </button>
                    </div>
                </section>

                {/* View profile section */}
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
                                <button 
                                    className="close-btn" 
                                    onClick={() => setShowViewModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* update-profile section */}
                {showUpdateModal && (
                <div className="profile-overlay">
                    <div className="profile-modal">
                        <h2>Update Profile</h2>
                        <img 
                            width={100}
                            height={100}
                            style={{
                                "borderRadius": "50%"
                            }}
                            src={
                                formData.profileImage instanceof File
                                ? URL.createObjectURL(formData.profileImage) // preview new file
                                : `http://localhost:5000/uploads/${formData.profileImage}` // old file from server
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
                        <select 
                            name="gender" 
                            value={formData.gender || ""} 
                            onChange={handleChange}
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <input 
                            type="text" 
                            onFocus={(e) => e.target.type === "text" ? e.target.type = "date" : e.target.type = "text"}
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
                            <button 
                                className="cancel-btn" 
                                onClick={() => setShowUpdateModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="save-btn" 
                                onClick={handleProfileSave}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </main>
    );
}

// expose to the project
export {Profile};