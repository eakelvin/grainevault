import { Suspense } from "react";
import { PricingPage } from "@/components/pricing-page";

export default function PricingRoute() {
  return (
    <Suspense fallback={null}>
      <PricingPage />
    </Suspense>
  );
}
