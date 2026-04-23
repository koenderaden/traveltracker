import { useState, useRef, useEffect } from "react";
import { COUNTRIES } from "../data/countries";

export default function Topbar({
  search,
  setSearch,
  onSelect,
  visited,
  bucketlist,
}) {
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    const q = search.toLowerCase();
    setResults(
      COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6)
    );
  }, [search]);

  function select(country) {
    onSelect(country.name);
    setResults([]);
    setSearch("");
  }

  return (
    <div className="topbar">
      <div className="search-wrap">
        <svg
          className="search-icon"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="6.5" cy="6.5" r="4.5" />
          <path d="M10.5 10.5l3 3" />
        </svg>
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder="Zoek een land..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSearch("");
              setResults([]);
            }
            if (e.key === "Enter" && results.length > 0) select(results[0]);
          }}
        />
        {results.length > 0 && (
          <div className="search-results">
            {results.map((c) => (
              <div
                key={c.id}
                className="search-result-item"
                onClick={() => select(c)}
              >
                <span style={{ fontSize: 16 }}>{c.flag}</span>
                <span className="r-name">{c.name}</span>
                <span className="r-cont">{c.continent}</span>
                {visited.includes(c.name) && (
                  <span
                    style={{
                      fontSize: 10,
                      background: "var(--green-dim)",
                      color: "var(--green)",
                      padding: "2px 6px",
                      borderRadius: 99,
                    }}
                  >
                    bezocht
                  </span>
                )}
                {bucketlist.includes(c.name) && (
                  <span
                    style={{
                      fontSize: 10,
                      background: "var(--amber-dim)",
                      color: "var(--amber)",
                      padding: "2px 6px",
                      borderRadius: 99,
                    }}
                  >
                    bucket
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="topbar-stats">
        <div className="topbar-stat">
          <div className="topbar-stat-num" style={{ color: "var(--green)" }}>
            {visited.length}
          </div>
          <div className="topbar-stat-lbl">bezocht</div>
        </div>
        <div className="topbar-stat">
          <div className="topbar-stat-num" style={{ color: "var(--amber)" }}>
            {bucketlist.length}
          </div>
          <div className="topbar-stat-lbl">bucketlist</div>
        </div>
        <div className="topbar-stat">
          <div className="topbar-stat-num">
            {Math.round((visited.length / 195) * 100)}%
          </div>
          <div className="topbar-stat-lbl">van de wereld</div>
        </div>
      </div>
    </div>
  );
}
