// grab modules
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header.jsx";
import { Footer } from "./components/Footer.jsx";
import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register.jsx";
import { CreatePoll } from "./pages/CreatePoll.jsx";
import './App.css';

// () -> App Component
function App() {

  // return App's HTML
  return (
    <>
    <Router>
      <section className="container">
          <Header />
            <Routes>
              <Route path="/" element={
                <main className="app-content">
                    <h1>Hello</h1>
                    <p>text1</p>
                </main>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/create-poll" element={<CreatePoll />} />
          </Routes>
      </section>
     </Router>
     <Footer />
    </>
  )
}

// expose to project!
export default App;
