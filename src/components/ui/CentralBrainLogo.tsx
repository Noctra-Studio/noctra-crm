"use client";

import { m } from "framer-motion";

interface CentralBrainLogoProps {
  className?: string;
  isThinking?: boolean;
}

export function CentralBrainLogo({
  className,
  isThinking = false,
}: CentralBrainLogoProps) {
  return (
    <div className={className}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full">
        {/* Glow Effect */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient
            id="brainGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Neural Connections (Static paths, animated stroke) */}
        <g stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2">
          <m.path
            d="M100 100 L60 60 M100 100 L140 60 M100 100 L140 140 M100 100 L60 140 M100 100 L60 100 M100 100 L140 100 M100 100 L100 60 M100 100 L100 140"
            strokeDasharray="4 4"
            animate={{
              strokeDashoffset: isThinking ? [0, -20] : 0,
              opacity: isThinking ? [0.2, 0.5, 0.2] : 0.2,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </g>

        {/* Orbiting Nodes */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <m.circle
            key={i}
            cx={100 + 60 * Math.cos((angle * Math.PI) / 180)}
            cy={100 + 60 * Math.sin((angle * Math.PI) / 180)}
            r="4"
            fill={i % 2 === 0 ? "#10b981" : "#3b82f6"}
            animate={{
              scale: isThinking ? [1, 1.5, 1] : 1,
              opacity: isThinking ? [0.4, 1, 0.4] : 0.6,
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Central Core */}
        <m.circle
          cx="100"
          cy="100"
          r="25"
          fill="url(#brainGradient)"
          filter="url(#glow)"
          animate={{
            scale: isThinking ? [1, 1.1, 1] : [1, 1.05, 1],
            rotate: 360,
          }}
          transition={{
            scale: {
              duration: isThinking ? 0.8 : 3,
              repeat: Infinity,
              ease: "easeInOut",
            },
            rotate: {
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        />

        {/* Core Pulsing Rings */}
        <m.circle
          cx="100"
          cy="100"
          r="30"
          stroke="#10b981"
          strokeWidth="1"
          fill="none"
          animate={{
            scale: [1, 1.5],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      </svg>
    </div>
  );
}
