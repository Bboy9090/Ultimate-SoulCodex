import React from "react";
import { motion } from "framer-motion";

export default function TodaySkeleton() {
  return (
    <div className="container" style={{ padding: "1.5rem 1rem 5rem", maxWidth: 640, margin: "0 auto" }}>
      {/* Date Skeleton */}
      <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <div style={{ height: 14, width: 120, background: "rgba(212,168,95,0.1)", borderRadius: 4, margin: "0 auto 8px" }} className="animate-pulse" />
        <div style={{ height: 32, width: 240, background: "rgba(212,168,95,0.15)", borderRadius: 6, margin: "0 auto" }} className="animate-pulse" />
      </div>

      {/* Main Card Skeleton */}
      <div style={{
        background: "rgba(28,18,10,0.6)",
        border: "1px solid rgba(212,168,95,0.15)",
        borderRadius: 24,
        padding: "2rem",
        marginBottom: "2rem",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ height: 40, width: 40, borderRadius: "50%", background: "rgba(212,168,95,0.15)" }} className="animate-pulse" />
          <div style={{ height: 40, width: 40, borderRadius: "50%", background: "rgba(212,168,95,0.15)" }} className="animate-pulse" />
        </div>
        
        <div style={{ height: 20, width: "60%", background: "rgba(212,168,95,0.1)", borderRadius: 4, marginBottom: "1rem" }} className="animate-pulse" />
        <div style={{ height: 48, width: "100%", background: "rgba(212,168,95,0.2)", borderRadius: 8, marginBottom: "1.5rem" }} className="animate-pulse" />
        <div style={{ height: 80, width: "100%", background: "rgba(212,168,95,0.05)", borderRadius: 12 }} className="animate-pulse" />
      </div>

      {/* Stats Grid Skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div style={{ height: 120, background: "rgba(212,168,95,0.08)", borderRadius: 16 }} className="animate-pulse" />
        <div style={{ height: 120, background: "rgba(212,168,95,0.08)", borderRadius: 16 }} className="animate-pulse" />
      </div>
      
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
