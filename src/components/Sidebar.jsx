import { useState } from "react";
import { COUNTRIES } from "../data/countries";

const TOTAL = 195;

export default function Sidebar({
  visited,
  bucketlist,
  page,
  setPage,
  toggleVisited,
  toggleBucket,
}) {
  const [tab, setTab] = useState("visited");

  const list =
    tab === "visited"
      ? COUNTRIES.filter((c) => visited.includes(c.name))
      : COUNTRIES.filter((c) => bucketlist.includes(c.name));

  const pct = Math.round((visited.length / TOTAL) * 100);

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-title">
          Travel<span>Tracker</span>
        </div>
        <div className="logo-sub">Jouw reisavonturen</div>
      </div>

      <div className="sidebar-nav">
        <button
          className={`nav-btn ${page === "map" ? "active" : ""}`}
          onClick={() => setPage("map")}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M2 8h12M8 2a10 10 0 010 12M8 2a10 10 0 000 12" />
          </svg>
          Wereldkaart
        </button>
        <button
          className={`nav-btn ${page === "stats" ? "active" : ""}`}
          onClick={() => setPage("stats")}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="2" y="9" width="3" height="5" rx="0.5" />
            <rect x="6.5" y="5" width="3" height="9" rx="0.5" />
            <rect x="11" y="2" width="3" height="12" rx="0.5" />
          </svg>
          Statistieken
        </button>
      </div>

      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border)",
          padding: "0 10px",
        }}
      >
        <button
          onClick={() => setTab("visited")}
          style={{
            flex: 1,
            padding: "8px 0",
            background: "transparent",
            border: "none",
            borderBottom:
              tab === "visited"
                ? "2px solid var(--green)"
                : "2px solid transparent",
            color: tab === "visited" ? "var(--green)" : "var(--text3)",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "DM Sans, sans-serif",
            transition: "color 0.15s",
          }}
        >
          Bezocht ({visited.length})
        </button>
        <button
          onClick={() => setTab("bucket")}
          style={{
            flex: 1,
            padding: "8px 0",
            background: "transparent",
            border: "none",
            borderBottom:
              tab === "bucket"
                ? "2px solid var(--amber)"
                : "2px solid transparent",
            color: tab === "bucket" ? "var(--amber)" : "var(--text3)",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "DM Sans, sans-serif",
            transition: "color 0.15s",
          }}
        >
          Bucketlist ({bucketlist.length})
        </button>
      </div>

      <div className="sidebar-countries">
        {list.length === 0 && (
          <div
            style={{
              padding: "20px 14px",
              fontSize: 12,
              color: "var(--text3)",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            {tab === "visited"
              ? "Klik op een land op de kaart om het te markeren als bezocht."
              : "Voeg landen toe aan je bucketlist via de kaart."}
          </div>
        )}
        {list.map((c) => (
          <div key={c.id} className="country-row">
            <span style={{ fontSize: 16 }}>{c.flag}</span>
            <div style={{ flex: 1 }}>
              <div className="name">{c.name}</div>
              <div className="cont">{c.continent}</div>
            </div>
            <button
              onClick={() =>
                tab === "visited" ? toggleVisited(c.name) : toggleBucket(c.name)
              }
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text3)",
                fontSize: 14,
                padding: "2px 4px",
                borderRadius: 4,
                transition: "color 0.1s",
              }}
              title="Verwijderen"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-stats">
        <div className="progress-label">
          <span>Wereld ontdekt</span>
          <span>
            {visited.length} / {TOTAL}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }}></div>
        </div>
      </div>
    </div>
  );
}
