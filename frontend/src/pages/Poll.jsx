// grab module(s)
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

// () -> Poll Component (single poll)
function Poll({ user_id }) {

    // check log**
    console.log(`user's id: ${user_id}`);

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

    // initial state array for voting-status**
    const [canVote, setCanVote] = useState(true);

    // initial state array for voting.
    const [isVoting, setIsVoting] = useState(false);

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
                    throw new Error("Poll Fetch Request Failed!");
                }

                // get the data
                const pollDetails = await pollsResponse.json();

                // check log**
                console.log(pollDetails);

                // update the state*
                setPollDetails(prev => prev = pollDetails);

                // verify for the further voting!
                const response = await checkVoted(pollDetails.id);

                // check log**
                console.log(response);

                // update the state
                setCanVote(prev => prev = response.status);
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

        // () -> verifies user past votings (castings)**
        async function checkVoted(poll_id) {

            // safe**
            try{

                // try to make the request!
                const pastResponse = await fetch(`http://localhost:5000/api/vote/check`, {
                    "method": "POST",
                    "headers": {
                        "Content-Type": "application/json",
                    },
                    "body": JSON.stringify({
                        "userId": user_id,
                        "pollId": poll_id
                    }),
                });

                // get the data
                const data = await pastResponse.json();

                // return the status
                return data;
            }

            // handle run-time events
            catch(error) {

                // throw error
                console.error(error);
            }
        }

         // invoke the function(s)
        fetchPoll();      

    }, [id, user_id]);


    // handle selecting option
  const handleOptionChange = (optionId) => {

    // for single
    if (pollDetails.poll_type === "single") {
        
        // update the state**
        setSelectedOptions(prev => prev = [optionId]);
    } 
    // when multiple-polls `checkbox`
    else {
      // update the state for multi-choice**
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    }

    // check log**
    console.log(selectedOptions);
  };

  // dummy submit handler
  const handleVote = () => {

    // check log**
    console.log(`User of id ${user_id} casted for poll id ${pollDetails?.id} and for option(s): ${selectedOptions}`);
    
    // () -> handles vote on the poll!
    async function castTheVote(uid, pid, opts) {

        // safe**
        try {
            // update the state*
            setIsVoting(true);

            // handle the api-request!
            const voteRequest = await fetch(`http://localhost:5000/api/vote/${pid}/cast`, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json",
                },
                "body": JSON.stringify({
                    "selectedOptions": [...opts],
                    "userId": uid
                }),
            });

            // handle the incoming response
            const voteResponse = await voteRequest.json();

            // check log**
            console.log(voteResponse);

            // update the state
            setCanVote(false);
        }

        // handle run-time errors
        catch(error) {

            // throw error
            console.error(error);

            // update the state
            setError(error);
        }

        // at last
        finally {

            // update the state back!
            setIsVoting(false);
        }
    }

    // try to vote!
    castTheVote(user_id, pollDetails?.id, selectedOptions);
  };

  // returns jsx.
  return (
    <main className="app-content">
        {/* show error toasts */}
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
                            onChange={() => handleOptionChange(opt.id)}
                            checked={selectedOptions.includes(opt.id)}
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
                        onClick={handleVote}
                        disabled={canVote === false || selectedOptions.length == 0 || isVoting}
                    >
                    {isVoting ? "Submitting..." : "Submit"}
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
