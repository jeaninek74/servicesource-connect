import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  MapPin,
  ArrowRight,
  CheckCircle,
  Globe,
  Phone,
  Loader2,
} from "lucide-react";

interface NearbyResourcesProps {
  state: string;
  categorySlugs?: string[];
}

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

export default function NearbyResources({ state, categorySlugs }: NearbyResourcesProps) {
  const nearbyQuery = trpc.resources.nearby.useQuery(
    { state, categorySlugs, limit: 3 },
    { enabled: !!state }
  );

  const stateName = STATE_NAMES[state] ?? state;

  if (nearbyQuery.isLoading) {
    return (
      <Card className="border-[#1B2A4A]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#1B2A4A]">
            <MapPin className="w-4 h-4 text-[#C8A84B]" />
            Nearby Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-[#1B2A4A]/40" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const items = nearbyQuery.data ?? [];

  if (items.length === 0) {
    return (
      <Card className="border-[#1B2A4A]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#1B2A4A]">
            <MapPin className="w-4 h-4 text-[#C8A84B]" />
            Nearby Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            No local resources found for {stateName} yet.{" "}
            <Link href="/submit-resource" className="text-[#1B2A4A] underline underline-offset-2">
              Submit one
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#1B2A4A]/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-[#1B2A4A]">
            <MapPin className="w-4 h-4 text-[#C8A84B]" />
            Nearby Resources
          </CardTitle>
          <span className="text-xs text-gray-400 font-normal">{stateName}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {items.map((resource) => (
            <Link key={resource.id} href={`/resource/${resource.id}`}>
              <div className="group flex items-start gap-3 p-3 rounded-lg hover:bg-[#1B2A4A]/5 transition-colors cursor-pointer border border-transparent hover:border-[#1B2A4A]/10">
                {/* Verification dot */}
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    resource.verifiedLevel === "partner_verified"
                      ? "bg-[#C8A84B]"
                      : resource.verifiedLevel === "verified"
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-[#1B2A4A] leading-snug truncate">
                    {resource.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {resource.coverageArea === "national" ? (
                      <span className="flex items-center gap-0.5 text-xs text-gray-400">
                        <Globe className="w-3 h-3" />
                        National
                      </span>
                    ) : resource.city ? (
                      <span className="flex items-center gap-0.5 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" />
                        {resource.city}, {resource.state}
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" />
                        {resource.state}
                      </span>
                    )}
                    {resource.verifiedLevel !== "unverified" && (
                      <span className="flex items-center gap-0.5 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        {resource.verifiedLevel === "partner_verified" ? "Partner" : "Verified"}
                      </span>
                    )}
                    {resource.phone && (
                      <span className="flex items-center gap-0.5 text-xs text-gray-400">
                        <Phone className="w-3 h-3" />
                        {resource.phone}
                      </span>
                    )}
                  </div>
                  {resource.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {resource.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#1B2A4A] flex-shrink-0 mt-1 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing top {items.length} resource{items.length !== 1 ? "s" : ""} in {stateName}
          </p>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-[#1B2A4A] hover:text-[#1B2A4A] h-7 px-2"
          >
            <Link href="/map">
              View on Map <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
