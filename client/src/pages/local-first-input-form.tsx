import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { birthDataSchema, type BirthData } from "@shared/schema";
import { generateOfflineCodexProfile } from "@soulcodex/core";
import { apiRequest } from "@/lib/queryClient";
import { saveOfflineProfile } from "@/lib/offlineProfileStore";
import { saveActiveProfile } from "@/lib/ActiveProfileRepository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/navigation";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Loader2, MapPin, ShieldCheck, User } from "lucide-react";

const BUILT_IN_LOCATIONS: Record<string, { lat: string; lng: string; timezone: string }> = {
  "new york": { lat: "40.7128", lng: "-74.0060", timezone: "America/New_York" },
  "manhattan": { lat: "40.7831", lng: "-73.9712", timezone: "America/New_York" },
  "bronx": { lat: "40.8448", lng: "-73.8648", timezone: "America/New_York" },
  "brooklyn": { lat: "40.6782", lng: "-73.9442", timezone: "America/New_York" },
  "philadelphia": { lat: "39.9526", lng: "-75.1652", timezone: "America/New_York" },
  "los angeles": { lat: "34.0522", lng: "-118.2437", timezone: "America/Los_Angeles" },
  "chicago": { lat: "41.8781", lng: "-87.6298", timezone: "America/Chicago" },
  "miami": { lat: "25.7617", lng: "-80.1918", timezone: "America/New_York" },
  "san juan": { lat: "18.4655", lng: "-66.1057", timezone: "America/Puerto_Rico" },
  "la vega": { lat: "19.2221", lng: "-70.5296", timezone: "America/Santo_Domingo" },
  "santo domingo": { lat: "18.4861", lng: "-69.9312", timezone: "America/Santo_Domingo" },
  "london": { lat: "51.5074", lng: "-0.1278", timezone: "Europe/London" },
  "paris": { lat: "48.8566", lng: "2.3522", timezone: "Europe/Paris" },
  "tokyo": { lat: "35.6762", lng: "139.6503", timezone: "Asia/Tokyo" },
};

function builtInLocation(value: string) {
  const normalized = value.trim().toLowerCase();
  const match = Object.entries(BUILT_IN_LOCATIONS)
    .map(([name, location]) => ({ index: normalized.indexOf(name), name, location }))
    .filter(({ index }) => index >= 0)
    .sort((left, right) => left.index - right.index || right.name.length - left.name.length)[0];
  return match?.location ?? null;
}

async function syncProfileWhenOnline(data: BirthData, localId: string): Promise<void> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  try {
    const response = await apiRequest("POST", "/api/profiles", data);
    const remote = await response.json();
    localStorage.setItem(
      `soulcodex.offlineProfileRemote.v1.${localId}`,
      JSON.stringify({ remoteId: remote.id, syncedAt: new Date().toISOString() }),
    );
  } catch (error) {
    console.warn("[local-first-create] Cloud sync deferred; local profile remains available", error);
  }
}

export default function LocalFirstInputForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const form = useForm<BirthData>({
    resolver: zodResolver(birthDataSchema),
    defaultValues: {
      name: "",
      birthDate: "",
      birthTime: "",
      birthLocation: "",
      timezone: browserTimezone,
      latitude: "",
      longitude: "",
    },
  });

  const resolveLocation = async () => {
    const location = form.getValues("birthLocation");
    if (!location.trim()) {
      toast({ title: "Location required", description: "Enter the birth city before resolving coordinates.", variant: "destructive" });
      return;
    }

    setIsLocating(true);
    try {
      let result = builtInLocation(location);
      if (!result && (typeof navigator === "undefined" || navigator.onLine)) {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`);
        const matches = await response.json();
        if (Array.isArray(matches) && matches[0]) {
          result = {
            lat: String(matches[0].lat),
            lng: String(matches[0].lon),
            timezone: browserTimezone,
          };
        }
      }

      if (!result) {
        toast({
          title: "Location not found offline",
          description: "Enter latitude, longitude, and timezone manually below. The reading can still be generated on this device.",
          variant: "destructive",
        });
        return;
      }

      form.setValue("latitude", result.lat, { shouldValidate: true });
      form.setValue("longitude", result.lng, { shouldValidate: true });
      form.setValue("timezone", result.timezone, { shouldValidate: true });
      toast({ title: "Location ready", description: "Coordinates and timezone were filled for local calculation." });
    } catch (error) {
      console.warn("[local-first-create] Location lookup failed", error);
      toast({
        title: "Online lookup unavailable",
        description: "Use the manual coordinate fields. Profile generation itself still works offline.",
        variant: "destructive",
      });
    } finally {
      setIsLocating(false);
    }
  };

  const onSubmit = async (data: BirthData) => {
    setIsCreating(true);
    try {
      const profile = generateOfflineCodexProfile(data);
      await saveOfflineProfile(profile);

      const activeSave = saveActiveProfile({
        id: profile.id,
        codename: profile.name,
        birthDate: profile.birthDate,
        birthTime: profile.birthTime ?? undefined,
        birthLocation: profile.birthLocation,
        birthplace: {
          city: profile.birthLocation,
        },
        sunSign: profile.astrologyData.sunSign,
        moonSign: profile.astrologyData.moonSign,
        risingSign: profile.astrologyData.risingSign,
        astrologyData: profile.astrologyData,
        lifePathNumber: profile.numerologyData.lifePath,
        numerologyData: profile.numerologyData,
        archetype: profile.archetypeData.title,
        synthesis: profile.depthInterpretation,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      });

      if (!activeSave.success) {
        throw new Error(activeSave.error || "The active profile could not be registered.");
      }

      void syncProfileWhenOnline(data, profile.id);
      toast({
        title: "Soul Codex created on this device",
        description: "The full evidence-linked reading is saved locally and remains available without a connection.",
      });
      setLocation(`/profile/${profile.id}`);
    } catch (error) {
      console.error("Local profile creation failed", error);
      toast({
        title: "Unable to create profile",
        description: error instanceof Error ? error.message : "The local reading could not be generated.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Create Your{" "}
              <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text font-serif">Soul Codex</span>
            </h1>
            <p className="text-xl text-muted-foreground">Generated locally first, then synchronized when services are available.</p>
          </div>

          <Card className="cosmic-border mystical-glow bg-transparent border-0">
            <div className="cosmic-border-inner">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span>Private, local-first birth information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><User className="h-4 w-4" /> Full name</FormLabel>
                        <FormControl><Input {...field} placeholder="Enter your full name" data-testid="input-name" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="birthDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Birth date</FormLabel>
                          <FormControl><Input {...field} type="date" data-testid="input-birth-date" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="birthTime" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Clock className="h-4 w-4" /> Birth time</FormLabel>
                          <FormControl><Input {...field} type="time" data-testid="input-birth-time" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="birthLocation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Birth location</FormLabel>
                        <div className="flex gap-2">
                          <FormControl><Input {...field} placeholder="City, state/province, country" data-testid="input-birth-location" /></FormControl>
                          <Button type="button" variant="outline" onClick={resolveLocation} disabled={isLocating} data-testid="button-location-lookup">
                            {isLocating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Resolve
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
                      <FormField control={form.control} name="latitude" render={({ field }) => (
                        <FormItem><FormLabel>Latitude</FormLabel><FormControl><Input {...field} placeholder="40.7128" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="longitude" render={({ field }) => (
                        <FormItem><FormLabel>Longitude</FormLabel><FormControl><Input {...field} placeholder="-74.0060" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="timezone" render={({ field }) => (
                        <FormItem><FormLabel>Timezone</FormLabel><FormControl><Input {...field} placeholder="America/New_York" /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>

                    <Button type="submit" className="w-full bg-primary text-primary-foreground py-3 font-semibold" disabled={isCreating} data-testid="button-create-profile">
                      {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Generate and save on this device
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </div>
          </Card>

          <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
            The core reading is generated and stored on this device. Cloud sync is best effort. AI wording, account verification, and payments still require online services.
          </div>
        </div>
      </div>
    </div>
  );
}
