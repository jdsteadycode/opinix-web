// grab modules.
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreatePoll() {
  // initial navigate
  const navigate = useNavigate();

  // intial state arrays...
  const [successMessage, setSuccessMessage] = useState("");
  const [uniqueId, setUniqueId] = useState(3);
  const [inputType, setInputType] = useState("text");
  const [pollOptions, setPollOptions] = useState([
    { id: 1, text: "", file: null, preview: null },
    { id: 2, text: "", file: null, preview: null },
  ]);
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState(null);
  const [errors, setErrors] = useState({});

  // initial state array for toast box style...
  const [toastStyle, setToastStyle] = useState("block");

  // () -> handle option text
  function handleOptionChange(value, id) {
    setPollOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, text: value } : opt))
    );
  }

  // () -> handle image upload
  function handleFileOptionChange(file, id) {
    const newErrors = { ...errors };
    if (file && !file.type.startsWith("image/")) {
      newErrors[`file${id}`] = "Only image files are allowed";
      // clear invalid file
      setPollOptions((prev) =>
        prev.map((opt) =>
          opt.id === id ? { ...opt, file: null, preview: null } : opt
        )
      );
      setErrors(newErrors);
      return;
    } else {
      // remove previous file error if any
      delete newErrors[`file${id}`];
    }

    // handle image preview
    const preview = file ? URL.createObjectURL(file) : null;
    setPollOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, file, preview } : opt))
    );
    setErrors(newErrors);
  }

  // () -> handle options addon
  function handleAddOption(e) {
    // restrict the reload
    e.preventDefault();

    // set maximum limit..
    if (pollOptions.length >= 5) return;

    // update the state
    setPollOptions((prev) => [
      ...prev,
      { id: uniqueId, text: "", file: null, preview: null },
    ]);
    setUniqueId((prev) => prev + 1);
  }

  // () -> handle option removal
  function handleRemoveOption(id) {
    setPollOptions((prev) => prev.filter((opt) => opt.id !== id));
  }

  // () -> handle input type change (date <-> text)
  function handleInputFocusTextChange() {
    // update the state.
    setInputType("datetime-local");
  }

  // () -> parsing the jwt token
  function parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }

  // () -> handle poll creation
  async function handlePollCreation(event) {
    // restrict the submission behavior
    event.preventDefault();

    // grab user's id
    const user_id = parseJwt(localStorage.getItem("token"))?.id;

    // initial form data
    const formData = new FormData();
    const title = event.target.title.value.trim();
    const description = event.target.description.value.trim();
    const category_name = event.target.category.value;
    const pollType =
      event.target.type.value === "Single Choice" ? "single" : "multi";
    const allow_comments = event.target["allow-comments"].value;
    const expires_at_raw = event.target.expiryDate.value;

    // initial errors
    const newErrors = {};

    // check fields
    if (!title) newErrors.title = "Title is required";
    if (!description) newErrors.description = "Description is required";
    if (!category_name) newErrors.category = "Category is required";
    if (!pollType) newErrors.type = "Poll type is required";
    if (!expires_at_raw) newErrors.expiry = "Expiry date is required";

    // check options..
    pollOptions.forEach((opt, index) => {
      if (!opt.text) newErrors[`option${index}`] = `Option ${index + 1} cannot be empty`;
      // also keep any file errors already set
      if (errors[`file${opt.id}`]) newErrors[`file${opt.id}`] = errors[`file${opt.id}`];
    });

    // update the state
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return; // stop if any errors





    // format expiry date for backend
    const d = new Date(expires_at_raw);
    const pad = (n) => String(n).padStart(2, "0");
    const expires_at = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    // append fields
    formData.append("title", title);
    formData.append("description", description);
    formData.append("user_id", user_id);
    formData.append("category_name", category_name);
    formData.append("poll_type", pollType);
    formData.append("allow_comments", allow_comments);
    formData.append("max_choices", pollOptions.length);
    formData.append("expires_at", expires_at);

    // set options
    pollOptions.forEach((opt, index) => {
      formData.append(`options[${index}][text]`, opt.text);
      if (opt.file) formData.append(`options[${index}][file]`, opt.file);
    });

    // set the poll-tags
    const tags = event.target.tags.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    tags.forEach((tag, idx) => formData.append(`tags[${idx}]`, tag));

    // plain options with text for moderation in poll!
    const plainOptions = pollOptions.map((option) => ({"text": option.text}));

    // try safely*
    try {

      // update the state
      setSuccessMessage("⏳ Checking poll content for safety...");

      // interact with moderation-api
      const moderationRes = await fetch("http://localhost:5000/api/poll/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          options: plainOptions,
          tags
        })
      });

      // grab ai response
      const moderationData = await moderationRes.json();

      const isUnsafe =
        !moderationRes.ok ||
        !moderationData.status ||
        moderationData.message?.toUpperCase() === "UNSAFE";

      // check response
      if (isUnsafe) {
        // update state
        setSuccessMessage("❌ Poll rejected: Unsafe content detected!");

        // update state after 3 seconds delay
        setTimeout(() => setSuccessMessage(""), 3000);

        // stop the execution here..
        return; 
      }

      // otherwise continue with poll creation...
      setSuccessMessage("✅ Content safe! Creating poll...");

     // make the request
      const res = await fetch("http://localhost:5000/api/poll/create", {
        method: "POST",
        body: formData,
      });

      // get parsed data
      const data = await res.json();

      // check log**
      console.log("✅ Poll created:", data);

      // update the state*
      setSuccessMessage("🎉 Poll created successfully!");

      // after 3 seconds update the state again. (clear the toast)
      setTimeout(() => {
        // update the state
        setSuccessMessage("");
        
        // route user to home route
        navigate("/");
      }, 3000);

      
    } catch (err) {
      console.error("❌ Error creating poll:", err);
    }
  }

  // returns jsx
  return (
    <main className="app-content">

      {/* toast */}
      {successMessage && (
        <div className="success-toast">
          {successMessage}
        </div>
      )}

      {/* create-poll-form */}
      <form className="create-poll-form" onSubmit={handlePollCreation}>
        {/* initial rule */}
        {toastStyle === "block" && (
          <section className="create-poll-warning" style={{display: toastStyle}}>
                    <i className="ri-close-line"
                        onClick={(e => setToastStyle("none"))}
                    >
                    </i>
                    <h2>WARNING</h2>   
                    <p>Your poll creation details will be verified by AI to check harmful content*</p>
                    <b>NOTE: AI can do mistakes, so please go through content before creating poll...</b> 
                </section>
        )}

        <h1>Get started</h1>

        <div className="input-box">
          <input name="title" type="text" placeholder=" " />
          <label>Title</label>
          {errors.title && <span className="error">{errors.title}</span>}
        </div>

        <div className="input-box">
          <textarea name="description" className="poll-description-text-area" placeholder=" " />
          <label>Description</label>
          {errors.description && <span className="error">{errors.description}</span>}
        </div>

        <div className="poll-option-box">
          {pollOptions.map((option, index) => (
            <div
              className="poll-option-wrap"
              key={option.id}
              onMouseEnter={() => setHoveredOptionIndex(option.id)}
              onMouseLeave={() => setHoveredOptionIndex(null)}
            >
              <div className="input-box">
                <input
                  className="option"
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  onChange={(e) => handleOptionChange(e.target.value, option.id)}
                />
                {errors[`option${index}`] && (
                  <span className="error">{errors[`option${index}`]}</span>
                )}
              </div>

              <input
                id={`file-${option.id}`}
                className="option"
                type="file"
                style={{ display: "none" }}
                accept="image/*"
                onChange={(e) => handleFileOptionChange(e.target.files[0], option.id)}
              />
              <label htmlFor={`file-${option.id}`} className="file-upload-icon">
                <i className="ri-upload-cloud-line"></i>
              </label>
              {errors[`file${option.id}`] && (
                <span className="error">{errors[`file${option.id}`]}</span>
              )}

              {option.preview && (
                <img
                  src={option.preview}
                  alt="preview"
                  style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover" }}
                />
              )}

              {pollOptions.length > 2 && hoveredOptionIndex === option.id && (
                <span onClick={() => handleRemoveOption(option.id)}>
                  <i className="ri-close-circle-line"></i>
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="new-poll-option">
          {pollOptions.length !== 5 && (
            <button className="new-poll-option-button" onClick={handleAddOption}>
              <i className="ri-add-circle-line"></i> Add option
            </button>
          )}
        </div>

        <div className="input-box">
          <select name="category">
            <option value="" hidden>Select Category?</option>
            <option value="Technology">Technology</option>
            <option value="Sports">Sports</option>
            <option value="Entertainment">Entertainment</option>
            <option value="General Knowledge">General Knowledge</option>
          </select>
          {errors.category && <span className="error">{errors.category}</span>}
        </div>

        <div className="input-box">
          <select name="type">
            <option value="" hidden>Select Type?</option>
            <option value="Single Choice">Single Choice</option>
            <option value="Multi Choice">Multi Choice</option>
          </select>
          {errors.type && <span className="error">{errors.type}</span>}
        </div>

        <div className="input-box">
          <input
              name="expiryDate"
              type={inputType}
              placeholder="Expiry Date ? "
              onFocus={handleInputFocusTextChange}
              min={(() => {
                const now = new Date();
                const pad = (n) => String(n).padStart(2, "0");
                return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
                  now.getDate()
                )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
              })()}
              max={(() => {
                const now = new Date();
                const endOfMonth = new Date(
                  now.getFullYear(),
                  now.getMonth() + 1,
                  0,
                  23,
                  59
                );
                const pad = (n) => String(n).padStart(2, "0");
                return `${endOfMonth.getFullYear()}-${pad(
                  endOfMonth.getMonth() + 1
                )}-${pad(endOfMonth.getDate())}T${pad(
                  endOfMonth.getHours()
                )}:${pad(endOfMonth.getMinutes())}`;
              })()}
            />
            {errors.expiry && <span className="error">{errors.expiry}</span>}
        </div>


        <div className="input-box">
          <input name="tags" type="text" placeholder="Tags (tech, fun, etc…)" />
        </div>

        <div className="poll-comments">
          <label>Allow comments</label>
          <input type="radio" name="allow-comments" value={1} /> Yes
          <input type="radio" name="allow-comments" value={0} /> No
        </div>

        <button className="create-btn" type="submit">
          Create!
        </button>
      </form>
    </main>
  );
}

export { CreatePoll };
