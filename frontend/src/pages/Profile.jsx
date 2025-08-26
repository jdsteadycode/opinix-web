// grab modules
import { useState, useEffect } from "react";

// () -> Profile Component
function Profile() {

    // initial array for user details**
    const [user, setUser] = useState({});

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
        }
        
        // invoke the function
        fetchUser();
    }, []);

    console.log(user);

    // return jsx
    return(
            <main className="app-content app-profile-content">

                {/* Profile Heading */}
                <section className="profile-heading">
                    <h1>🧑‍💻 {user?.nickname ?? "N/A"}</h1>
                    <div className="profile-details">
                        <p>Email: {user?.email ?? "N/A"}</p>
                        <p>Phone: {user?.phone ?? "N/A"}</p>
                        <p>DOB: {user?.birthdate ?? "N/A"}</p>
                    </div>
                </section>

                {/* Profile container */}
                <section className="profile-analytics-container">
                    <h1>📊 Stats</h1>
                    <div className="profile-analytic-cards">
                        <div className="analytics-card">
                            <h2>Created polls: 34</h2>
                        </div>
                        <div className="analytics-card">
                            <h2>Voted polls: 10</h2>
                        </div>
                        <div className="analytics-card">
                            <h2>Total votes: 100</h2>
                        </div>
                    </div>
                </section>

                {/* Profile settings */}
                <section className="profile-settings">
                    <h1>⚙️ Settings</h1>
                    <div className="profile-privilleges">
                        <a href="#" className="profile-privillges-button">Change Password</a>
                        <a href="#" className="profile-privillges-button">Update Profile</a>
                    </div>
                </section>
            </main>
    );
}

// expose to the project
export {Profile};