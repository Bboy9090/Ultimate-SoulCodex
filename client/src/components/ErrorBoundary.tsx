import React, { Component, ErrorInfo, ReactNode } from "react";
import ScButton from "./ScButton";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
          background: "var(--sc-bg-ink)",
          color: "var(--foreground)"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem", color: "var(--sc-gold)" }}>◈</div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontFamily: "var(--font-display)" }}>
            Something shifted in the cosmos
          </h1>
          <p style={{ color: "var(--muted-foreground)", maxWidth: "320px", marginBottom: "2rem", fontSize: "0.9rem" }}>
            The application encountered an unexpected rift. We've been notified and are stabilizing the dimension.
          </p>
          <ScButton onClick={() => window.location.href = "/"}>
            Restart Engine
          </ScButton>
        </div>
      );
    }

    return this.children;
  }
}

export default ErrorBoundary;
