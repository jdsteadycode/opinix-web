// grab modules
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

// import charts
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

function PollResult() {
  const { id } = useParams();
  const [pollResult, setPollResult] = useState(null);

  // fetch results on load
  useEffect(() => {
    fetch("http://localhost:5000/api/poll/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then(res => res.json())
      .then(data => setPollResult(data))
      .catch(err => console.error(err));
  }
  , [id]);

  // until the stats load...
  if (!pollResult) return <h1 className="loading-text">Sit tight...</h1>;

  // colors array
  const COLORS = ["#00C49F", "#FF8042", "#0088FE", "#FFBB28", "#AF19FF"];

  // return pollResult jsx
  return (
    <main className="app-poll-result-content">
      <h1>📊 Poll Results</h1>

      {/* charts-container */}
      <section className="charts-container">
        {/* Bar Chart */}
        <section className="chart-box">
          <h3>Bar Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pollResult.voteSummary}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="option_text" stroke="#fff" />
              <YAxis stroke="#fff" allowDecimals={false}/>
              <Tooltip />
              <Legend />
              <Bar dataKey="votes_count" fill="#00C49F" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Pie Chart */}
        <div className="chart-box">
          <h3>Pie Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pollResult.voteSummary}
                dataKey="votes_count"
                nameKey="option_text"
                outerRadius={120}
                fill="#8884d8"
                label
              >
                {pollResult.voteSummary.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Total votes */}
      <div className="total-votes">
        🗳️ Total votes: <strong>{pollResult.totalVotes}</strong>
      </div>

      {/* Back button */}
      <div className="btn-align">
        <Link to="/">
          <button className="back-btn">
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>
        </Link>
      </div>
    </main>
  );
}
// expose to project!
export { PollResult };
