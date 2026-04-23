import { COUNTRIES, CONTINENTS } from "../data/countries";

const TOTAL = 195;
const CONT_TOTALS = {
  Europa: 44,
  Azië: 48,
  Afrika: 54,
  "Noord-Amerika": 23,
  "Zuid-Amerika": 12,
  Oceanië: 14,
};

export default function StatsPage({ visited, bucketlist }) {
  const continentCounts = CONTINENTS.reduce((acc, cont) => {
    acc[cont] = COUNTRIES.filter(
      (c) => c.continent === cont && visited.includes(c.name)
    ).length;
    return acc;
  }, {});

  const bucketCountries = COUNTRIES.filter((c) => bucketlist.includes(c.name));
  const visitedCountries = COUNTRIES.filter((c) => visited.includes(c.name));

  const topContinent = Object.entries(continentCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
    <div className="stats-page">
      <div className="stats-title">Jouw reisstatistieken</div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-num" style={{ color: "var(--green)" }}>
            {visited.length}
          </div>
          <div className="stat-card-lbl">landen bezocht</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num">
            {Math.round((visited.length / TOTAL) * 100)}%
          </div>
          <div className="stat-card-lbl">van de wereld</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num" style={{ color: "var(--amber)" }}>
            {bucketlist.length}
          </div>
          <div className="stat-card-lbl">op bucketlist</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num">
            {topContinent && topContinent[1] > 0
              ? topContinent[0].split("-")[0]
              : "—"}
          </div>
          <div className="stat-card-lbl">favoriete continent</div>
        </div>
      </div>

      <div className="continent-bars">
        <div className="continent-title">Per continent</div>
        {CONTINENTS.map((cont) => {
          const count = continentCounts[cont] || 0;
          const total = CONT_TOTALS[cont] || 10;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={cont} className="cont-bar-row">
              <div className="cont-bar-label">{cont}</div>
              <div className="cont-bar-track">
                <div
                  className="cont-bar-fill"
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
              <div className="cont-bar-num">{count}</div>
            </div>
          );
        })}
      </div>

      {bucketCountries.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div
            className="continent-title"
            style={{ color: "var(--amber)", marginBottom: 12 }}
          >
            Bucketlist
          </div>
          <div className="bucket-grid">
            {bucketCountries.map((c) => (
              <div key={c.id} className="bucket-pill">
                <span style={{ fontSize: 14 }}>{c.flag}</span>
                {c.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {visitedCountries.length > 0 && (
        <div>
          <div className="continent-title" style={{ marginBottom: 12 }}>
            Alle bezochte landen
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {visitedCountries.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "var(--green-dim)",
                  border: "1px solid rgba(74,222,128,0.15)",
                  borderRadius: 99,
                  padding: "5px 12px",
                  fontSize: 12,
                  color: "var(--green)",
                }}
              >
                <span style={{ fontSize: 14 }}>{c.flag}</span>
                {c.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
