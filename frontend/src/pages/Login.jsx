// grab module(s)
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

// () -> Login Component
function Login({ handleAuth, handleId }) {

    // initial state array 
    // for form-data
    let [userData, setUserData] = useState({
        email: "",
        password: ""
    });

    // initial state array for errors
    let [error, setError] = useState(null);


    // initial navigation instance
    let navigate = useNavigate();

   // () -> fills the user data
   function fillUserData(event) {

    // create a new copy of the user-data
    let data = {
        ...userData
    };

    // set the data
    data[event.target.name] = event.target.value;

    // update the state
    setUserData(data);
   }

   // () -> handle the Authentication
   async function handleLogin(event) {

    // restrict the re-loads
    event.preventDefault();

    // check when input is empty?
    if(userData.email === "" || userData.password === "") {
        // update the state*
        return setError("Enter the credentials!");
    }
    // check for email format!
    else if(!/\S+@\S+\.\S+/.test(userData.email)) {

        // update the state*
        return setError("Enter a valid E-mail please..");
    }

    else {

        // try to authenticate
        try {
            // response from the server
            let response = await fetch(`http://localhost:5000/api/auth/login`, {
                "method": "POST",
                "headers": {"Content-Type": "application/json"},
                "body": JSON.stringify(userData)
            });

            // parse the response from json
            let data = await response.json();

            // check log**
            console.log(data);

            // check response
            if(!response.ok) {
                // update the state
                setError(data.message);
            }

            // check if user is legit as well as authorized?
            if(data.token) {

                // store the token safely in client**
                localStorage.setItem("token", data.token);

                // notify the App
                // update prop function
                handleAuth(true);
                handleId(data.user?.id)

                // redirect the user to Main Page
                navigate("/");

                // update the state*
                setError(null);
            }
        }
        // handle run-time errors
        catch(error) {
            // log the error
            console.log(error);
        }
    }
   }

     // check log**
    console.log(userData);

    // retun login's jsx
    return( 
        <main className="app-auth-content">
            <form className="auth-form" onSubmit={handleLogin}>
                <h1>Hi there</h1>

                {/* Email input */}
                <div className="input-box">
                    <input
                        name="email"
                        type="text"
                        required
                        onChange={fillUserData}
                    />
                    <label>Email</label>
                </div>

                {/* Password input */}
                <div className="input-box">
                    <input
                        name="password"
                        type="password"
                        required
                        onChange={fillUserData}
                    />
                    <label>Password</label>
                </div>

                {/* Error message */}
                {error && <p className="message">{error}</p>}

                {/* Register link */}
                <p className="auth-register">
                    Are you new?{" "}
                    <Link to="/register">
                        <span>register here</span>
                    </Link>
                </p>

                <button type="submit">Login</button>
            </form>
        </main>
    );
}

// expose to the project
export {Login};