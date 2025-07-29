// grab module(s)
import { useState } from "react";
import { Link } from "react-router-dom";


// () -> Registeration Module
function Register() {

    // initial state array
    const [inputType, setInputType] = useState("text");

    // () -> handle the input type when focused!
    function handleInputFocusTextChange(event) {
        // check log**
        // console.log(inputType);

        // update the input's type!
        setInputType("date");
    }

    // return jsx!
    return(
         <main className="app-auth-content">
            <form className="auth-form">
                <h1>Welcome folk!</h1>
                <input type="text" placeholder="Your Email?" />
                <input type="text" placeholder="Your username?" />
                <input type="text" placeholder="Your phone-number?" />
                <input type="password" placeholder="Your password?" />
                <input type="password" placeholder="Confrim password?" /> 
                <input 
                    type={inputType}
                    placeholder="Your DOB?" 
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