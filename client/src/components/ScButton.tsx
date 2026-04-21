import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScButtonProps extends Omit<HTMLMotionProps<"button">, "variant"> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const ScButton: React.FC<ScButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...props
}) => {
  const baseStyles = "relative inline-flex items-center justify-center font-serif tracking-wide transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none rounded-lg overflow-hidden";
  
  const variants = {
    primary: "bg-sc-gold text-sc-bg-ink hover:glow-strong shadow-lg",
    secondary: "bg-sc-bg-plum text-sc-ivory border border-sc-gold/20 hover:bg-sc-bg-violet",
    ghost: "bg-transparent text-sc-ivory hover:bg-sc-gold/5",
    outline: "bg-transparent text-sc-gold border border-sc-gold/40 hover:border-sc-gold hover:bg-sc-gold/5",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      <span className={cn(loading && "opacity-70")}>{children}</span>
      
      {/* Decorative inner glow for primary buttons */}
      {variant === "primary" && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
      )}
    </motion.button>
  );
};

export default ScButton;
