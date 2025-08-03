// grab module(s)
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

// () -> Login Component
function Login({handleAuth}) {

    // initial state array 
    // for form-data
    let [userData, setUserData] = useState({
        email: "",
        password: ""
    });

    // initial state-array for in-coming user-data from backend
    let [user, setUser] = useState({});

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

        // check if user is legit as well as authorized?
        if(data.token) {

            // store the token safely in client**
            localStorage.setItem("token", data.token);

            // notify the App
            // update prop function
            handleAuth(true);

            // redirect the user to Main Page
            navigate("/");
        }
    }
    // handle run-time errors
    catch(error) {
        // log the error
        console.log(error);
    }
   }

     // check log**
    console.log(userData);

    // retun login's jsx
    return( 
        <main className="app-auth-content">
            <form className="auth-form" onSubmit={handleLogin}>
                <h1>Hi there</h1>
                <input 
                    name="email"
                    type="text" 
                    placeholder="Enter Email?" 
                    onChange={fillUserData}
                />
                <input 
                    name="password"
                    type="password"
                    placeholder="Enter password?    " 
                    onChange={fillUserData}
                />
                <p className="auth-register">
                    Are you new?
                    <Link to="/register">
                        <span> register here</span>
                    </Link>
                </p>
                <button type="submit">login</button>
            </form>
        </main>
    );
}

// expose to the project
export {Login};