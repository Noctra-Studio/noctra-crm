"use client";

import { useState, useEffect, useCallback } from "react";
import { FollowUpSuggestion, getPendingFollowUps } from "@/app/actions/followup";

const IGNORED_KEY = "forge_followup_ignored_ids";
const SNOOZED_KEY = "forge_followup_snoozed";

export function useFollowUps(enabled = true) {
  const [suggestions, setSuggestions] = useState<FollowUpSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSuggestions = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getPendingFollowUps();
      
      // Filter by localStorage
      const ignoredIds = JSON.parse(localStorage.getItem(IGNORED_KEY) || "[]");
      const snoozed: Record<string, string> = JSON.parse(localStorage.getItem(SNOOZED_KEY) || "{}");
      
      const now = new Date();
      
      const filtered = data.filter(s => {
        // Permanent ignore
        if (ignoredIds.includes(s.id)) return false;
        
        // Temporary snooze (3 days)
        if (snoozed[s.id]) {
          const expiry = new Date(snoozed[s.id]);
          if (expiry > now) return false;
        }
        
        return true;
      });

      setSuggestions(filtered);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const dismiss = (id: string, permanent: boolean) => {
    if (permanent) {
      const ignoredIds = JSON.parse(localStorage.getItem(IGNORED_KEY) || "[]");
      if (!ignoredIds.includes(id)) {
        ignoredIds.push(id);
        localStorage.setItem(IGNORED_KEY, JSON.stringify(ignoredIds));
      }
    } else {
      // Snooze for 3 days
      const snoozed: Record<string, string> = JSON.parse(localStorage.getItem(SNOOZED_KEY) || "{}");
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 3);
      snoozed[id] = expiry.toISOString();
      localStorage.setItem(SNOOZED_KEY, JSON.stringify(snoozed));
    }
    
    // Update local state immediately
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  return {
    suggestions,
    isLoading,
    refresh: fetchSuggestions,
    dismiss,
  };
}
