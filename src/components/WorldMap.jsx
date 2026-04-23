import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { ID_TO_COUNTRY } from "../data/countries";

const TOPO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function WorldMap({
  visited,
  bucketlist,
  highlighted,
  toggleVisited,
  toggleBucket,
}) {
  const svgRef = useRef(null);
  const gRef = useRef(null);
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

    d3.json(TOPO_URL).then((world) => {
      const features = topojson.feature(
        world,
        world.objects.countries
      ).features;

      g.selectAll("path.country-path")
        .data(features)
        .join("path")
        .attr("class", "country-path")
        .attr("d", path)
        .attr("data-id", (d) => String(d.id).padStart(3, "0"))
        .on("mousemove", function (event, d) {
          const id = String(d.id).padStart(3, "0");
          const country = ID_TO_COUNTRY[id];
          if (!country) return;
          const rect = svgRef.current.getBoundingClientRect();
          setTooltip({
            name: country.name,
            flag: country.flag,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            visited: visited.includes(country.name),
            bucket: bucketlist.includes(country.name),
          });
        })
        .on("mouseleave", () => setTooltip(null))
        .on("click", function (event, d) {
          event.stopPropagation();
          const id = String(d.id).padStart(3, "0");
          const country = ID_TO_COUNTRY[id];
          if (!country) return;
          const rect = svgRef.current.getBoundingClientRect();
          setCtx({
            name: country.name,
            flag: country.flag,
            x: Math.min(event.clientX - rect.left, rect.width - 180),
            y: Math.min(event.clientY - rect.top, rect.height - 150),
          });
          setTooltip(null);
        });

      updateStyles(features, visited, bucketlist, highlighted, g);
    });

    svg.on("click", () => setCtx(null));
  }, []);

  useEffect(() => {
    if (!gRef.current) return;
    const features = gRef.current.g.selectAll("path.country-path").data();
    updateStyles(features, visited, bucketlist, highlighted, gRef.current.g);
  }, [visited, bucketlist, highlighted]);

  function updateStyles(features, vis, buck, hl, g) {
    g.selectAll("path.country-path")
      .attr("fill", (d) => {
        const id = String(d.id).padStart(3, "0");
        const country = ID_TO_COUNTRY[id];
        if (!country) return "#1a2233";
        const name = country.name;
        if (hl === name) return "#60a5fa";
        if (vis.includes(name)) return "#4ade80";
        if (buck.includes(name)) return "#fbbf24";
        return "#1e2d42";
      })
      .attr("stroke", (d) => {
        const id = String(d.id).padStart(3, "0");
        const country = ID_TO_COUNTRY[id];
        if (!country) return "#0d1520";
        const name = country.name;
        if (hl === name) return "#93c5fd";
        if (vis.includes(name)) return "#22c55e";
        if (buck.includes(name)) return "#f59e0b";
        return "#0d1520";
      })
      .attr("stroke-width", (d) => {
        const id = String(d.id).padStart(3, "0");
        const country = ID_TO_COUNTRY[id];
        if (!country) return 0.4;
        const name = country.name;
        return hl === name || vis.includes(name) || buck.includes(name)
          ? 0.8
          : 0.4;
      })
      .style("cursor", "pointer");
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
          <div className="tooltip-name">
            <span style={{ fontSize: 16, marginRight: 6 }}>{tooltip.flag}</span>
            {tooltip.name}
          </div>
          <div className="tooltip-actions">
            {tooltip.visited && (
              <span className="tooltip-tag tag-visited">Bezocht</span>
            )}
            {tooltip.bucket && (
              <span className="tooltip-tag tag-bucket">Bucketlist</span>
            )}
            {!tooltip.visited && !tooltip.bucket && (
              <span className="tooltip-tag tag-none">Klik voor opties</span>
            )}
          </div>
        </div>
      )}

      {ctx && (
        <div className="ctx-menu" style={{ left: ctx.x, top: ctx.y }}>
          <div className="ctx-header">
            {ctx.flag} {ctx.name}
          </div>
          <button
            className={`ctx-item ${
              visited.includes(ctx.name) ? "active-visited" : ""
            }`}
            onClick={() => {
              toggleVisited(ctx.name);
              setCtx(null);
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 8l3.5 3.5L13 4" />
            </svg>
            {visited.includes(ctx.name)
              ? "Verwijder uit bezocht"
              : "Markeer als bezocht"}
          </button>
          <button
            className={`ctx-item ${
              bucketlist.includes(ctx.name) ? "active-bucket" : ""
            }`}
            onClick={() => {
              toggleBucket(ctx.name);
              setCtx(null);
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M8 2l1.5 3.5L13 6l-2.5 2.5.5 3.5L8 10.5 5 12l.5-3.5L3 6l3.5-.5z" />
            </svg>
            {bucketlist.includes(ctx.name)
              ? "Verwijder uit bucketlist"
              : "Voeg toe aan bucketlist"}
          </button>
        </div>
      )}

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: "#4ade80" }}></span>
          Bezocht
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: "#fbbf24" }}></span>
          Bucketlist
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: "#1e2d42" }}></span>
          Niet bezocht
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
