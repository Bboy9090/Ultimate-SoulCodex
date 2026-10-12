import type { PropsWithChildren } from "react";
import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export const soulMotion = {
  ease: [0.22, 1, 0.36, 1] as const,
  fast: 0.18,
  standard: 0.32,
  slow: 0.55,
  stagger: 0.07,
};

export const soulRevealVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const soulStaggerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: soulMotion.stagger, delayChildren: 0.04 } },
};

type SoulRevealProps = PropsWithChildren<HTMLMotionProps<"div">> & {
  delay?: number;
};

export function SoulReveal({ children, className, delay = 0, ...props }: SoulRevealProps) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={reducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.16 }}
      variants={soulRevealVariants}
      transition={{ duration: reducedMotion ? 0 : soulMotion.standard, delay, ease: soulMotion.ease }}
      className={cn("will-change-transform", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SoulStagger({ children, className, ...props }: PropsWithChildren<HTMLMotionProps<"div">>) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={reducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={reducedMotion ? undefined : soulStaggerVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SoulStaggerItem({ children, className, ...props }: PropsWithChildren<HTMLMotionProps<"div">>) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      variants={reducedMotion ? undefined : soulRevealVariants}
      transition={{ duration: reducedMotion ? 0 : soulMotion.standard, ease: soulMotion.ease }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SoulInteractive({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLMotionProps<"div">>) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      whileHover={reducedMotion ? undefined : { y: -3, scale: 1.01 }}
      whileTap={reducedMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: reducedMotion ? 0 : soulMotion.fast, ease: soulMotion.ease }}
      className={cn("transform-gpu", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
