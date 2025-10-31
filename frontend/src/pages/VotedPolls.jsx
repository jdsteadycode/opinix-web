// grab modules..
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// () -> Voted Poll Modal Component..
function VotedPollModal({ userId, poll, onClose, onRevokeSuccess }) {

  // handle navigation..
  const navigate = useNavigate();

  // () -> handle poll revoke
  async function handleRevoke(event) {

    // make an api call for revoking!
    const res = await fetch("http://localhost:5000/api/vote/revoke-vote/", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId: poll.pollId, userId: userId }),
    });

    // get the api response..
    const data = await res.json();

    // when successful deletion..
    if (data.status) {
      onRevokeSuccess();
      // redirect the user..
      navigate("/polls");
    } 
    // otherwise, error
    else {
      console.log(data);
    }
  }

  // return jsx..
  return (
    <div className="voted-modal-overlay">
      <div className="voted-modal">
        <h2>❗️ WARNING ❗️</h2>
        <p>
         Are you sure you want to revoke your vote from{" "}
          <strong>{poll.title}</strong>
        </p>
        <div className="modal-actions">
          <button className="revoke-btn" onClick={handleRevoke}>
            Revoke Vote
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// () -> VotedPolls Component..
function VotedPolls() {
  // grab the incoming id?
  const { uId } = useParams();

  // initial state array for voted-polls
  const [votedPolls, setVotedPolls] = useState(null);

  // initial state array for loading..
  const [loading, setLoading] = useState(true);

  // initial state array for error..
  const [error, setError] = useState(null);

  // initial state array for selected-poll..
  const [selectedPoll, setSelectedPoll] = useState(null);

  // when no voted-polls are available?
  if (votedPolls == null) {
    // make an api-call
    fetch(`http://localhost:5000/api/poll/voted/${uId}`)
      .then((response) => response.json())
      .then((data) => {
        // update state(s)*
        setLoading(false);
        setVotedPolls(data);
      })
      .catch((error) => {
        // update state(s)*
        setLoading(false);
        setError("Failed to fetch voted polls!");
      });
  }

  // when loading..
  if (loading) {
    // return the jsx.
    return (
      <main className="app-content">
        <h1>Loading your voted-polls..</h1>
      </main>
    );
  }

  // when error
  if (error) {
    // return jsx..
    return (
      <main className="app-content">
        <h1>{error}</h1>
      </main>
    );
  }

  // when no voted polls are left?
  if (votedPolls.length == 0) {
    return (
      <main className="app-content">
        <h1>Seems like you didn't have voted on any poll yet..</h1>
      </main>
    );
  }

  // return jsx..
  return (
    <>
      <main className="voted-polls-page">
        <h1>Here are the polls you voted on!</h1>

        {/* polls-list */}
        <div className="poll-list">
          {votedPolls.map((p) => (
            <div
              key={p.id}
              className="poll-card"
              onClick={() => setSelectedPoll(p)}
            >
              <div className="poll-title">{p.title}</div>
              <div className="voted-options">
                {p.selectedOptions.map((opt) => (
                  <span 
                     key={opt.id}
                     className="voted-option-tag">
                    {opt.text}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Voted Poll Modal */}
        {selectedPoll && (
          <VotedPollModal
            poll={selectedPoll}
            userId={uId}
            onClose={(e) => setSelectedPoll(null)}
            onRevokeSuccess={(e) => {
              setSelectedPoll(null);
              setVotedPolls((prev) =>
                prev.filter((x) => x.id !== selectedPoll.id)
              );
            }}
          />
        )}
      </main>
    </>
  );
}

// expose to project!
export { VotedPolls };
