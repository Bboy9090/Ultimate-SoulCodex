export default function LifeMapStrip(){

  const years = [
    {year:2024,phase:"Construction"},
    {year:2025,phase:"Construction"},
    {year:2026,phase:"Expansion"},
  ]

  return(
    <div>

      {years.map(y=>(
        <div key={y.year}>
          {y.year} — {y.phase}
        </div>
      ))}

    </div>
  )
}
