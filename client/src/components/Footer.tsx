import { Link } from "wouter";
import { Phone, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background/80 mt-auto">
      {/* Crisis Banner */}
      <div className="bg-red-700 text-white py-3">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span>
              <strong>Veterans Crisis Line:</strong> Call 988, Press 1 | Text 838255 | Available 24/7
            </span>
          </div>
          <div className="flex gap-2">
            <a
              href="tel:988"
              className="px-3 py-1 bg-white text-red-700 rounded font-bold text-sm hover:bg-red-50 transition-colors"
            >
              Call 988
            </a>
            <a
              href="sms:838255"
              className="px-3 py-1 border border-white text-white rounded text-sm hover:bg-white/10 transition-colors"
            >
              Text 838255
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-10">
        <div className="container">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-accent" />
                <span className="font-bold text-background" style={{ fontFamily: "Oswald, sans-serif" }}>
                  ServiceSource Connect
                </span>
              </div>
              <p className="text-xs text-background/60 leading-relaxed">
                Connecting veterans, service members, and military families to the resources they may qualify for — across all 50 states.
              </p>
            </div>

            {/* Resources */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-background/50 mb-3">Resources</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/category/housing" className="text-background/70 hover:text-background transition-colors">Housing</Link></li>
                <li><Link href="/category/healthcare" className="text-background/70 hover:text-background transition-colors">Healthcare</Link></li>
                <li><Link href="/category/mental-health" className="text-background/70 hover:text-background transition-colors">Mental Health</Link></li>
                <li><Link href="/category/education" className="text-background/70 hover:text-background transition-colors">Education</Link></li>
                <li><Link href="/category/employment" className="text-background/70 hover:text-background transition-colors">Employment</Link></li>
              </ul>
            </div>

            {/* Platform */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-background/50 mb-3">Platform</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/lenders" className="text-background/70 hover:text-background transition-colors">VA Loan Lenders</Link></li>
                <li><Link href="/saved" className="text-background/70 hover:text-background transition-colors">Saved Items</Link></li>
                <li><Link href="/submit-resource" className="text-background/70 hover:text-background transition-colors">Submit a Resource</Link></li>
                <li><Link href="/about" className="text-background/70 hover:text-background transition-colors">About & FAQ</Link></li>
                <li><Link href="/privacy" className="text-background/70 hover:text-background transition-colors">Privacy & Terms</Link></li>
              </ul>
            </div>

            {/* Crisis */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-background/50 mb-3">Crisis Support</div>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="tel:988" className="text-background/70 hover:text-background transition-colors">
                    Veterans Crisis Line: 988
                  </a>
                </li>
                <li>
                  <a href="sms:838255" className="text-background/70 hover:text-background transition-colors">
                    Text: 838255
                  </a>
                </li>
                <li>
                  <a href="https://www.veteranscrisisline.net" target="_blank" rel="noopener noreferrer" className="text-background/70 hover:text-background transition-colors">
                    VeteransCrisisLine.net
                  </a>
                </li>
                <li>
                  <Link href="/crisis" className="text-background/70 hover:text-background transition-colors">
                    Crisis Resources
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-background/10 pt-6">
            <p className="text-xs text-background/50 leading-relaxed max-w-3xl">
              <strong className="text-background/70">Disclaimer:</strong> ServiceSource Connect provides options and information only — not legal, financial, medical, or professional advice. Resource listings use language such as "may qualify" because eligibility varies by individual circumstance. Always verify eligibility and details directly with each provider. Lender listings are for informational purposes only and do not constitute an endorsement.
            </p>
            <p className="text-xs text-background/40 mt-3">
              © {new Date().getFullYear()} ServiceSource Connect. All rights reserved. Serving all 50 U.S. states.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
