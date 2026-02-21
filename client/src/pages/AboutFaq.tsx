import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

const faqs = [
  {
    q: "Who is ServiceSource Connect for?",
    a: "ServiceSource Connect is designed for active duty service members, National Guard and Reserve members, transitioning service members, veterans, and military spouses and caregivers. If you have a connection to U.S. military service, this platform is for you.",
  },
  {
    q: "Is this platform free to use?",
    a: "Yes. ServiceSource Connect is completely free for all users. We do not charge for access to resources, lender listings, or any platform features.",
  },
  {
    q: "How are resources verified?",
    a: "Resources are reviewed by our team and assigned a verification level: Unverified (submitted but not yet reviewed), Verified (confirmed by our team), or Partner Verified (confirmed by a trusted partner organization). Always verify details directly with the provider.",
  },
  {
    q: "Does this platform provide professional advice?",
    a: "No. ServiceSource Connect provides options and information only — not legal, financial, medical, or professional advice. We use language like 'may qualify' and 'verify with provider' intentionally. Always consult qualified professionals for specific guidance.",
  },
  {
    q: "How do I update my profile?",
    a: "Sign in, then click your name in the top navigation and select 'Edit Profile'. You can update your military status, location, household information, and the categories you need support in at any time.",
  },
  {
    q: "What information do you collect?",
    a: "We collect only what is necessary to match you with relevant resources: military status, location (state/zip), household size, income band, VA eligibility, and disability rating band. We do not collect Social Security numbers, medical records, or detailed trauma history.",
  },
  {
    q: "How do I submit a resource for listing?",
    a: "Visit the 'Submit a Resource' page and fill out the form. All submissions are reviewed by our admin team before publishing. We may contact you for additional information.",
  },
  {
    q: "What should I do if I am in crisis?",
    a: "If you are in crisis or know someone who is, call 988 and press 1 for the Veterans Crisis Line (available 24/7), text 838255, or chat online at VeteransCrisisLine.net. If there is immediate danger, call 911.",
  },
  {
    q: "Are lenders on this platform endorsed by ServiceSource Connect?",
    a: "No. Lender listings are provided for informational purposes only and do not constitute an endorsement or recommendation. Always verify licensing, rates, and terms directly with each lender.",
  },
  {
    q: "Does this platform cover all 50 states?",
    a: "Yes. Our resource directory and lender listings include options across all 50 U.S. states, including national programs available to all eligible service members and veterans regardless of location.",
  },
];

export default function AboutFaq() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <div
        className="py-10"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.08 250) 0%, oklch(0.18 0.06 250) 100%)" }}
      >
        <div className="container">
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "Oswald, sans-serif" }}>
            About & FAQ
          </h1>
          <p className="text-white/70 mt-2 max-w-xl">
            Learn about ServiceSource Connect and find answers to common questions.
          </p>
        </div>
      </div>

      <div className="container mt-8 max-w-3xl">
        {/* About */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: "Oswald, sans-serif" }}>
              About ServiceSource Connect
            </h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                ServiceSource Connect is a personalized options engine built for the military community. We connect active duty service members, veterans, National Guard and Reserve members, and their families to resources across housing, healthcare, mental health, childcare, education, employment, benefits, VA loans, legal aid, financial assistance, food support, and community programs.
              </p>
              <p>
                Our platform covers all 50 U.S. states and includes both national programs and state-specific resources. Users complete a brief intake profile to receive a personalized dashboard showing matched options based on their military status, location, household, and specific needs.
              </p>
              <p>
                We are committed to privacy-first data collection, clear and supportive language, and ensuring that every person who has served — or supports someone who has — can quickly find the options they may qualify for.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Crisis */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-red-800 mb-3" style={{ fontFamily: "Oswald, sans-serif" }}>
              If You Are in Crisis
            </h2>
            <p className="text-red-700 mb-4">
              The Veterans Crisis Line provides free, confidential support 24 hours a day, 7 days a week, 365 days a year. You do not need to be enrolled in VA benefits to call.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="tel:988" className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors">
                Call 988, Press 1
              </a>
              <a href="sms:838255" className="px-4 py-2 border border-red-600 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors">
                Text 838255
              </a>
              <a href="https://www.veteranscrisisline.net/get-help-now/chat/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-red-600 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors">
                Online Chat
              </a>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <h2 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: "Oswald, sans-serif" }}>
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Have more questions? <Link href="/submit-resource" className="text-primary underline">Submit a resource</Link> or contact us through the platform.
        </div>
      </div>
    </div>
  );
}
