// grab module(s)
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// () -> Poll Component (all polls)
function Polls() {

    // initial state array for polls*
    const [polls, setPolls] = useState([]);

    // initial state array for loading-state*
    const [isLoading, setIsLoading] = useState(true);

    // initial state array for error*
    const [error, setError] = useState(null);

    // handle the API-call
    useEffect(function() {

        // () -> retrieves all polls
        async function fetchAllPolls() {

            // safe*
            try{

                // try to get polls
                const pollsResponse = await fetch(`http://localhost:5000/api/poll/all`);

                // when no-response 
                if(!pollsResponse.ok) {

                    // throw error
                    throw new Error("Polls Fetch Request Failed!")
                }

                // get the data
                const pollsData = await pollsResponse.json();

                // check log**
                console.log(pollsData);

                // update the state*
                setPolls(prev => prev = pollsData);
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
        fetchAllPolls();
    }, []);



  return (
    <main className="app-content polls-page">

    {isLoading && <p>Loading polls...</p>}
    {error && <p style={{ color: "red" }}>{error}</p>}

    {/* Polls Content  */}
      <div className="polls-grid">

        {/* Each Poll Card */}
        {polls.map((poll) => (
          <section key={poll.id} className="polls-card">

            {/* when poll-title is clicked shift the client to `Poll` Page */}
              <Link to={`/poll/${poll.id}`}>
                <h2>
                  {poll.title}
                </h2>
              </Link>

            {/* poll-description */}
            <p className="desc">{poll.description}</p>

            {/* poll-category */}
            <div className="meta">
              <span className="category">#{poll.category}</span>
              <span className="author">by {poll.username}</span>
            </div>

            {/* poll-tags */}
            <div className="tags">
              {poll.tags?.map((tag, idx) => (
                <span key={idx} className="tag">
                  {tag}
                </span>
              ))} 
            </div>

            {/* poll's expiry date */}
            <div className="expires">
              Expires: {new Date(poll.expires_at).toLocaleDateString()}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

// expose to project!
export { Polls };
