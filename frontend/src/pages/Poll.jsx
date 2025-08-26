// grab module(s)
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

// () -> Poll Component (single poll)
function Poll() {
    // grab the id?
    const { id } = useParams();

    // initial state array for loading-state*
    const [isLoading, setIsLoading] = useState(true);

    // initial state array for error*
    const [error, setError] = useState(null);

    // initial state array for poll-details*
    const [pollDetails, setPollDetails] = useState([]);

    // initial state array for selected-option(s)*
    const [selectedOptions, setSelectedOptions] = useState([]);

    // handle the API-call
    useEffect(function() {

        // () -> retrieves all Poll details1
        async function fetchPoll() {

            // safe*
            try{

                // try to get polls
                const pollsResponse = await fetch(`http://localhost:5000/api/poll/${id}`);

                // when no-response 
                if(!pollsResponse.ok) {

                    // throw error
                    throw new Error("Poll Fetch Request Failed!")
                }

                // get the data
                const pollDetails = await pollsResponse.json();

                // check log**
                console.log(pollDetails);

                // update the state*
                setPollDetails(prev => prev = pollDetails);
            }

            // handle run-time errors
            catch(error) {

                // log*
                console.log(error);

                // update the error-state
                setError(prev => prev = error);
            }

            // always
            finally {

                // update the state for loading
                setIsLoading(prev => prev = false);
            }
        }
        // initial invoke!
        fetchPoll();
    }, []);

    // handle selecting option
  const handleOptionChange = (optionId) => {
    if (pollDetails.poll_type === "single") {
      setSelectedOptions([optionId]);
    } else {
      // toggle for multi-choice
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  // dummy submit handler
  const handleVote = () => {
    console.log("User voted on:", selectedOptions);
    alert("Voting feature coming soon 🚀");
  };

  // returns jsx.
  return (
    <main className="app-content">
        {isLoading && <p>Loading polls...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <section className="poll-page">

            {/* Poll Card */}
            <div className="poll-card">
                
                {/* Poll's Title */}
                <h2>{pollDetails.title}</h2>

                {/* Poll's Description */}
                {pollDetails.description && (
                    <p className="desc">{pollDetails.description}</p>
                )}

                {/* Poll's details */}
                <div className="meta">
                    <span>By {pollDetails.username}</span>
                    <span>{pollDetails.category}</span>
                </div>

                {/* Poll's Tags */}
                {pollDetails.tags?.length > 0 && (
                    <div className="tags">
                    {pollDetails.tags.map((tag, idx) => (
                        <span key={idx} className="tag">
                        #{tag}
                        </span>
                    ))}
                    </div>
                )}

                {/* Poll's Options */}
                <form onSubmit={(e) => e.preventDefault()}>
                    {pollDetails.options?.map((opt) => (
                    <div key={opt.id} className="poll-option-wrap">
                        <input
                        type={pollDetails.poll_type === "single" ? "radio" : "checkbox"}
                        name="poll-options"
                        checked={selectedOptions.includes(opt.id)}
                        onChange={() => handleOptionChange(opt.id)}
                        />
                        <label>{opt.text}</label>

                        {/* show up Image if present! along side of option */}
                        {opt.media && opt.media.type === "Image" && (
                            <img
                                src={`http://localhost:5000${opt.media.url}`} 
                                alt={opt.text}
                                className="poll-option-media"
                                style={{ width: "100px", display: "block", marginTop: "8px" }}
                            />
                        )}

                        {/* show up Video if present along side of option */}
                        {opt.media && opt.media.type === "Video" && (
                            <video
                                controls
                                src={`http://localhost:5000${opt.media.url}`}
                                className="poll-option-media"
                                style={{ maxWidth: "300px", display: "block", marginTop: "8px" }}
                            />
                        )}
                    </div>
                    ))}
                    <button
                        className="create-btn"
                        type="button"
                    // onClick={handleVote}
                        disabled={selectedOptions.length === 0}
                    >
                    Submit Vote
                    </button>

                    {/* Expiration */}
                    {pollDetails.expires_at && (
                        <p className="expires">
                        Expires: {new Date(pollDetails.expires_at).toLocaleString()}
                        </p>
                    )}
                </form>
            </div>
      </section>
    </main>
  );
}

// expose to project!
export { Poll };
