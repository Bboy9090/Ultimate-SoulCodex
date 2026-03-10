"use client"

import { useState } from "react"

export default function SystemAccordion(){

  const [open,setOpen] = useState(false)

  return(
    <div>

      <button onClick={()=>setOpen(!open)}>
        System Details
      </button>

      {open && (
        <div>

          <p>Astrology</p>
          <p>Numerology</p>
          <p>Human Design</p>
          <p>Elements</p>
          <p>Moral Compass</p>

        </div>
      )}

    </div>
  )
}
