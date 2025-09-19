// grab utilities
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../App.css";

// () -> Header Component
function Header({ isUser, handleAuth, handleId }) {

    // initial state array
    const [height, setHeight] = useState("0");

    // for navigation
    const navigate = useNavigate();

    // () -> authentication of user
    function handleLogout() {
        
        // dismantle the token
        localStorage.removeItem("token");

        // notify App
        // update state via prop-function
        handleAuth(false);
        handleId(null);

        // navigate to `/login`
        navigate("/login");
    }

    // check log**
    console.log(isUser);

    // retun header's jsx
    return(
        <header className="app-header">
            
            {/* <!-- logo-icon --> */}
            <img src="/opinix-logo-white-text.png" alt="opinix.png" />

            {/* <!-- navigation section --> */}
            <nav>
                <ul>
                    <li>
                        <i className="ri-chat-poll-line"></i>
                        <Link to="/polls">
                            polls
                        </Link>
                    </li>
                    <li>
                        <i className="ri-sticky-note-add-line"></i>
                        <Link to="/create-poll">
                            create poll
                        </Link>
                    </li>
                    <li>
                        <i className="ri-user-line"></i>
                        <Link to="/profile">  
                            profile
                        </Link>
                    </li>
                    
                </ul>
            </nav>

            {/* <!-- authentication-section --> */}
            <div className="auth-btn">
                {isUser
                    ?
                    <button onClick={handleLogout}>logout</button>
                    :
                    <Link to="/login">
                        <button>login</button>
                    </Link>
                }
            </div>
            {/* <!-- open-menu-icon --> */}
             <button 
                className="open-menu-btn"
                onClick={() => setHeight("100%")}
             >
                &#9776;
             </button>

             {/* responsive-screens */}
             {/* <!-- tablet-mobile device menu content --> */}
             <div className="responsive-content-menu" style={{"height": height}}>
                {/* <!-- close-menu-btn --> */}
                 <button 
                    className="close-menu-btn"
                    onClick={() => setHeight("0")}
                 >
                    &times;
                 </button>
                {/* <!-- navigation section --> */}
                <nav className="menu-nav">
                    <ul>
                        <li>
                            <Link to="/polls">
                                <i className="ri-chat-poll-line"></i>
                                polls
                            </Link>
                        </li>
                        <li>
                            <Link to="/create-poll">
                                <i className="ri-sticky-note-add-line"></i> 
                                create poll
                            </Link>
                        </li>
                        <li>
                            <Link to="/profile">
                                <i className="ri-user-line"></i>
                                profile
                            </Link>
                        </li>
                        
                    </ul>
                </nav>

                {/* <!-- authentication-section --> */}
                <div className="menu-auth-btn">
                    {isUser ? 
                        <button onClick={handleLogout}>logout</button>
                        :
                        <Link to="/login">
                            <button>log-in</button>
                        </Link>
                    }
                </div>
             </div>
        </header>
    );
}

// expose to the project
export {Header};