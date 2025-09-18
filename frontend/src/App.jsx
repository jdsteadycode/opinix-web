// grab modules
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { SecuredRoute } from "./components/SecuredRoute.jsx";
import { Header } from "./components/Header.jsx";
import { Footer } from "./components/Footer.jsx";
import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register.jsx";
import { CreatePoll } from "./pages/CreatePoll.jsx";
import { Profile } from "./pages/Profile.jsx";
import { Polls } from "./pages/Polls.jsx";
import { Poll } from "./pages/Poll.jsx";
import { PollResult } from "./pages/PollResult.jsx";
import './App.css';

// () -> App Component
function App() {

  // initial state array for authentication
  const [isUser, setIsUser] = useState(!!localStorage.getItem("token"));
  const [id, setId] = useState(null);

  // () -> handle the incoming changes logout/ un-set or set id!
  function handleAuth(incomingStatus) {

    // update the state
    setIsUser(incomingStatus);
  }
  function handleId(incomingId) {

    // update the state
    setId(incomingId);

    // check log**
    console.log(id);
  }

  // check log**
  console.log(id);

  // return App's HTML
  return (
    <>
      <Router>
        <section className="container">
          <Header isUser={isUser} handleAuth={handleAuth} handleId={handleId} />
          <Routes>
            <Route path="/" element={<Polls />} />
            <Route path="/poll/:id" element={<Poll user_id={id} />}
            />
            <Route path="/poll-result/:id" element={<PollResult />}
            />
            <Route path="/login" element={<Login handleAuth={handleAuth} handleId={handleId} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create-poll" element={
              <SecuredRoute pages={<CreatePoll />} />
            } />
            <Route path="/profile" element={
              <SecuredRoute pages={<Profile />} />
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
