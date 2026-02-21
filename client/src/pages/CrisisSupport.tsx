import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MessageSquare, Globe, ArrowLeft, Heart, Shield, AlertTriangle } from "lucide-react";

const crisisResources = [
  {
    name: "Veterans Crisis Line",
    description: "Free, confidential support for veterans, service members, and their families. Available 24/7, 365 days a year. You do not need to be enrolled in VA benefits to call.",
    phone: "988",
    phoneLabel: "Call 988, Press 1",
    sms: "838255",
    smsLabel: "Text 838255",
    url: "https://www.veteranscrisisline.net/get-help-now/chat/",
    urlLabel: "Online Chat",
    primary: true,
  },
  {
    name: "988 Suicide & Crisis Lifeline",
    description: "National crisis line for anyone in suicidal crisis or emotional distress. Available 24/7.",
    phone: "988",
    phoneLabel: "Call 988",
    sms: "988",
    smsLabel: "Text 988",
    url: "https://988lifeline.org",
    urlLabel: "Website",
    primary: false,
  },
  {
    name: "Crisis Text Line",
    description: "Free, 24/7 text-based mental health support. Text HOME to 741741 to connect with a trained crisis counselor.",
    sms: "741741",
    smsLabel: "Text HOME to 741741",
    url: "https://www.crisistextline.org",
    urlLabel: "Website",
    primary: false,
  },
  {
    name: "VA Mental Health Services",
    description: "The VA provides a full range of mental health services including same-day mental health care at VA facilities. Call your local VA or the Veterans Crisis Line.",
    phone: "1-800-827-1000",
    phoneLabel: "Call VA Benefits",
    url: "https://www.mentalhealth.va.gov",
    urlLabel: "VA Mental Health",
    primary: false,
  },
  {
    name: "SAMHSA National Helpline",
    description: "Free, confidential treatment referral and information service for mental health and substance use disorders. Available 24/7.",
    phone: "1-800-662-4357",
    phoneLabel: "Call SAMHSA",
    url: "https://www.samhsa.gov/find-help/national-helpline",
    urlLabel: "Website",
    primary: false,
  },
  {
    name: "Military OneSource",
    description: "Free, confidential support for service members and their families, including mental health counseling referrals.",
    phone: "1-800-342-9647",
    phoneLabel: "Call Military OneSource",
    url: "https://www.militaryonesource.mil",
    urlLabel: "Website",
    primary: false,
  },
];

const safetySteps = [
  "If you or someone else is in immediate danger, call 911.",
  "Remove access to lethal means if possible and safe to do so.",
  "Stay with the person — do not leave them alone.",
  "Call the Veterans Crisis Line: 988, Press 1.",
  "Go to your nearest emergency room if needed.",
];

export default function CrisisSupport() {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Emergency Banner */}
      <div className="bg-red-700 text-white py-4">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              <div>
                <div className="font-bold text-lg">If this is a life-threatening emergency, call 911 immediately.</div>
                <div className="text-red-200 text-sm">Veterans Crisis Line: Call 988, Press 1 | Text 838255</div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <a
                href="tel:911"
                className="px-4 py-2 bg-white text-red-700 rounded-lg font-bold hover:bg-red-50 transition-colors"
              >
                Call 911
              </a>
              <a
                href="tel:988"
                className="px-4 py-2 border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-colors"
              >
                Call 988
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div
        className="py-8"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.08 250) 0%, oklch(0.18 0.06 250) 100%)" }}
      >
        <div className="container">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-6 w-6 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "Oswald, sans-serif" }}>
            Crisis Support Resources
          </h1>
          <p className="text-white/80 mt-2 max-w-xl">
            You are not alone. Help is available right now — free, confidential, and available 24 hours a day.
          </p>
        </div>
      </div>

      <div className="container mt-8 max-w-3xl">
        {/* Primary Crisis Line */}
        <Card className="border-2 border-red-300 bg-red-50 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-red-800 mb-1" style={{ fontFamily: "Oswald, sans-serif" }}>
                  Veterans Crisis Line
                </h2>
                <p className="text-red-700 text-sm mb-4">
                  Free, confidential support for veterans, service members, and their families. Available 24/7, 365 days a year. You do not need to be enrolled in VA benefits to call.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="tel:988" className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors">
                    <Phone className="h-4 w-4" /> Call 988, Press 1
                  </a>
                  <a href="sms:838255" className="flex items-center gap-2 px-4 py-2 border-2 border-red-600 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors">
                    <MessageSquare className="h-4 w-4" /> Text 838255
                  </a>
                  <a href="https://www.veteranscrisisline.net/get-help-now/chat/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 border-2 border-red-600 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors">
                    <Globe className="h-4 w-4" /> Online Chat
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Steps */}
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-5">
            <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Immediate Safety Steps
            </h3>
            <ol className="space-y-2">
              {safetySteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-amber-800">
                  <span className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <h2 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: "Oswald, sans-serif" }}>
          Additional Crisis & Mental Health Resources
        </h2>
        <div className="space-y-4">
          {crisisResources.slice(1).map((resource) => (
            <Card key={resource.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <h3 className="font-semibold text-foreground mb-1">{resource.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                <div className="flex flex-wrap gap-2">
                  {resource.phone && (
                    <a href={`tel:${resource.phone}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium">
                      <Phone className="h-4 w-4" /> {resource.phoneLabel}
                    </a>
                  )}
                  {resource.sms && (
                    <a href={`sms:${resource.sms}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium ml-3">
                      <MessageSquare className="h-4 w-4" /> {resource.smsLabel}
                    </a>
                  )}
                  {resource.url && (
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium ml-3">
                      <Globe className="h-4 w-4" /> {resource.urlLabel}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Supportive message */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="p-5 text-center">
            <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-foreground font-medium mb-2">
              Reaching out takes courage. You are not alone.
            </p>
            <p className="text-sm text-muted-foreground">
              Many veterans and service members have found their way through difficult times with the right support. Help is available right now, and it is okay to ask for it.
            </p>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center">
          <Link href="/category/mental-health">
            <Button variant="outline" className="gap-2">
              <Shield className="h-4 w-4" />
              Browse Mental Health Resources
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
