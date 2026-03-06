"use client";

import { LazyMotion, m, domAnimation } from "framer-motion";

const fogVariant = {
  initial: { opacity: 0, filter: "blur(20px)", scale: 0.98 },
  animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
  exit: { opacity: 0, filter: "blur(20px)", scale: 0.98 },
};

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fogVariant}
        transition={{ duration: 0.7, ease: "easeInOut" }}>
        {children}
      </m.div>
    </LazyMotion>
  );
}
