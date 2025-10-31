// grab modules
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

// grab chart module..
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

// () -> Tick Component to wrap longer labels.. 
const WrappedTick = ({ x, y, payload }) => {
  const words = payload.value.split(" ");
  return (
    <g transform={`translate(${x},${y})`}>
      {words.map((word, index) => (
        <text
          key={index}
          x={0}
          y={index * 14}
          dy={16}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
        >
          {word}
        </text>
      ))}
    </g>
  );
};

// () -> Poll Result Component..
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
  }, [id]);

  // until result loads..
  if (!pollResult) return <h1 className="loading-text">Sit tight...</h1>;

  // fixed array of colors to be used..
  const COLORS = ["#00C49F", "#FF8042", "#0088FE", "#FFBB28", "#AF19FF"];

  // return jsx..
  return (
    <main className="app-poll-result-content">
      <h1>📊 Poll Results</h1>

      <section className="charts-container">
        {/* Bar Chart */}
        <section className="chart-box">
          <h3>Bar Chart</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={pollResult.voteSummary}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />

              {/* X-axis..  */}
              <XAxis
                dataKey="option_text"
                stroke="#fff"
                interval={0}
                tickLine={false}
                height={50}
                tick={<WrappedTick />}
              />

              {/* Y-Axis.. */}
              <YAxis stroke="#fff" allowDecimals={false} tick={{ fill: "#fff" }} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,0.1)" }} />
              <Legend />
              <Bar
                dataKey="votes_count"
                fill="#00C49F"
                barSize={50}
                radius={[6, 6, 0, 0]}
                label={{ position: "top", fill: "#fff", fontSize: 12 }}
              />
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

      <div className="total-votes">
        🗳️ Total votes: <strong>{pollResult.totalVotes}</strong>
      </div>

      <div className="btn-align">
        <Link to="/polls">
          <button className="back-btn">
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>
        </Link>
      </div>
    </main>
  );
}

// expose to project..
export { PollResult };
