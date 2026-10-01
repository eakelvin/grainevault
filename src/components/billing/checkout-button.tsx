"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BillingInterval } from "@/lib/billing";
import { cn } from "@/lib/utils";

type CheckoutButtonProps = {
  interval: BillingInterval;
  className?: string;
  children: React.ReactNode;
};

export function CheckoutButton({
  interval,
  className,
  children,
}: CheckoutButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Couldn't start checkout.");
      }
      window.location.assign(data.url);
    } catch (startError) {
      setError(
        startError instanceof Error ? startError.message : "Couldn't start checkout."
      );
      setPending(false);
    }
  };

  return (
    <div className="mt-8 w-full space-y-2">
      <Button
        type="button"
        size="lg"
        disabled={pending}
        onClick={() => void startCheckout()}
        className={cn("h-11 w-full rounded-xl", className)}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting…
          </>
        ) : (
          children
        )}
      </Button>
      {error ? (
        <p role="alert" className="mt-2 text-center text-sm text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
