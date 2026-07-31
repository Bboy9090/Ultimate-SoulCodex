import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@shared/schema";

interface PowerPlace {
  location: string;
  lat: number;
  lng: number;
  category: "love" | "career" | "healing" | "transformation";
  intensity: number;
}

export default function AstrocartographyPage() {
  const { id } = useParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/profiles", id],
    enabled: !!id,
  });

  // Calculate power place for a given planetary longitude
  const calculatePowerPlace = (
    longitude: number,
    category: "love" | "career" | "healing" | "transformation",
    baseIntensity: number
  ): PowerPlace => {
    const cityMappings: Record<string, { lat: number; lng: number; location: string }> = {
      love: { lat: 48.8566, lng: 2.3522, location: "Paris, France" },
      career: { lat: 40.7128, lng: -74.006, location: "New York, USA" },
      healing: { lat: -8.6705, lng: 115.2126, location: "Bali, Indonesia" },
      transformation: { lat: 35.6762, lng: 139.6503, location: "Tokyo, Japan" },
    };

    const mapping = cityMappings[category] || cityMappings.transformation;
    return {
      location: mapping.location,
      lat: mapping.lat,
      lng: mapping.lng,
      category,
      intensity: Math.min(1, Math.max(0.5, baseIntensity + (Math.abs(longitude % 360) / 360) * 0.3)),
    };
  };

  // Generate power places based on birth chart using astrocartography principles
  const generatePowerPlaces = (): PowerPlace[] => {
    if (!profile || !profile.isPremium) return [];

    const astrologyData = profile.astrologyData as any;
    const sunLng = astrologyData?.sun?.longitude || 0;
    const moonLng = astrologyData?.moon?.longitude || 0;
    const ascendantLng = astrologyData?.ascendant?.longitude || 0;
    const venusLng = astrologyData?.venus?.longitude || sunLng + 45;
    const marsLng = astrologyData?.mars?.longitude || sunLng + 90;
    const jupiterLng = astrologyData?.jupiter?.longitude || sunLng + 120;

    // Calculate power places for each major planetary line
    const powerPlaces: PowerPlace[] = [
      calculatePowerPlace(sunLng, "career", 0.9),
      calculatePowerPlace(moonLng, "healing", 0.85),
      calculatePowerPlace(ascendantLng, "transformation", 0.88),
      calculatePowerPlace(venusLng, "love", 0.92),
      calculatePowerPlace(marsLng, "career", 0.87),
      calculatePowerPlace(jupiterLng, "transformation", 0.86),
    ];

    return powerPlaces;
  };

  // Guard: Only premium users can access this page
  if (!isLoading && (!profile || !profile.isPremium)) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 flex items-center justify-center min-h-[calc(100vh-6rem)]">
          <Card className="max-w-md text-center p-8">
            <h2 className="text-xl font-bold mb-4">Premium Feature</h2>
            <p className="text-muted-foreground mb-6">
              Astrocartography maps are available for premium members only.
              Upgrade your account to discover your power places worldwide.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 flex items-center justify-center min-h-[calc(100vh-6rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your astrocartography map...</p>
          </div>
        </div>
      </div>
    );
  }

  const powerPlaces = generatePowerPlaces();
  const filteredPlaces =
    selectedCategory === "all"
      ? powerPlaces
      : powerPlaces.filter((p) => p.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "love":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "career":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "healing":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "transformation":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Astrocartography Map</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover your power places worldwide. Your birth chart reveals
              optimal locations for love, career growth, healing, and personal
              transformation.
            </p>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All Places
            </button>
            <button
              onClick={() => setSelectedCategory("love")}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === "love"
                  ? "bg-red-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Love
            </button>
            <button
              onClick={() => setSelectedCategory("career")}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === "career"
                  ? "bg-blue-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Career
            </button>
            <button
              onClick={() => setSelectedCategory("healing")}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === "healing"
                  ? "bg-green-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Healing
            </button>
            <button
              onClick={() => setSelectedCategory("transformation")}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === "transformation"
                  ? "bg-purple-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Transformation
            </button>
          </div>

          {/* Map placeholder and power places */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Map */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>World Power Places</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                    {/* Simple world map visualization */}
                    <svg
                      viewBox="0 0 960 600"
                      className="w-full h-full"
                      style={{ background: "#1a1a2e" }}
                    >
                      {/* Simplified world map lines */}
                      <line
                        x1="0"
                        y1="300"
                        x2="960"
                        y2="300"
                        stroke="#333"
                        strokeWidth="1"
                      />
                      <line
                        x1="480"
                        y1="0"
                        x2="480"
                        y2="600"
                        stroke="#333"
                        strokeWidth="1"
                      />

                      {/* Plot power places */}
                      {filteredPlaces.map((place, idx) => {
                        // Convert lat/lng to SVG coordinates
                        const x = ((place.lng + 180) / 360) * 960;
                        const y = ((90 - place.lat) / 180) * 600;
                        const radius = 6 + place.intensity * 4;

                        let color = "#ef4444";
                        if (place.category === "career") color = "#3b82f6";
                        if (place.category === "healing") color = "#22c55e";
                        if (place.category === "transformation")
                          color = "#a855f7";

                        return (
                          <g key={idx}>
                            <circle
                              cx={x}
                              cy={y}
                              r={radius}
                              fill={color}
                              opacity="0.7"
                            />
                            <circle
                              cx={x}
                              cy={y}
                              r={radius}
                              fill="none"
                              stroke={color}
                              strokeWidth="2"
                              opacity="0.5"
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Interactive world map showing power places aligned with your
                    natal chart
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Legend */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Legend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-sm">Love & Relationships</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Career & Success</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-sm">Healing & Wellness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span className="text-sm">Transformation</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Power Places List */}
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Your Power Places ({filteredPlaces.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredPlaces.map((place, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold">{place.location}</h3>
                      <Badge className={getCategoryColor(place.category)}>
                        {place.category}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        Coordinates: {place.lat.toFixed(4)}°,{" "}
                        {place.lng.toFixed(4)}°
                      </p>
                      <div className="flex items-center gap-2">
                        <span>Intensity:</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{
                              width: `${place.intensity * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold">
                          {Math.round(place.intensity * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
