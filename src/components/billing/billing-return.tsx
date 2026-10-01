"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/app-context";

export function BillingReturn() {
  const searchParams = useSearchParams();
  const { refreshProfile } = useApp();
  const [message, setMessage] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    const billing = searchParams.get("billing");
    const sessionId = searchParams.get("session_id");
    if (billing !== "success" || !sessionId || ran.current) return;
    ran.current = true;

    const confirm = async () => {
      try {
        const response = await fetch("/api/billing/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        if (!response.ok) {
          throw new Error("Couldn't confirm checkout.");
        }
        await refreshProfile();
        setMessage("You're on Pro. Unlimited ideas are unlocked.");
      } catch {
        setMessage("Payment went through. Refresh in a moment if Pro isn't showing yet.");
      }
    };

    void confirm();
  }, [refreshProfile, searchParams]);

  if (!message) return null;

  return (
    <p
      role="status"
      className="mb-6 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200"
    >
      {message}
    </p>
  );
}
