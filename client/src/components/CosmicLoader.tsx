import React from "react";
import { motion } from "framer-motion";
import { IconStar } from "./Icons";

interface Props {
  label?: string;
  fullPage?: boolean;
}

const CosmicLoader: React.FC<Props> = ({ label = "Loading...", fullPage = false }) => {
  const content = (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      textAlign: "center"
    }}>
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          width: "2.5rem",
          height: "2.5rem",
          color: "var(--sc-gold)",
          marginBottom: "1rem",
          filter: "drop-shadow(0 0 10px var(--sc-gold-glow))"
        }}
      >
        <IconStar style={{ width: "100%", height: "100%" }} />
      </motion.div>
      <div style={{
        fontSize: "0.75rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "var(--sc-gold)",
        opacity: 0.8
      }}>
        {label}
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "var(--sc-bg-ink)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {content}
      </div>
    );
  }

  return content;
};

export default CosmicLoader;
