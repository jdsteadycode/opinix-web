// grab module(s)
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// () -> CreatePoll component
function CreatePoll() {

    // initial state array for `unique-id` in options*
    const [uniqueId, setUniqueId] = useState(3);

    // initial state array for input-date
    const [inputType, setInputType] = useState("text");
    
    // intitial pollOptions state array
    // minimum 2 options**
    const [pollOptions, setPollOptions] = useState([
        {"id": 1, text: "", file: null },
        {"id": 2, text: "", file: null }
    ]);  

    // initial state array
    const [hoveredOptionIndex, setHoveredOptionIndex] = useState(null);

    // initial array state**
    const [errors, setErrors] = useState({});
    
    // check log**
    // console.log(useState(["", ""]));

    // () -> handle option index change
    function handleOptionChange(value, id) {
        // check log**
        console.log(value);
        console.log(id);

        // update the state
        setPollOptions(prev =>
            prev.map(opt => (opt.id === id ? { ...opt, text: value } : opt))
        );
    }

    // () -> handle file option change
    function handleFileOptionChange(file, id) {
        // check log**
        console.log(file);
        console.log(id);

        // update the state
        setPollOptions(prev =>
            prev.map(opt => (opt.id === id ? { ...opt, file } : opt))
        );
    }

    // () -> add new option(s)
    function handleAddOption(event) {

        // restrict the reload!
        event.preventDefault();

        // when polls reached maximum limit? 6!
        if(pollOptions.length >= 5) {
            return "";
        }

        // a new copy of poll-options
        let newArray = pollOptions.slice(0);

        // get the new id
        const newId = uniqueId;

        // update the state*
        setUniqueId(prev => prev + 1);

        // add a new option!
        newArray.push({"id": newId, "text": "", "file": null});

        // update the options with new-one
        setPollOptions(newArray);
    }

    // () -> handle option delete 
    function handleRemoveOption(id) {

        // check log**
        // console.log(index);

        // a copy of array except the item at index?
        let pollOptionsCopy = pollOptions.filter(function(option, i, pollOptions) {
            return option.id !== id;
        });

        // update the state/ poll-options
        setPollOptions(pollOptionsCopy);

        console.log(pollOptions);
    }

    // () -> handle input type's change when focused
    function handleInputFocusTextChange(event) {
        // check log**
        // console.log(event.target.type);

        // update the state (type of the focused input?)
        setInputType("datetime-local"); 
    }

    // () -> extract the user from jwt
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1]; 
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(atob(base64));
        } catch (err) {
            console.error("Invalid token", err);
            return null;
        }
    }

    // handle file + preview
    function handleFileOptionChange(file, id) {
        const preview = file ? URL.createObjectURL(file) : null;
        setPollOptions((prev) =>
        prev.map((opt) => (opt.id === id ? { ...opt, file, preview } : opt))
        );
    }

    // () -> handle form submission
    async function handlePollCreation(event) {
        // restrict default behavior*
        event.preventDefault();

        // grab the token?
        const user_id = parseJwt(localStorage.getItem("token"))?.id;
        console.log(user_id);
        // initial form-data
        let formData = new FormData();

        // grab values from form inputs
        let title = event.target.title.value;
        let description = event.target.description.value;
        let category_name = event.target.category.value;
        let pollType = event.target.type.value === "Single Choice" ? "single" : "multi";
        let allow_comments = event.target["allow-comments"].value;
        let max_choices = pollOptions.length;
        let expires_at = event.target.expiryDate.value; 

         // Basic validation
        const newErrors = {};
        if (!title) newErrors.title = "Title is required";
        if (!description) newErrors.description = "Description is required";
        if (!category_name || category_name === "Select Type?") newErrors.category = "Category required";
        if (!pollType || pollType === "Select Type?") newErrors.type = "Poll type required";
        if (!expires_at) newErrors.expiry = "Expiry date required";
        pollOptions.forEach((opt, index) => {
        if (!opt.text) newErrors[`option${index}`] = `Option ${index + 1} cannot be empty`;
        });

        // update the errors state**
        setErrors(newErrors);
        if (Object.keys(newErrors).length) return;

        // check for expiry-date
        if (expires_at) {
        // Convert input (yyyy-mm-dd) to proper datetime string
        const date = new Date(expires_at);

        // Format to MySQL DATETIME
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const mi = String(date.getMinutes()).padStart(2, "0");
        const ss = String(date.getSeconds()).padStart(2, "0");
        
        // save the formatted-date
        expires_at = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
        }

        // append base fields
        formData.append("title", title);
        formData.append("description", description);
        formData.append("user_id", user_id);
        formData.append("category_name", category_name);
        formData.append("poll_type", pollType);
        formData.append("allow_comments", allow_comments);
        formData.append("max_choices", max_choices);
        formData.append("expires_at", expires_at);

        // append options
        pollOptions.forEach((opt, index) => {
            formData.append(`options[${index}][text]`, opt.text);
            if (opt.file) {
                formData.append(`options[${index}][file]`, opt.file);
            }
        });

        // append tags (split by commas for now)
        const tags = event.target.tags.value.split(",").map(tag => tag.trim());
        tags.forEach((tag, index) => {
            if (tag) {
                formData.append(`tags[${index}]`, tag);
            }
        });

        // check log**
        console.log(...formData);

        // safe 
        try {
            const res = await fetch("http://localhost:5000/api/poll/create", {
                method: "POST",
                body: formData,
            });

            // grab the response
            const data = await res.json();
            console.log("✅ Poll created:", data);

            // navigate to main-home page...
            navigate("/");

            // reset the form*
            formData = new FormData();

            // update the options state**
            setPollOptions([
                { id: 1, text: "", file: null },
                { id: 2, text: "", file: null }
            ]);
        } 
        // handle run-time issues
        catch (err) {
            // throw error
            console.error("❌ Error creating poll:", err);
        } 
    }

    // return jsx!
    return(
        <main className="app-content">
            <form className="create-poll-form" onSubmit={handlePollCreation}>
                <h1>Get started</h1>

                <div className="input-box">
                    <input name="title" type="text" required />
                    <label>Title</label>
                    {errors.title && <span className="error">{errors.title}</span>}
                </div>

                <div className="input-box">
                    <textarea name="description" className="poll-description-text-area" required />
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
                                {errors[`option${index}`] && <span className="error">{errors[`option${index}`]}</span>}
                            </div>

                            <input
                                id={`file-${option.id}`}
                                className="option"
                                type="file"
                                style={{ display: "none" }}
                                accept="image/*, video/*"
                                onChange={(e) => handleFileOptionChange(e.target.files[0], option.id)}
                            />
                            <label htmlFor={`file-${option.id}`} className="file-upload-icon">
                                <i className="ri-upload-cloud-line"></i>
                            </label>

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
                    <select name="category" required>
                        <option value="" hidden>Select Category?</option>
                        <option value="Technology">Technology</option>
                        <option value="Sports">Sports</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="General Knowledge">General Knowledge</option>
                    </select>
                    {errors.category && <span className="error">{errors.category}</span>}
                </div>

                <div className="input-box">
                    <select name="type" required>
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
                        required
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

                <button className="create-btn" type="submit">Create!</button>
            </form>
        </main>

    );
}

// expose to project!
export {CreatePoll};