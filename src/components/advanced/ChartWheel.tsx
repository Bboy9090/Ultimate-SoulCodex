"use client"

import { useEffect, useRef } from "react"
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

export default function ChartWheel({ planets }: { planets?: ChartPlanet[] }){

  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {

    if (!ref.current) return

    const size = 350
    const radius = size / 2

    const svg = d3.select(ref.current)
      .attr("width", size)
      .attr("height", size)

    svg.selectAll("*").remove()

    const g = svg.append("g")
      .attr("transform", `translate(${radius},${radius})`)

    const arcGen = d3.arc<d3.PieArcDatum<string>>()
      .innerRadius(radius - 40)
      .outerRadius(radius)

    const pieGen = d3.pie<string>().value(() => 1)

    const arcs = pieGen(zodiac)

    g.selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("d", d => arcGen(d)!)
      .attr("fill", (_, i) => i % 2 ? "#1E2532" : "#151A23")
      .attr("stroke", "#2C3547")

    g.selectAll(".zodiac-label")
      .data(arcs)
      .enter()
      .append("text")
      .attr("class", "zodiac-label")
      .attr("transform", d => {
        const angle = (d.startAngle + d.endAngle) / 2
        const x = Math.sin(angle) * (radius - 20)
        const y = -Math.cos(angle) * (radius - 20)
        return `translate(${x},${y})`
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", "10px")
      .attr("fill", "#9DA7B8")
      .text((_, i) => zodiac[i])

    if (planets) {

      const planetDots = g.selectAll(".planet")
        .data(planets)
        .enter()
        .append("g")
        .attr("class", "planet")

      planetDots.append("circle")
        .attr("r", 5)
        .attr("fill", "#E6C27A")
        .attr("stroke", "#0B0E14")
        .attr("stroke-width", 1.5)
        .attr("cx", d => {
          const angle = (d.degree * Math.PI) / 180
          return Math.sin(angle) * (radius - 60)
        })
        .attr("cy", d => {
          const angle = (d.degree * Math.PI) / 180
          return -Math.cos(angle) * (radius - 60)
        })

      planetDots.append("text")
        .attr("x", d => {
          const angle = (d.degree * Math.PI) / 180
          return Math.sin(angle) * (radius - 80)
        })
        .attr("y", d => {
          const angle = (d.degree * Math.PI) / 180
          return -Math.cos(angle) * (radius - 80)
        })
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "9px")
        .attr("fill", "#E6C27A")
        .text(d => d.name)

    }

  }, [planets])

  return(
    <div className="card flex flex-col items-center">

      <h2 className="card-title self-start">Birth Chart Wheel</h2>

      <svg ref={ref} className="mt-2" />

    </div>
  )
}
