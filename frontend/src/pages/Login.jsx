// grab module(s)
import { Link } from "react-router-dom";

// () -> Login Component
function Login() {

    // retun login's jsx
    return(
        <main className="app-auth-content">
            <form className="auth-form">
                <h1>Hi there</h1>
                <input type="text" placeholder="Enter username or Email?" />
                <input type="password" placeholder="Enter password?" />
                <p className="auth-register">
                    Are you new?
                    <Link to="/register">
                        <span>register here</span>
                    </Link>
                </p>
                <button type="submit">login</button>
            </form>
        </main>
    );
}

// expose to the project
export {Login};