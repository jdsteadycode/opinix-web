// grab module(s)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


// () -> Registeration Module
function Register() {

    // initial state array
    const [inputType, setInputType] = useState("text");

    // initial navigation
    const navigate = useNavigate();

    // initial state-array for registration data
    const [userData, setUserData] = useState({
        "email": "",
        "username": "",
        "phone": "",
        "password": "",
        "confirmPassword": "",
        "birthdate": "",
    });

    // () -> handle the input type when focused!
    function handleInputFocusTextChange(event) {
        // check log**
        // console.log(inputType);

        // update the input's type!
        setInputType("date");
    }

    // () -> track the form data changes
    function handleFormData(event) {

        // a new copy of fregistration data
        let data = { ...userData };

        // set the data
        data[event.target.name] = event.target.value;

        // update the state
        setUserData(data);
    }

    // () -> handle user registration
    async function handleRegistration(event) {

        // restrict re-render
        event.preventDefault();

        // try to register the new user
        try {
            // response from the server
            let response = await fetch(`http://localhost:5000/api/auth/register`, {
                "method": "POST",
                "headers": {"Content-Type": "application/json"},
                "body": JSON.stringify(userData)
            });

            // parse the response from json
            let data = await response.json();

            // check log**
            console.log(data);

           // check if user is created
            if(data.status) {

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
            <form className="auth-form" onSubmit={handleRegistration}>
                <h1>Welcome folk!</h1>
                <input type="text" name="email" placeholder="Your Email?" onChange={handleFormData} />
                <input type="text" name="username" placeholder="Your username?" onChange={handleFormData} />
                <input type="text" name="phone" placeholder="Your phone-number?" onChange={handleFormData} />
                <input type="password" name="password" placeholder="Your password?" onChange={handleFormData} />
                <input type="password" name="confirmPassword" placeholder="Confrim password?" onChange={handleFormData} /> 
                <input 
                    type={inputType}
                    name="birthdate"
                    placeholder="Your DOB?" 
                    onChange={handleFormData}
                    onFocus={handleInputFocusTextChange} />
                <p className="auth-register">
                    I have one!
                    <Link to="/login">
                        <span> login here</span>
                    </Link>
                </p>
                <button type="submit">register</button>
            </form>
        </main>
    );
}

// expose to project!
export {Register};