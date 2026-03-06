"use client";

import { LazyMotion, m, domAnimation } from "framer-motion";
import { useTranslations } from "next-intl";

interface TextRevealProps {
  text: string;
  className?: string;
}

export function TextReveal({ text, className }: TextRevealProps) {
  // Split text into words, preserving spaces
  // We'll split by space but keep the space in the array to render it properly
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring" as const,
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        style={{ overflow: "hidden", display: "flex", flexWrap: "wrap" }}
        variants={container}
        initial="hidden"
        animate="visible"
        className={className}>
      {words.map((word, index) => {
        // This simple check might fail for multi-word bracketed phrases if we split by space.
        // A better approach for the specific requirement "We are a [digital architecture firm]"
        // is to parse the full string first.
        return (
          <m.span
            variants={child}
            style={{ marginRight: "0.25em" }}
            key={`${index}-${word}`}>
            {word}
          </m.span>
        );
      })}
      </m.div>
    </LazyMotion>
  );
}

// Improved version that handles the bracketed phrases correctly
export function ManifestoText() {
  const t = useTranslations("HomePage");
  const text = t("manifesto.text");

  // Regex to split by brackets, capturing the content inside
  const parts = text.split(/(\[.*?\])/g);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.02 },
    },
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
    hidden: {
      opacity: 0,
      y: 10,
      filter: "blur(5px)",
    },
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.p
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="text-2xl md:text-3xl font-light text-neutral-400 leading-relaxed max-w-3xl mx-auto">
      {parts.map((part: string, index: number) => {
        if (part.startsWith("[") && part.endsWith("]")) {
          // Remove brackets
          const content = part.slice(1, -1);
          return (
            <m.span
              key={`bracket-${index}`}
              variants={child}
              className="inline-block text-white font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] mx-1">
              {content}
            </m.span>
          );
        }
        // Split regular text into words for smoother animation
        return part.split(" ").map((word: string, wIndex: number) => {
          if (!word) return null;
          return (
            <m.span
              key={`${index}-${wIndex}`}
              variants={child}
              className="inline-block mr-2">
              {word}
            </m.span>
          );
        });
      })}
      </m.p>
    </LazyMotion>
  );
}
