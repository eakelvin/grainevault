"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PortalButtonProps = {
  className?: string;
  children: React.ReactNode;
};

export function PortalButton({ className, children }: PortalButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortal = async () => {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Couldn't open billing portal.");
      }
      window.location.assign(data.url);
    } catch (portalError) {
      setError(
        portalError instanceof Error
          ? portalError.message
          : "Couldn't open billing portal."
      );
      setPending(false);
    }
  };

  return (
    <div>
      <Button
        type="button"
        disabled={pending}
        onClick={() => void openPortal()}
        className={cn("rounded-xl", className)}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Opening…
          </>
        ) : (
          children
        )}
      </Button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
