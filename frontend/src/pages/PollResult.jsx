// grab module(s)
import { useState, useEffect } from "react";
import {Link}  from "react-router-dom";
import { useParams } from "react-router-dom";

// () -> PollResult Component (single poll)
function PollResult() {

    // grab the poll's id?
    const { id } = useParams();

    // initial state array*
    const [pollResult, setPollResult] = useState(null);
    
    // check if pollResult is null?
    if (!pollResult) {
        fetch("http://localhost:5000/api/poll/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({id}),
        })
        .then(res => res.json())
        .then(data => {
          console.log(data);
          setPollResult(data); // if you have a state to store poll results
        })
        .catch(err => console.error(err));
    }
    // check log**
    console.log(id);

  // when no poll-result!
  if(!pollResult) {
    return <h1>Sit tight...</h1>
  }

  // returns jsx.
  return (
     <main className="app-poll-result-content">
      <h1>Experience Live Poll</h1>
      <section className="poll-container">

        {pollResult["voteSummary"].map(function(poll, index, pollResult) {
          return(
            <div className="progress-container" key={index}>
              <h4>{poll.option_text}</h4>
              <div className="progress-bar">
                <span className="bar-one" style={{ width: `${(poll.votes_count / poll.total) * 100}` }}>
                  {poll.votes_count} votes
                </span>
              </div>
            </div>
          );
        })}        

        <div className="total">
          Total votes: <strong>{pollResult["totalVotes"]}</strong>
        </div>

        <div className="btn-align">
          <Link to="/">
            <button>
              <i className="fa-solid fa-arrow-left"></i>Back
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}

// expose to project!
export { PollResult };
