"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";
import type { AiStatusResponse } from "@/types";

export function useAiStatus() {
  const { aiStatus, aiStatusLoading, setAiStatus, setAiStatusLoading } =
    useAppStore();

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      setAiStatusLoading(true);
      try {
        const res = await fetch("/api/ai-status");
        const data = (await res.json()) as AiStatusResponse;
        if (!cancelled) setAiStatus(data);
      } catch {
        if (!cancelled)
          setAiStatus({ active: false, message: "Could not reach the server." });
      } finally {
        if (!cancelled) setAiStatusLoading(false);
      }
    }

    fetchStatus();
    // Re-check every 2 minutes
    const interval = setInterval(fetchStatus, 120_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setAiStatus, setAiStatusLoading]);

  return { aiStatus, aiStatusLoading };
}
