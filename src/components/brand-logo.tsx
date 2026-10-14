import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  size?: number;
  withWordmark?: boolean;
  subtitle?: string;
};

export function BrandLogo({
  className,
  markClassName,
  wordmarkClassName,
  size = 36,
  withWordmark = true,
  subtitle,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <Image
        src="/logo-mark.png"
        alt={withWordmark ? "" : "GraineVault"}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-xl", markClassName)}
        priority
      />
      {withWordmark ? (
        subtitle ? (
          <span className="min-w-0">
            <span
              className={cn("block font-semibold text-white", wordmarkClassName)}
            >
              GraineVault
            </span>
            <span className="block text-xs text-slate-400">{subtitle}</span>
          </span>
        ) : (
          <span className={cn("font-semibold text-white", wordmarkClassName)}>
            GraineVault
          </span>
        )
      ) : null}
    </span>
  );
}
