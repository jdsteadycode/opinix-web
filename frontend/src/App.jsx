// grab modules
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { SecuredRoute } from "./components/SecuredRoute.jsx";
import { Header } from "./components/Header.jsx";
import { Footer } from "./components/Footer.jsx";
import { Login } from "./pages/Login.jsx";
import { Home } from "./pages/Home.jsx";
import { Register } from "./pages/Register.jsx";
import { CreatePoll } from "./pages/CreatePoll.jsx";
import { Profile } from "./pages/Profile.jsx";
import { Polls } from "./pages/Polls.jsx";
import { Poll } from "./pages/Poll.jsx";
import { PollResult } from "./pages/PollResult.jsx";
import { VotedPolls } from "./pages/VotedPolls.jsx";
import  { CreateAdmin } from "./pages/CreateAdmin.jsx";
import { Admin } from "./pages/Admin.jsx";
import './App.css';

// () -> App Component
function App() {

  // initial state array for authentication
  const [isUser, setIsUser] = useState(!!localStorage.getItem("token"));
  const [id, setId] = useState(localStorage.getItem("uId"));

  // () -> handle the incoming changes logout/ un-set or set id!
  function handleAuth(incomingStatus) {

    // update the state
    setIsUser(incomingStatus);
  }
  function handleId(incomingId) {

    // update the state
    setId(incomingId);

    // check log**
    // console.log(id);
  }

  // check log**
  console.log("u id", id);

  // return App's HTML
  return (
    <>
      <Router>
        <section className="container">
          <Header isUser={isUser} handleAuth={handleAuth} handleId={handleId} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/polls" element={<Polls user_id={id} />} />
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
            <Route
              path="/admin"
              element={
                <SecuredRoute 
                  roleRequired={"admin"}
                  pages={<Admin />}
                />
              }
            />
            <Route 
              path="/voted-polls/:uId"
              element={
                <SecuredRoute
                  pages={<VotedPolls />}
                />
              }
            />
          </Routes>
        </section>
      </Router>
      <Footer />
    </>
  )
}

// expose to project!
export default App;
