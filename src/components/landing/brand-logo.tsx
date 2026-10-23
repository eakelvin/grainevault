import { useId } from "react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  size?: number;
  withWordmark?: boolean;
  subtitle?: string;
};

function Lightbulb({ size }: { size: number }) {
  const glowId = useId().replace(/:/g, "");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id={glowId} x1="8" y1="3" x2="24" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A5B4FC" />
          <stop offset="1" stopColor="#C4B5FD" />
        </linearGradient>
      </defs>
      <path
        d="M16 3.5c-4.7 0-8.4 3.6-8.4 8.2 0 2.9 1.5 5.4 3.8 6.9.7.4 1.1 1.2 1.1 2v.9h7v-.9c0-.8.4-1.6 1.1-2 2.3-1.5 3.8-4 3.8-6.9 0-4.6-3.7-8.2-8.4-8.2Z"
        fill="#818CF8"
        fillOpacity="0.18"
        stroke={`url(#${glowId})`}
        strokeWidth="1.7"
      />
      <path
        d="M13.2 16.2c.9 1.3 1.7 1.3 2.8 0 1.1 1.3 1.9 1.3 2.8 0"
        stroke="#FDE68A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.6 22.6h6.8M13.4 25h5.2M14.4 27.4h3.2"
        stroke={`url(#${glowId})`}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BrandLogo({
  className,
  markClassName,
  wordmarkClassName,
  size = 36,
  withWordmark = true,
  subtitle,
}: BrandLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-2 whitespace-nowrap",
        className
      )}
      aria-label={withWordmark ? undefined : "GraineVault"}
    >
      <span className={cn("inline-flex shrink-0", markClassName)}>
        <Lightbulb size={size} />
      </span>
      {withWordmark ? (
        subtitle ? (
          <span className="min-w-0">
            <span
              className={cn(
                "block font-semibold tracking-tight text-white",
                wordmarkClassName
              )}
            >
              GraineVault
            </span>
            <span className="block text-xs text-slate-400">{subtitle}</span>
          </span>
        ) : (
          <span
            className={cn(
              "font-semibold tracking-tight text-white",
              wordmarkClassName
            )}
          >
            GraineVault
          </span>
        )
      ) : null}
    </span>
  );
}
