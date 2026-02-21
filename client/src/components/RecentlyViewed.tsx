import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Clock,
  ArrowRight,
  CheckCircle,
  Globe,
  MapPin,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function RecentlyViewed() {
  const recentQuery = trpc.recentlyViewed.list.useQuery();

  if (recentQuery.isLoading) {
    return (
      <Card className="border-[#1B2A4A]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#1B2A4A]">
            <Clock className="w-4 h-4 text-[#C8A84B]" />
            Recently Viewed
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

  const items = recentQuery.data ?? [];

  if (items.length === 0) {
    return (
      <Card className="border-[#1B2A4A]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-[#1B2A4A]">
            <Clock className="w-4 h-4 text-[#C8A84B]" />
            Recently Viewed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            Resources you view will appear here for quick access.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#1B2A4A]/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-[#1B2A4A]">
          <Clock className="w-4 h-4 text-[#C8A84B]" />
          Recently Viewed
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {items.map(({ resource, viewedAt }) => (
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
                    ) : resource.state ? (
                      <span className="flex items-center gap-0.5 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" />
                        {resource.city ? `${resource.city}, ` : ""}{resource.state}
                      </span>
                    ) : null}
                    {resource.verifiedLevel !== "unverified" && (
                      <span className="flex items-center gap-0.5 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        {resource.verifiedLevel === "partner_verified" ? "Partner" : "Verified"}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(viewedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#1B2A4A] flex-shrink-0 mt-1 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 px-1">
            Shows your last {items.length} viewed resource{items.length !== 1 ? "s" : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
