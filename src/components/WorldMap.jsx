import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { ID_TO_COUNTRY } from "../data/countries";

const TOPO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const CONTINENT_COLORS = {
  Europa: { fill: "#3b82f6", stroke: "#2563eb", visited: "#60a5fa" },
  Azië: { fill: "#a855f7", stroke: "#9333ea", visited: "#c084fc" },
  Afrika: { fill: "#f97316", stroke: "#ea580c", visited: "#fb923c" },
  "Noord-Amerika": { fill: "#06b6d4", stroke: "#0891b2", visited: "#22d3ee" },
  "Zuid-Amerika": { fill: "#10b981", stroke: "#059669", visited: "#34d399" },
  Oceanië: { fill: "#f59e0b", stroke: "#d97706", visited: "#fbbf24" },
};

const BUCKET_COLOR = { fill: "#fbbf24", stroke: "#f59e0b" };
const DEFAULT_COLOR = { fill: "#1e2d42", stroke: "#0d1520" };
const DEFAULT_COLOR_LIGHT = { fill: "#cbd5e1", stroke: "#94a3b8" };

const OVERSEAS = {
  254: "Frankrijk",
  474: "Frankrijk",
  312: "Frankrijk",
  638: "Frankrijk",
  175: "Frankrijk",
  663: "Frankrijk",
  534: "Nederland",
  535: "Nederland",
  533: "Nederland",
  540: "Frankrijk",
  258: "Frankrijk",
};

function playSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.setValueAtTime(520, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.1);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

export default function WorldMap({
  visited,
  bucketlist,
  highlighted,
  toggleVisited,
  toggleBucket,
  darkMode,
}) {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const zoomRef = useRef(null);
  const featuresRef = useRef([]);
  const [ctx, setCtx] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || 900;
    const height = svgRef.current.clientHeight || 500;

    svg.selectAll("*").remove();

    const projection = d3
      .geoNaturalEarth1()
      .scale(width / 6.2)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath(projection);
    const g = svg.append("g");
    gRef.current = { g, path, projection };

    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", (e) => g.attr("transform", e.transform));
    svg.call(zoom);
    zoomRef.current = zoom;

    d3.json(TOPO_URL).then((world) => {
      const features = topojson.feature(
        world,
        world.objects.countries
      ).features;
      featuresRef.current = features;

      g.selectAll("path.country-path")
        .data(features)
        .join("path")
        .attr("class", "country-path")
        .attr("d", path)
        .attr("data-id", (d) => String(d.id).padStart(3, "0"))
        .on("mousemove", function (event, d) {
          const id = String(d.id).padStart(3, "0");
          if (OVERSEAS[id]) return;
          const country = ID_TO_COUNTRY[id];
          if (!country) return;
          const rect = svgRef.current.getBoundingClientRect();
          setTooltip({
            name: country.name,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
        })
        .on("mouseleave", () => setTooltip(null))
        .on("click", function (event, d) {
          event.stopPropagation();
          const id = String(d.id).padStart(3, "0");
          if (OVERSEAS[id]) return;
          const country = ID_TO_COUNTRY[id];
          if (!country) return;

          const rect = svgRef.current.getBoundingClientRect();
          setCtx({
            name: country.name,
            x: Math.min(event.clientX - rect.left, rect.width - 210),
            y: Math.min(event.clientY - rect.top, rect.height - 160),
          });
          setTooltip(null);

          const bounds = path.bounds(d);
          const dx = bounds[1][0] - bounds[0][0];
          const dy = bounds[1][1] - bounds[0][1];
          const x = (bounds[0][0] + bounds[1][0]) / 2;
          const y = (bounds[0][1] + bounds[1][1]) / 2;
          const scale = Math.max(
            1,
            Math.min(6, 0.9 / Math.max(dx / rect.width, dy / rect.height))
          );
          const translate = [
            rect.width / 2 - scale * x,
            rect.height / 2 - scale * y,
          ];

          svg
            .transition()
            .duration(600)
            .call(
              zoom.transform,
              d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
            );
        });

      updateStyles(features, visited, bucketlist, highlighted, g, darkMode);
    });

    svg.on("click", () => setCtx(null));
  }, []);

  useEffect(() => {
    if (!gRef.current || featuresRef.current.length === 0) return;
    updateStyles(
      featuresRef.current,
      visited,
      bucketlist,
      highlighted,
      gRef.current.g,
      darkMode
    );
  }, [visited, bucketlist, highlighted, darkMode]);

  function getColor(name, vis, buck, hl, dark) {
    if (hl === name) return { fill: "#60a5fa", stroke: "#93c5fd" };
    if (buck.includes(name)) return BUCKET_COLOR;
    if (vis.includes(name)) {
      const country = Object.values(ID_TO_COUNTRY).find((c) => c.name === name);
      const colors = country ? CONTINENT_COLORS[country.continent] : null;
      return colors
        ? { fill: colors.visited, stroke: colors.stroke }
        : { fill: "#4ade80", stroke: "#22c55e" };
    }
    return dark ? DEFAULT_COLOR : DEFAULT_COLOR_LIGHT;
  }

  function updateStyles(features, vis, buck, hl, g, dark) {
    g.selectAll("path.country-path")
      .attr("fill", (d) => {
        const id = String(d.id).padStart(3, "0");
        if (OVERSEAS[id]) return dark ? "#1a2233" : "#e2e8f0";
        const country = ID_TO_COUNTRY[id];
        if (!country) return dark ? "#1a2233" : "#e2e8f0";
        return getColor(country.name, vis, buck, hl, dark).fill;
      })
      .attr("stroke", (d) => {
        const id = String(d.id).padStart(3, "0");
        if (OVERSEAS[id]) return dark ? "#0d1520" : "#fff";
        const country = ID_TO_COUNTRY[id];
        if (!country) return dark ? "#0d1520" : "#fff";
        return getColor(country.name, vis, buck, hl, dark).stroke;
      })
      .attr("stroke-width", 0.5)
      .style("cursor", (d) => {
        const id = String(d.id).padStart(3, "0");
        return OVERSEAS[id] ? "default" : "pointer";
      });
  }

  function handleToggleVisited(name) {
    if (!visited.includes(name)) playSound();
    toggleVisited(name);
    setCtx(null);
  }

  function handleToggleBucket(name) {
    if (!bucketlist.includes(name)) playSound();
    toggleBucket(name);
    setCtx(null);
  }

  return (
    <div className="map-container" style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />

      {tooltip && (
        <div
          className="map-tooltip"
          style={{ left: tooltip.x + 14, top: tooltip.y - 20 }}
        >
          <div className="tooltip-name">{tooltip.name}</div>
          <div className="tooltip-actions">
            {visited.includes(tooltip.name) && (
              <span className="tooltip-tag tag-visited">Bezocht</span>
            )}
            {bucketlist.includes(tooltip.name) && (
              <span className="tooltip-tag tag-bucket">Bucketlist</span>
            )}
            {!visited.includes(tooltip.name) &&
              !bucketlist.includes(tooltip.name) && (
                <span className="tooltip-tag tag-none">Klik voor opties</span>
              )}
          </div>
        </div>
      )}

      {ctx && (
        <div className="ctx-menu" style={{ left: ctx.x, top: ctx.y }}>
          <div className="ctx-header">{ctx.name}</div>
          <button
            className={`ctx-item ${
              visited.includes(ctx.name) ? "active-visited" : ""
            }`}
            onClick={() => handleToggleVisited(ctx.name)}
          >
            <span style={{ fontSize: 16 }}>✈️</span>
            {visited.includes(ctx.name)
              ? "Verwijder uit bezocht"
              : "Ik ben hier geweest!"}
          </button>
          <button
            className={`ctx-item ${
              bucketlist.includes(ctx.name) ? "active-bucket" : ""
            }`}
            onClick={() => handleToggleBucket(ctx.name)}
          >
            <span style={{ fontSize: 16 }}>🌟</span>
            {bucketlist.includes(ctx.name)
              ? "Verwijder uit bucketlist"
              : "Wil ik naartoe!"}
          </button>
          <button
            className="ctx-item"
            onClick={() => {
              const svg = d3.select(svgRef.current);
              svg
                .transition()
                .duration(500)
                .call(zoomRef.current.transform, d3.zoomIdentity);
              setCtx(null);
            }}
          >
            <span style={{ fontSize: 16 }}>🔍</span>
            Zoom terug
          </button>
        </div>
      )}

      <div className="map-legend">
        {Object.entries(CONTINENT_COLORS).map(([cont, colors]) => (
          <div key={cont} className="legend-item">
            <span
              className="legend-dot"
              style={{ background: colors.visited }}
            ></span>
            {cont}
          </div>
        ))}
        <div
          className="legend-item"
          style={{
            marginTop: 6,
            borderTop: "1px solid rgba(128,128,128,0.2)",
            paddingTop: 6,
          }}
        >
          <span className="legend-dot" style={{ background: "#fbbf24" }}></span>
          Bucketlist
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          fontSize: 11,
          color: "var(--text3)",
        }}
      >
        Scroll om in te zoomen · Klik op een land
      </div>
    </div>
  );
}
