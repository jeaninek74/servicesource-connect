import { useRef, useState, useCallback, useEffect } from "react";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Phone,
  Globe,
  ExternalLink,
  Loader2,
  X,
  Map as MapIcon,
  Filter,
} from "lucide-react";
import { Link } from "wouter";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const STATE_CENTERS: Record<string, { lat: number; lng: number }> = {
  AL: { lat: 32.8, lng: -86.8 }, AK: { lat: 64.2, lng: -153.4 },
  AZ: { lat: 34.3, lng: -111.1 }, AR: { lat: 34.8, lng: -92.2 },
  CA: { lat: 36.8, lng: -119.4 }, CO: { lat: 39.0, lng: -105.5 },
  CT: { lat: 41.6, lng: -72.7 }, DE: { lat: 38.9, lng: -75.5 },
  FL: { lat: 27.8, lng: -81.8 }, GA: { lat: 32.2, lng: -83.4 },
  HI: { lat: 20.3, lng: -156.4 }, ID: { lat: 44.1, lng: -114.5 },
  IL: { lat: 40.0, lng: -89.2 }, IN: { lat: 39.8, lng: -86.1 },
  IA: { lat: 42.0, lng: -93.2 }, KS: { lat: 38.5, lng: -98.4 },
  KY: { lat: 37.7, lng: -84.9 }, LA: { lat: 31.2, lng: -91.8 },
  ME: { lat: 45.4, lng: -69.0 }, MD: { lat: 39.1, lng: -76.8 },
  MA: { lat: 42.2, lng: -71.5 }, MI: { lat: 44.3, lng: -85.4 },
  MN: { lat: 46.4, lng: -93.1 }, MS: { lat: 32.7, lng: -89.7 },
  MO: { lat: 38.5, lng: -92.5 }, MT: { lat: 47.0, lng: -110.5 },
  NE: { lat: 41.5, lng: -99.9 }, NV: { lat: 39.3, lng: -116.6 },
  NH: { lat: 43.7, lng: -71.6 }, NJ: { lat: 40.1, lng: -74.5 },
  NM: { lat: 34.5, lng: -106.2 }, NY: { lat: 42.9, lng: -75.5 },
  NC: { lat: 35.6, lng: -79.8 }, ND: { lat: 47.5, lng: -100.5 },
  OH: { lat: 40.4, lng: -82.8 }, OK: { lat: 35.6, lng: -97.5 },
  OR: { lat: 44.1, lng: -120.5 }, PA: { lat: 40.6, lng: -77.2 },
  RI: { lat: 41.7, lng: -71.5 }, SC: { lat: 33.9, lng: -80.9 },
  SD: { lat: 44.4, lng: -100.2 }, TN: { lat: 35.9, lng: -86.7 },
  TX: { lat: 31.5, lng: -99.3 }, UT: { lat: 39.3, lng: -111.1 },
  VT: { lat: 44.1, lng: -72.7 }, VA: { lat: 37.8, lng: -78.2 },
  WA: { lat: 47.4, lng: -120.5 }, WV: { lat: 38.6, lng: -80.6 },
  WI: { lat: 44.3, lng: -89.6 }, WY: { lat: 42.8, lng: -107.6 },
};

type ResourceItem = {
  id: number;
  name: string;
  description: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  phone: string | null;
  url: string | null;
  coverageArea: string;
  verifiedLevel: string;
  categoryId: number;
};

export default function ResourceMap() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [selectedState, setSelectedState] = useState("TX");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const categoriesQuery = trpc.resources.categories.useQuery();

  const resourcesQuery = trpc.resources.search.useQuery(
    {
      state: selectedState,
      categoryId:
        selectedCategory !== "all"
          ? categoriesQuery.data?.find((c) => c.slug === selectedCategory)?.id
          : undefined,
      militaryBranch: selectedBranch || undefined,
      limit: 50,
      offset: 0,
    },
    { enabled: !!selectedState }
  );

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];
  }, []);

  const placeMarkers = useCallback(
    (resources: ResourceItem[], map: google.maps.Map) => {
      clearMarkers();
      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder();
      }
      if (!infoWindowRef.current) {
        infoWindowRef.current = new window.google.maps.InfoWindow();
      }

      resources.forEach((resource) => {
        const addressStr = [resource.address, resource.city, resource.state]
          .filter(Boolean)
          .join(", ");

        if (!addressStr) return;

        geocoderRef.current!.geocode({ address: addressStr }, (results, status) => {
          if (status !== "OK" || !results || !results[0]) return;

          const position = results[0].geometry.location;

          // Color-coded pin by verified level
          const pinColor =
            resource.verifiedLevel === "partner_verified"
              ? "#C8A84B"
              : resource.verifiedLevel === "verified"
              ? "#22c55e"
              : "#64748b";

          const pinSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
              <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" fill="${pinColor}"/>
              <circle cx="14" cy="14" r="6" fill="white"/>
            </svg>`;

          const parser = new DOMParser();
          const pinEl = parser.parseFromString(pinSvg, "image/svg+xml").documentElement as unknown as HTMLElement;

          const marker = new window.google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            title: resource.name,
            content: pinEl,
          });

          marker.addListener("click", () => {
            setSelectedResource(resource);
            infoWindowRef.current!.setContent(`
              <div style="max-width:220px;font-family:sans-serif;">
                <strong style="font-size:13px;color:#1B2A4A;">${resource.name}</strong>
                ${resource.city ? `<p style="margin:4px 0 0;font-size:11px;color:#666;">${resource.city}, ${resource.state}</p>` : ""}
                ${resource.phone ? `<p style="margin:4px 0 0;font-size:11px;"><a href="tel:${resource.phone}" style="color:#1B2A4A;">${resource.phone}</a></p>` : ""}
                <a href="/resource/${resource.id}" style="display:inline-block;margin-top:6px;font-size:11px;color:#C8A84B;font-weight:600;">View Details →</a>
              </div>
            `);
            infoWindowRef.current!.open({ map, anchor: marker });
          });

          markersRef.current.push(marker);
        });
      });
    },
    [clearMarkers]
  );

  // Re-place markers when resources or map changes
  useEffect(() => {
    if (!mapReady || !mapRef.current || !resourcesQuery.data?.items) return;
    placeMarkers(resourcesQuery.data.items as ResourceItem[], mapRef.current);

    // Pan to selected state
    const center = STATE_CENTERS[selectedState];
    if (center) {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(7);
    }
  }, [mapReady, resourcesQuery.data, selectedState, placeMarkers]);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  const initialCenter = STATE_CENTERS[selectedState] ?? { lat: 39.5, lng: -98.35 };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1B2A4A] text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <MapIcon className="w-7 h-7 text-[#C8A84B]" />
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>
                Resource Map
              </h1>
              <p className="text-blue-200 text-sm">
                Explore veteran resources across all 50 states
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Filter:</span>
          </div>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {(categoriesQuery.data ?? []).map((cat) => (
                <SelectItem key={cat.slug} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Branches</SelectItem>
              <SelectItem value="army">Army</SelectItem>
              <SelectItem value="navy">Navy</SelectItem>
              <SelectItem value="air-force">Air Force</SelectItem>
              <SelectItem value="marines">Marines</SelectItem>
              <SelectItem value="coast-guard">Coast Guard</SelectItem>
              <SelectItem value="space-force">Space Force</SelectItem>
              <SelectItem value="national-guard">National Guard</SelectItem>
              <SelectItem value="reserves">Reserves</SelectItem>
            </SelectContent>
          </Select>

          {resourcesQuery.data && (
            <Badge variant="outline" className="text-xs">
              {resourcesQuery.data.total} resource{resourcesQuery.data.total !== 1 ? "s" : ""} found
            </Badge>
          )}

          {resourcesQuery.isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          )}
        </div>

        {/* Map + Sidebar layout */}
        <div className="flex gap-4 h-[600px]">
          {/* Map */}
          <div className="flex-1 rounded-xl overflow-hidden shadow-md border border-gray-200">
            <MapView
              className="w-full h-full"
              initialCenter={initialCenter}
              initialZoom={7}
              onMapReady={handleMapReady}
            />
          </div>

          {/* Sidebar: selected resource or resource list */}
          <div className="w-80 flex-shrink-0 overflow-y-auto space-y-2">
            {selectedResource ? (
              <Card className="shadow-md border-[#1B2A4A]/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-[#1B2A4A] text-sm leading-tight pr-2">
                      {selectedResource.name}
                    </h3>
                    <button
                      onClick={() => setSelectedResource(null)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {selectedResource.city && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {selectedResource.city}, {selectedResource.state}
                      </div>
                    )}
                    {selectedResource.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <a href={`tel:${selectedResource.phone}`} className="text-[#1B2A4A] hover:underline">
                          {selectedResource.phone}
                        </a>
                      </div>
                    )}
                    {selectedResource.url && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        <a
                          href={selectedResource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1B2A4A] hover:underline truncate"
                        >
                          Website
                        </a>
                      </div>
                    )}
                    {selectedResource.description && (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                        {selectedResource.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button asChild size="sm" className="flex-1 bg-[#1B2A4A] hover:bg-[#2a3f6f] text-xs">
                      <Link href={`/resource/${selectedResource.id}`}>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Full Details
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-2 flex gap-1">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        selectedResource.verifiedLevel === "partner_verified"
                          ? "border-amber-400 text-amber-700"
                          : selectedResource.verifiedLevel === "verified"
                          ? "border-green-400 text-green-700"
                          : "border-gray-300 text-gray-500"
                      }`}
                    >
                      {selectedResource.verifiedLevel === "partner_verified"
                        ? "Partner Verified"
                        : selectedResource.verifiedLevel === "verified"
                        ? "Verified"
                        : "Unverified"}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-600 capitalize">
                      {selectedResource.coverageArea}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <p className="text-xs text-gray-500 px-1">
                  Click a map pin to view resource details. Gold pins are partner-verified, green are verified.
                </p>
                {(resourcesQuery.data?.items ?? []).slice(0, 20).map((r) => (
                  <Card
                    key={r.id}
                    className="cursor-pointer hover:border-[#1B2A4A]/40 transition-colors"
                    onClick={() => setSelectedResource(r as ResourceItem)}
                  >
                    <CardContent className="p-3">
                      <p className="text-sm font-medium text-[#1B2A4A] leading-tight">{r.name}</p>
                      {r.city && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {r.city}, {r.state}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            Partner Verified
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            Verified
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-400" />
            Unverified
          </div>
        </div>
      </div>
    </div>
  );
}
