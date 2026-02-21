import { Card, CardContent } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <div
        className="py-10"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.08 250) 0%, oklch(0.18 0.06 250) 100%)" }}
      >
        <div className="container">
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "Oswald, sans-serif" }}>
            Privacy Policy & Terms of Use
          </h1>
          <p className="text-white/70 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="container mt-8 max-w-3xl">
        <Card>
          <CardContent className="p-6 space-y-6 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "Oswald, sans-serif" }}>
                Privacy-First Commitment
              </h2>
              <p>
                ServiceSource Connect is built on a privacy-first foundation. We collect only the minimum information necessary to match you with relevant resources. We do not sell your data, share it with advertisers, or use it for any purpose other than providing you with personalized resource matching.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "Oswald, sans-serif" }}>
                What We Collect
              </h2>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Account information (name, email) from your sign-in provider</li>
                <li>Military status category (active duty, veteran, etc.)</li>
                <li>Location (state and ZIP code)</li>
                <li>Household size and number of dependents</li>
                <li>Annual income band (general range, not exact income)</li>
                <li>VA eligibility status (yes/no/unsure)</li>
                <li>Disability rating band (general range, not medical records)</li>
                <li>Resource categories you have expressed interest in</li>
                <li>Resources and lenders you have saved</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "Oswald, sans-serif" }}>
                What We Do NOT Collect
              </h2>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Social Security numbers or government ID numbers</li>
                <li>Medical records or detailed health information</li>
                <li>Detailed trauma history or mental health diagnoses</li>
                <li>Financial account numbers or payment information</li>
                <li>Precise GPS location or real-time location tracking</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "Oswald, sans-serif" }}>
                How We Use Your Information
              </h2>
              <p className="text-sm">
                Your profile information is used exclusively to filter and rank resources and lenders that may be relevant to your situation. We do not use your information for advertising, profiling, or any commercial purpose beyond the core platform function.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "Oswald, sans-serif" }}>
                Terms of Use
              </h2>
              <div className="space-y-3 text-sm">
                <p>
                  <strong className="text-foreground">No Professional Advice:</strong> ServiceSource Connect provides options and information only. Nothing on this platform constitutes legal, financial, medical, or professional advice. Always consult qualified professionals for specific guidance.
                </p>
                <p>
                  <strong className="text-foreground">Eligibility Disclaimer:</strong> Resource listings include language such as "may qualify" because eligibility varies by individual circumstance. Always verify eligibility directly with each provider.
                </p>
                <p>
                  <strong className="text-foreground">Lender Disclaimer:</strong> Lender listings are for informational purposes only and do not constitute an endorsement. Verify licensing, rates, and terms directly with each lender.
                </p>
                <p>
                  <strong className="text-foreground">Accuracy:</strong> We make reasonable efforts to maintain accurate and current information, but we cannot guarantee that all listings are up to date. Contact providers directly to confirm details.
                </p>
                <p>
                  <strong className="text-foreground">Crisis Resources:</strong> If you are in crisis, call 988 and press 1 (Veterans Crisis Line), text 838255, or call 911 for immediate emergencies. This platform is not a crisis intervention service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "Oswald, sans-serif" }}>
                Data Security
              </h2>
              <p className="text-sm">
                All data is transmitted over TLS (HTTPS). We implement rate limiting on search endpoints and audit logging for security events. Your data is stored securely and access is restricted to authorized personnel only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3" style={{ fontFamily: "Oswald, sans-serif" }}>
                Your Rights
              </h2>
              <p className="text-sm">
                You may update or delete your profile information at any time by signing in and editing your profile. To request complete account deletion, contact us through the platform.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
