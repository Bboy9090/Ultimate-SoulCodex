"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"

const zodiac = [
  "Aries","Taurus","Gemini","Cancer",
  "Leo","Virgo","Libra","Scorpio",
  "Sagittarius","Capricorn","Aquarius","Pisces"
]

type ChartPlanet = {
  name: string
  degree: number
}

type ChartAspect = {
  planetA: string
  planetB: string
  type: string
  orb?: number
}

const ASPECT_COLORS: Record<string, string> = {
  conjunction: "#E6C27A",
  trine: "#6BA7FF",
  square: "#ef4444",
  sextile: "#22c55e",
  opposition: "#f97316",
}

const SIGN_FOR_DEGREE = (deg: number) => zodiac[Math.floor(((deg % 360) + 360) % 360 / 30)]
const DEGREE_IN_SIGN = (deg: number) => Math.floor(((deg % 360) + 360) % 360 % 30)

function planetXY(degree: number, r: number): [number, number] {
  const angle = (degree * Math.PI) / 180
  return [Math.sin(angle) * r, -Math.cos(angle) * r]
}

export default function ChartWheel({
  planets,
  aspects,
}: {
  planets?: ChartPlanet[]
  aspects?: ChartAspect[]
}){

  const ref = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ name: string; sign: string; degree: number } | null>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {

    if (!ref.current) return

    const size = 380
    const radius = size / 2

    const svg = d3.select(ref.current)
      .attr("width", size)
      .attr("height", size)
      .attr("viewBox", `0 0 ${size} ${size}`)

    svg.selectAll("*").remove()

    const g = svg.append("g")
      .attr("transform", `translate(${radius},${radius})`)

    const arcGen = d3.arc<d3.PieArcDatum<string>>()
      .innerRadius(radius - 40)
      .outerRadius(radius)

    const pieGen = d3.pie<string>().value(() => 1)
    const arcs = pieGen(zodiac)

    g.selectAll(".zodiac-segment")
      .data(arcs)
      .enter()
      .append("path")
      .attr("class", "zodiac-segment")
      .attr("d", d => arcGen(d)!)
      .attr("fill", (_, i) => i % 2 ? "#1E2532" : "#151A23")
      .attr("stroke", "#2C3547")

    g.append("circle")
      .attr("r", radius - 40)
      .attr("fill", "none")
      .attr("stroke", "#2C3547")
      .attr("stroke-width", 0.5)

    g.selectAll(".zodiac-label")
      .data(arcs)
      .enter()
      .append("text")
      .attr("class", "zodiac-label")
      .attr("transform", d => {
        const angle = (d.startAngle + d.endAngle) / 2
        const [x, y] = [Math.sin(angle) * (radius - 20), -Math.cos(angle) * (radius - 20)]
        return `translate(${x},${y})`
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", "9px")
      .attr("fill", "#9DA7B8")
      .text((_, i) => zodiac[i])

    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 * Math.PI) / 180
      g.append("line")
        .attr("x1", Math.sin(angle) * (radius - 40))
        .attr("y1", -Math.cos(angle) * (radius - 40))
        .attr("x2", Math.sin(angle) * radius)
        .attr("y2", -Math.cos(angle) * radius)
        .attr("stroke", "#2C3547")
        .attr("stroke-width", 0.5)
    }

    if (planets && aspects && aspects.length > 0) {
      const planetMap = new Map(planets.map(p => [p.name, p.degree]))
      const planetOrbit = radius - 60
      const aspectGroup = g.append("g").attr("class", "aspects")

      for (const aspect of aspects) {
        const degA = planetMap.get(aspect.planetA)
        const degB = planetMap.get(aspect.planetB)
        if (degA === undefined || degB === undefined) continue

        const [x1, y1] = planetXY(degA, planetOrbit)
        const [x2, y2] = planetXY(degB, planetOrbit)
        const color = ASPECT_COLORS[aspect.type] || "#2C3547"

        aspectGroup.append("line")
          .attr("x1", x1).attr("y1", y1)
          .attr("x2", x2).attr("y2", y2)
          .attr("stroke", color)
          .attr("stroke-width", aspect.type === "conjunction" ? 1.5 : 1)
          .attr("stroke-opacity", 0.5)
          .attr("stroke-dasharray", aspect.type === "sextile" ? "3,3" : "none")
      }
    }

    if (planets) {
      const planetOrbit = radius - 60
      const labelOrbit = radius - 80

      const planetDots = g.selectAll(".planet")
        .data(planets)
        .enter()
        .append("g")
        .attr("class", "planet")
        .style("cursor", "pointer")
        .on("click", (_, d) => {
          setTooltip({
            name: d.name,
            sign: SIGN_FOR_DEGREE(d.degree),
            degree: DEGREE_IN_SIGN(d.degree),
          })
        })

      planetDots.append("circle")
        .attr("r", 6)
        .attr("fill", "#E6C27A")
        .attr("stroke", "#0B0E14")
        .attr("stroke-width", 1.5)
        .attr("cx", d => planetXY(d.degree, planetOrbit)[0])
        .attr("cy", d => planetXY(d.degree, planetOrbit)[1])

      planetDots.append("text")
        .attr("x", d => planetXY(d.degree, labelOrbit)[0])
        .attr("y", d => planetXY(d.degree, labelOrbit)[1])
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "8px")
        .attr("fill", "#E6C27A")
        .text(d => d.name)
    }

  }, [planets, aspects])

  return(
    <div className="card flex flex-col items-center">

      <h2 className="card-title">Birth Chart Wheel</h2>

      <div
        className="overflow-hidden touch-manipulation"
        style={{ transform: `scale(${scale})`, transformOrigin: "center", transition: "transform 0.2s" }}
      >
        <svg ref={ref} className="mt-2 w-full max-w-[380px]" />
      </div>

      {/* Zoom controls */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => setScale(s => Math.min(s + 0.2, 2))}
          className="text-xs px-3 py-1 bg-codex-surface border border-codex-border rounded-codex hover:border-codex-purple/60 transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setScale(1)}
          className="text-xs px-3 py-1 bg-codex-surface border border-codex-border rounded-codex hover:border-codex-purple/60 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => setScale(s => Math.max(s - 0.2, 0.6))}
          className="text-xs px-3 py-1 bg-codex-surface border border-codex-border rounded-codex hover:border-codex-purple/60 transition-colors"
        >
          −
        </button>
      </div>

      {/* Planet tooltip */}
      {tooltip && (
        <div className="mt-3 p-3 bg-codex-surface border border-codex-border rounded-codex w-full">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-codex-gold">{tooltip.name}</p>
              <p className="text-xs text-codex-textMuted">{tooltip.sign} {tooltip.degree}°</p>
            </div>
            <button onClick={() => setTooltip(null)} className="text-xs text-codex-textMuted">Close</button>
          </div>
        </div>
      )}

      {/* Aspect legend */}
      {aspects && aspects.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3 self-start">
          {Object.entries(ASPECT_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-3 h-0.5" style={{ backgroundColor: color }} />
              <span className="text-xs text-codex-textMuted capitalize">{type}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
