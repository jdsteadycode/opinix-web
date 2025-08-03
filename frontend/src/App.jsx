// grab modules
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { SecuredRoute } from "./components/SecuredRoute.jsx";
import { Header } from "./components/Header.jsx";
import { Footer } from "./components/Footer.jsx";
import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register.jsx";
import { CreatePoll } from "./pages/CreatePoll.jsx";
import './App.css';

// () -> App Component
function App() {

  // initial state array for authentication
  const [ isUser, setIsUser ] = useState(!!localStorage.getItem("token"));

  // () -> handle the changes like - logout
  function handleAuth(incomingStatus) {

    // update the state
    setIsUser(incomingStatus);
  }

  // return App's HTML
  return (
    <>
    <Router>
      <section className="container">
          <Header isUser={isUser} handleAuth={handleAuth} />
            <Routes>
              <Route path="/" element={
                <main className="app-content">
                    <h1>Hello</h1>
                    <p>text1</p>
                </main>
              } />
              <Route path="/login" element={<Login handleAuth={handleAuth} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/create-poll" element={
                <SecuredRoute pages={<CreatePoll />} />
              } />
          </Routes>
      </section>
     </Router>
     <Footer />
    </>
  )
}

// expose to project!
export default App;
