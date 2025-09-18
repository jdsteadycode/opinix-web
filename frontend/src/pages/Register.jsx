// grab module(s)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


// () -> Registeration Module
function Register() {

    // initial state array
    // const [inputType, setInputType] = useState("text");

    // initial navigation
    const navigate = useNavigate();

    // initial state-array for registration data
    const [userData, setUserData] = useState({
        "email": "",
        "username": "",
        "phone": "",
        "password": "",
        "confirmPassword": "",
        // "birthdate": "",
        "profileImage": null,
    });

    // initial state array for error
    const [error, setError] = useState(null);

    // () -> handle the input type when focused!
    // function handleInputFocusTextChange(event) {
    //     // check log**
    //     // console.log(inputType);

    //     // update the input's type!
    //     setInputType("date");
    // }

    // () -> track the form data changes
    function handleFormData(event) {

        // a new copy of fregistration data
        let data = { ...userData };

        // set the data accordingly..
        if (event.target.type === "file") {
            data[event.target.name] = event.target.files[0];
        } else {
            data[event.target.name] = event.target.value;
        }

        // update the state
        setUserData(data);
    }

    // () -> handle user registration
    async function handleRegistration(event) {
        // restrict re-render
        event.preventDefault();

        // check inputs*
        if(userData.email === "" || userData.username === "" || userData.phone === "" || userData.password === "" || userData.confirmPassword === "") {

            // update the state**
            return setError("All details are required*");
        }

        // check for email
        else if(!/\S+@\S+\.\S+/.test(userData.email)) {

            // update the state*
            return setError("Enter a valid E-mail please..");
        }

        // check for phone number!
        else if(isNaN((userData.phone))) {

            // update the state*
            return setError("Phone number should be a valid number!");
        }
        else if(userData.phone.length !== 10) {

            // update the state*
            return setError("Phone number must be of exact 10 digits")
        }

        // verify the both passwords!
        else if(userData.password !== userData.confirmPassword) {

            // update the state**
            return setError("Entered passwords didn't appear to be same!");
        }


        // try to register the new user
        try {

            // set the input as formData because of file!
            let formData = new FormData();
            Object.keys(userData).forEach(key => {
                // each data should be accordingly set within key!
                formData.append(key, userData[key]);
            });

            // response from the server
            let response = await fetch(`http://localhost:5000/api/auth/register`, {
                "method": "POST",
                "body": formData,
            });

            // parse the response from json
            let data = await response.json();

            // check log**
            console.log(data);

            
           // check if user is created
            if(data.status) {

                // update the state*
                setError(null);

                // navigate the user to `/login`
                navigate("/login")
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

    // return jsx!
    return(
         <main className="app-auth-content">
            <form
                className="auth-form"
                encType="multipart/form-data"
                onSubmit={handleRegistration}
            >
                <h1>Welcome folk!</h1>

                <div className="input-box">
                <input
                    type="text"
                    name="email"
                    required
                    onChange={handleFormData}
                />
                <label>Email</label>
                </div>

                <div className="input-box">
                <input
                    type="text"
                    name="username"
                    required
                    onChange={handleFormData}
                />
                <label>Username</label>
                </div>

                <div className="input-box">
                <input
                    type="text"
                    name="phone"
                    required
                    onChange={handleFormData}
                />
                <label>Phone Number</label>
                </div>

                <div className="input-box">
                <input
                    type="password"
                    name="password"
                    required
                    onChange={handleFormData}
                />
                <label>Password</label>
                </div>

                <div className="input-box">
                <input
                    type="password"
                    name="confirmPassword"
                    required
                    onChange={handleFormData}
                />
                <label>Confirm Password</label>
                </div>

                <input
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleFormData}
                />

                <p className="auth-register">
                I have one!
                <Link to="/login">
                    <span> login here</span>
                </Link>
                </p>

                <button type="submit">register</button>
            </form>

            {/* Error */}
            {error && <p style={{ color: "crimson" }}>{error}</p>}
            </main>
    );
}

// expose to project!
export {Register};