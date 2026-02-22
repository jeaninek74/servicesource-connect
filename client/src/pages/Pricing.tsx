import { PricingSection } from "@/components/PricingSection";
import { Link } from "wouter";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div
        className="py-12"
        style={{
          background: "linear-gradient(135deg, oklch(0.22 0.08 250) 0%, oklch(0.18 0.06 250) 100%)",
        }}
      >
        <div className="container text-center">
          <h1
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            style={{ fontFamily: "Oswald, sans-serif" }}
          >
            Plans & Pricing
          </h1>
          <p className="text-white/70 max-w-xl mx-auto">
            Start free for 7 days. Upgrade anytime to unlock unlimited access for veterans, service members, and military families.
          </p>
          <div className="mt-4">
            <Link href="/" className="text-white/50 hover:text-white text-sm transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <PricingSection />
    </div>
  );
}
