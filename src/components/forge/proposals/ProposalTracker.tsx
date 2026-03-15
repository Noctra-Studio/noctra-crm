"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface ProposalTrackerProps {
  proposalId: string;
}

export function ProposalTracker({ proposalId }: ProposalTrackerProps) {
  const visitorIdRef = useRef<string>("");
  const startTimeRef = useRef<number>(Date.now());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Generate simple visitor ID for the session if not present
    if (!visitorIdRef.current) {
      visitorIdRef.current = Math.random().toString(36).substring(2, 11);
    }

    // Track initial view
    trackEvent("view");

    // Track heartbeat every 30 seconds to measure time spent
    heartbeatIntervalRef.current = setInterval(() => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      trackEvent("heartbeat", { timeSpentSeconds: timeSpent });
    }, 30000);

    // Intersection Observer to track section views
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute("data-section");
          if (sectionId) {
            trackEvent("scroll", { section: sectionId });
          }
        }
      });
    }, { threshold: 0.5 });

    const sections = document.querySelectorAll("section[data-section]");
    sections.forEach(s => observer.observe(s));

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      // Track final time spent on unmount
      const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000);
      trackEvent("heartbeat", { timeSpentSeconds: totalTime, isFinal: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId]);

  const trackEvent = async (type: string, metadata: any = {}) => {
    try {
      await fetch("/api/proposals/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId,
          eventType: type,
          metadata: {
            ...metadata,
            url: window.location.href,
            userAgent: navigator.userAgent,
          },
          visitorId: visitorIdRef.current,
        }),
      });
    } catch (err) {
      // Sliently fail for tracking
      console.error("Tracking failed", err);
    }
  };

  return null; // Invisible component
}
