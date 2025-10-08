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

    // initial state array for filter
    const [selectedFilter, setSelectedFilter] = useState("all");

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

                // console.log(pollsResponse);

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

    // () -> handle polls filtering
    function handlePollsFilter() {
        if (selectedFilter === "new") {
            return [...polls].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        if (selectedFilter === "trending") {
            return [...polls].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
        }

        return polls; // default → all
    }

    // grab the filtered polls
    const filteredPolls = handlePollsFilter(); 


  return (
    <main className="polls-page">

    {isLoading && <p>Loading polls...</p>}
    {error && <p style={{ color: "red" }}>{error}</p>}

    {/* filter-section */}
    <div className="polls-filter-bar">
        <button 
          onClick={() => setSelectedFilter("all")} 
          disabled={selectedFilter === "all"} 
          className={`polls-filter-btn ${selectedFilter === "all" ? "active" : ""}`}
          >
           🌐 All
        </button>
        <button 
          onClick={() => setSelectedFilter("new")} 
          disabled={selectedFilter === "new"}
          className={`polls-filter-btn ${selectedFilter === "new" ? "active" : ""}`}
        >
            🆕 New
        </button>
        <button 
          onClick={() => setSelectedFilter("trending")} 
          disabled={selectedFilter === "trending"}
          className={`polls-filter-btn ${selectedFilter === "trending" ? "active" : ""}`}
        >
           🔥 Trending
        </button>
    </div>

      {/* Polls Content  */}
      <div className="polls-grid">

        {/* Each Poll Card */}
        {filteredPolls.map((poll) => (
          <section key={poll.id} className="polls-card">
            <div className="polls-card-content">
              <div className="icon">
                📝
              </div>
              <div className="text">
                <h2>
                  <Link to={`/poll/${poll.id}`}>{poll.title.length > 50 ? poll.title.slice(0, 45) + "..." : poll.title}</Link>
                </h2>
                <p className="desc">{poll.description}</p>
                <div className="meta">
                  <span>#{poll.category}</span> · <span>by {poll.username}</span>
                </div>
              </div>
            </div>

            <div className="polls-card-actions">
              <div className="expires">
                Expires: {new Date(poll.expires_at).toLocaleDateString()}
              </div>
              <div className="result">
                <Link to={`/poll-result/${poll.id}`}>
                  🔍
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

// expose to project!
export { Polls };
