// grab module(s)
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

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

    // initial state array for menu..
    const [showMenu, setShowMenu] = useState(false);

    // initial state array for toast box style...
    const [toastStyle, setToastStyle] = useState("block");

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDetails, setReportDetails] = useState("");
    const [isReporting, setIsReporting] = useState(false);

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

                console.log("Response from canVote/? ", data);

                // update the state**
                setCanVote(data?.status);

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

  // handle vote submission..
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


  // () -> handle report the poll..
   const submitReport = async () => {
    if (!reportReason) {
      alert("Please select a reason before submitting!");
      return;
    }

    try {
      setIsReporting(true);
      const response = await fetch(`http://localhost:5000/api/poll/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollId: pollDetails.id,
          userId: user_id,
          reason: reportReason,
          details: reportDetails,
        }),
      });

      const data = await response.json();
      console.log("Report submitted:", data);
      alert("Report submitted successfully!");
      setShowReportModal(false);
      setReportReason("");
      setReportDetails("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit report!");
    } finally {
      setIsReporting(false);
    }
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
                
                {/* toast */}
                {user_id == null 
                    &&
                 <section className="cannot-vote" style={{display: toastStyle}}>
                    <i className="ri-close-line"
                        onClick={(e => setToastStyle("none"))}
                    >
                    </i>
                    <h2>Please Login before, Voting!</h2>   
                    <p>It seems like you aren't authenticated yet... 
                            <Link to={`/login`}>
                               <span style={{"textDecoration": "none"}}> here</span> 
                            </Link>    
                    </p> 
                </section>}
                {canVote === false && 
                <section className="cannot-vote" style={{display: toastStyle}}>
                    <i className="ri-close-line"
                        onClick={(e => setToastStyle("none"))}
                    >
                    </i>
                    <h2>You've already voted</h2>   
                    <p>So, please check the results of your vote   
                            <Link to={`/poll-result/${pollDetails.id}`}>
                               <span style={{"textDecoration": "none"}}> here</span> 
                            </Link>    
                    </p> 
                </section>}

                {/* poll menu */}
                <div className="poll-menu">
                    <button
                    className="menu-btn"
                    onClick={() => setShowMenu((prev) => !prev)}
                    >
                    ⋮
                    </button>
                    {showMenu && (
                    <ul className="menu-dropdown">
                        <li onClick={() => setShowReportModal(true)}>🚩 Report this Poll</li>
                    </ul>
                    )}
                </div>
                
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
                    <div key={opt.id} className="radio-item">
                        <input
                            type={pollDetails.poll_type === "single" ? "radio" : "checkbox"}
                            name="poll-options"
                            onChange={() => handleOptionChange(opt.id)}
                            checked={selectedOptions.includes(opt.id)}
                            id={`opt-${opt.id}`}
                        />
                        <label htmlFor={`opt-${opt.id}`}>{opt.text}</label>
                        {opt.media && opt.media.type === "Image" && (
                            <img
                            src={`http://localhost:5000${opt.media.url}`}
                            alt={opt.text}
                            className="poll-option-media"
                            />
                        )}
                        </div>
                    ))}
                    <button
                        className="create-btn"
                        type="button"
                        onClick={handleVote}
                        disabled={user_id == null || canVote === false || selectedOptions.length == 0 || isVoting}
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

      {/* Report Modal */}
      {showReportModal && (
        <div className="profile-overlay">
          <div className="profile-modal">
            <h2 style={{color: "#fff"}}>🚩 Report this Poll</h2>

            <label>Reason</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="">Select Reason</option>
              <option value="Spam">Spam</option>
              <option value="Inappropriate Content">Inappropriate Content</option>
              <option value="Misinformation">Misinformation</option>
              <option value="Other">Other</option>
            </select>

            <label>Additional Details (optional)</label>
            <textarea
              rows="3"
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Provide more details if necessary..."
            ></textarea>

            <div className="modal-actions">
              <button
                style={{
                    backgroundColor: "#D94446"
                }}
                className="save-btn"
                onClick={submitReport}
                disabled={isReporting}
              >
                {isReporting ? "Reporting..." : "Report"}
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowReportModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// expose to project!
export { Poll };
