import { useState, useEffect } from "react";
import WorldMap from "./components/WorldMap";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import StatsPage from "./components/StatsPage";
import "./App.css";

export default function App() {
  const [visited, setVisited] = useState(() => {
    const saved = localStorage.getItem("traveltracker-visited");
    return saved ? JSON.parse(saved) : [];
  });
  const [bucketlist, setBucketlist] = useState(() => {
    const saved = localStorage.getItem("traveltracker-bucket");
    return saved ? JSON.parse(saved) : [];
  });
  const [page, setPage] = useState("map");
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(null);

  useEffect(() => {
    localStorage.setItem("traveltracker-visited", JSON.stringify(visited));
  }, [visited]);

  useEffect(() => {
    localStorage.setItem("traveltracker-bucket", JSON.stringify(bucketlist));
  }, [bucketlist]);

  function toggleVisited(name) {
    setVisited((v) =>
      v.includes(name) ? v.filter((c) => c !== name) : [...v, name]
    );
    setBucketlist((b) => b.filter((c) => c !== name));
  }

  function toggleBucket(name) {
    setBucketlist((b) =>
      b.includes(name) ? b.filter((c) => c !== name) : [...b, name]
    );
    setVisited((v) => v.filter((c) => c !== name));
  }

  function handleSearch(country) {
    setHighlighted(country);
    setSearch("");
    setTimeout(() => setHighlighted(null), 2000);
  }

  return (
    <div className="app">
      <Sidebar
        visited={visited}
        bucketlist={bucketlist}
        page={page}
        setPage={setPage}
        toggleVisited={toggleVisited}
        toggleBucket={toggleBucket}
      />
      <div className="main">
        <Topbar
          search={search}
          setSearch={setSearch}
          onSelect={handleSearch}
          visited={visited}
          bucketlist={bucketlist}
        />
        {page === "map" ? (
          <WorldMap
            visited={visited}
            bucketlist={bucketlist}
            highlighted={highlighted}
            toggleVisited={toggleVisited}
            toggleBucket={toggleBucket}
          />
        ) : (
          <StatsPage visited={visited} bucketlist={bucketlist} />
        )}
      </div>
    </div>
  );
}
