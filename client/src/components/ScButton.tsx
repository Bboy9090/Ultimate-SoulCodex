import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { triggerHapticFeedback } from "../lib/haptics";

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
  const baseStyles = "relative inline-flex items-center justify-center font-sans font-semibold tracking-tight transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none rounded-xl overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-br from-[#FFD700] via-[#F2C94C] to-[#D4A85F] text-[#0D0B21] shadow-[0_0_20px_rgba(212,168,95,0.3)] hover:shadow-[0_0_35px_rgba(212,168,95,0.5)]",
    secondary: "bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-white/10 hover:border-white/20",
    ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5",
    outline: "bg-transparent text-[#FFD700] border border-[#FFD700]/30 hover:border-[#FFD700] hover:bg-[#FFD700]/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-9 py-4 text-base",
  };

  return (
    <motion.button
      {...props}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -2 } : undefined}
      whileTap={{ scale: 0.98, y: 0 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      onClick={(e) => {
        triggerHapticFeedback();
        props.onClick?.(e);
      }}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      <span className={cn("relative z-10", loading && "opacity-70")}>{children}</span>
      
      {/* Premium Glass Shine */}
      {variant === "primary" && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
    </motion.button>
  );
};

export default ScButton;
