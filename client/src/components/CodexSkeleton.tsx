import React from "react";

export default function CodexSkeleton() {
  return (
    <div className="container" style={{ padding: "2rem 1rem", maxWidth: 720, margin: "0 auto" }}>
      {/* Header Skeleton */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ height: 12, width: 80, background: "rgba(212,168,95,0.1)", borderRadius: 4, margin: "0 auto 1rem" }} className="animate-pulse" />
        <div style={{ height: 80, width: "80%", background: "rgba(212,168,95,0.15)", borderRadius: 8, margin: "0 auto 1.5rem" }} className="animate-pulse" />
        <div style={{ height: 24, width: "60%", background: "rgba(212,168,95,0.05)", borderRadius: 6, margin: "0 auto" }} className="animate-pulse" />
      </div>

      {/* Sections Skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ 
          marginBottom: "2rem", 
          padding: "1.5rem", 
          background: "rgba(28,18,10,0.4)", 
          border: "1px solid rgba(212,168,95,0.1)", 
          borderRadius: 16 
        }}>
          <div style={{ height: 10, width: 100, background: "rgba(212,168,95,0.2)", borderRadius: 4, marginBottom: "1rem" }} className="animate-pulse" />
          <div style={{ height: 16, width: "100%", background: "rgba(212,168,95,0.05)", borderRadius: 4, marginBottom: "0.6rem" }} className="animate-pulse" />
          <div style={{ height: 16, width: "90%", background: "rgba(212,168,95,0.05)", borderRadius: 4, marginBottom: "0.6rem" }} className="animate-pulse" />
          <div style={{ height: 16, width: "95%", background: "rgba(212,168,95,0.05)", borderRadius: 4 }} className="animate-pulse" />
        </div>
      ))}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />
    </div>
  );
}
