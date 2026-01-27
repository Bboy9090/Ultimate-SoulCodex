import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Ultimate SoulCodex</h1>
      <p>Your cosmic journey starts here.</p>
    </div>
  );
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(<App />);
}
