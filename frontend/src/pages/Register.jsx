import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  // initial user data — includes all backend fields
  const [userData, setUserData] = useState({
    email: "",
    username: "",
    nickname: "",
    bio: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    birthdate: "",
    role: "user", // default role
    profileImage: null,
  });

  const [error, setError] = useState(null);

  // handle input changes
  function handleFormData(e) {
    const { name, type, value, files } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  }

  // handle form submit
  async function handleRegistration(e) {
    e.preventDefault();

    // client-side validations
    if (
      !userData.email ||
      !userData.username ||
      !userData.phone ||
      !userData.password ||
      !userData.confirmPassword
    ) {
      return setError("All required fields must be filled*");
    }

    if (!/\S+@\S+\.\S+/.test(userData.email)) {
      return setError("Enter a valid email address");
    }

    if (isNaN(userData.phone) || userData.phone.length !== 10) {
      return setError("Phone number must be a valid 10-digit number");
    }

    if (userData.password !== userData.confirmPassword) {
      return setError("Entered passwords do not match");
    }

    try {
      // create formData (important for file upload)
      const formData = new FormData();
      Object.entries(userData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Server:", data);

      // check backend status
      if (data.status) {
        setError(null);
        navigate("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again later.");
    }
  }

  // return jsx..
  return (
    <main className="app-auth-content">
      
      {/* form section */}
      <form
        className="auth-form"
        encType="multipart/form-data"
        onSubmit={handleRegistration}
      >

        {/* error toast  */}
         {error && <p style={{ color: "crimson", marginBlock: "10px"  }}>{error}</p>}

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
    </main>
  );
}

export { Register };
