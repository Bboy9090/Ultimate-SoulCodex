import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { birthDataSchema, type BirthData } from "@shared/schema";
import { generateOfflineCodexProfile, type OfflineCodexProfile } from "@soulcodex/core";
import { apiRequest } from "@/lib/queryClient";
import { saveOfflineProfile } from "@/lib/offlineProfileStore";
import { loadActiveProfile, saveActiveProfile } from "@/lib/ActiveProfileRepository";
import { reconcileActiveProfile, reconcileOfflineProfile } from "@/lib/profileVerificationReconciliation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/navigation";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Calendar, Check, Clock, Compass, Database, Loader2, MapPin, ShieldCheck, Sparkles, User } from "lucide-react";

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

async function requestVerificationWhenOnline(data: BirthData, localProfile: OfflineCodexProfile): Promise<void> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  try {
    const response = await apiRequest("POST", "/api/verification/profile", {
      birthDate: data.birthDate,
      ...(data.birthTime ? { birthTime: data.birthTime } : {}),
      timezone: data.timezone,
      latitude: data.latitude,
      longitude: data.longitude,
    });
    const verification = await response.json();
    const syncedAt = verification.updatedAt || new Date().toISOString();

    const currentActive = loadActiveProfile().profile;
    if (currentActive) {
      const activeSave = saveActiveProfile(reconcileActiveProfile(currentActive, verification, syncedAt));
      if (!activeSave.success) throw new Error(activeSave.error || "Verified profile reconciliation failed.");
    }

    await saveOfflineProfile(reconcileOfflineProfile(localProfile, verification, syncedAt));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("soulcodex:profile-updated", { detail: { localId: localProfile.id, verifiedAt: syncedAt } }));
    }
  } catch (error) {
    console.warn("[local-first-create] Requested online verification could not complete; local profile remains available", error);
  }
}

export default function LocalFirstInputForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [verifyOnline, setVerifyOnline] = useState(false);
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const form = useForm<BirthData>({
    resolver: zodResolver(birthDataSchema),
    defaultValues: { name: "", birthDate: "", birthTime: "", birthLocation: "", timezone: browserTimezone, latitude: "", longitude: "" },
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
        if (Array.isArray(matches) && matches[0]) result = { lat: String(matches[0].lat), lng: String(matches[0].lon), timezone: browserTimezone };
      }
      if (!result) {
        toast({ title: "Location not found offline", description: "Enter latitude, longitude, and timezone manually below. The reading can still be generated on this device.", variant: "destructive" });
        return;
      }
      form.setValue("latitude", result.lat, { shouldValidate: true });
      form.setValue("longitude", result.lng, { shouldValidate: true });
      form.setValue("timezone", result.timezone, { shouldValidate: true });
      toast({ title: "Location ready", description: "Coordinates and timezone were filled for local calculation." });
    } catch (error) {
      console.warn("[local-first-create] Location lookup failed", error);
      toast({ title: "Online lookup unavailable", description: "Use the manual coordinate fields. Profile generation itself still works offline.", variant: "destructive" });
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
        id: profile.id, name: profile.name, codename: profile.name, birthDate: profile.birthDate,
        birthTime: profile.birthTime ?? undefined, birthLocation: profile.birthLocation, timezone: profile.timezone,
        latitude: profile.latitude ?? undefined, longitude: profile.longitude ?? undefined, birthplace: { city: profile.birthLocation },
        sunSign: profile.astrologyData.sunSign, moonSign: profile.astrologyData.moonSign, risingSign: profile.astrologyData.risingSign,
        astrologyData: profile.astrologyData, lifePathNumber: profile.numerologyData.lifePath, numerologyData: profile.numerologyData,
        archetype: profile.archetypeData.title, synthesis: profile.depthInterpretation, createdAt: profile.createdAt, updatedAt: profile.updatedAt,
      });
      if (!activeSave.success) throw new Error(activeSave.error || "The active profile could not be registered.");

      if (verifyOnline) {
        void requestVerificationWhenOnline(data, profile);
      }

      toast({
        title: "Soul Codex created on this device",
        description: verifyOnline
          ? "Your local reading is ready. You chose astronomy verification; only the calculation inputs needed for that check are sent, and the evidence merges back into this same local profile."
          : "Your local reading is ready. No profile data was uploaded for verification.",
      });
      setLocation(`/profile/${profile.id}`);
    } catch (error) {
      console.error("Local profile creation failed", error);
      toast({ title: "Unable to create profile", description: error instanceof Error ? error.message : "The local reading could not be generated.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const inputClass = "h-12 rounded-xl border-white/10 bg-white/[0.045] px-4 text-foreground shadow-inner placeholder:text-muted-foreground/55 focus-visible:border-primary/60 focus-visible:ring-primary/20";

  return (
    <div className="codex-page min-h-screen text-foreground">
      <Navigation />
      <main className="codex-shell pb-20 pt-28 sm:pt-32">
        <section className="mx-auto mb-10 max-w-3xl text-center">
          <div className="codex-eyebrow mb-4"><Sparkles className="h-3.5 w-3.5" /> Build your identity map</div>
          <h1 className="codex-display text-4xl font-semibold tracking-[-0.035em] sm:text-6xl">Start with the facts.<br /><span className="codex-gold-text">Then go deeper.</span></h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Your birth information anchors the Codex. The first reading is created locally on this device. Online astronomy verification happens only when you explicitly choose it.</p>
        </section>

        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Card className="codex-panel overflow-hidden border-white/10 bg-card/75 shadow-2xl">
            <CardContent className="p-0">
              <div className="border-b border-white/8 px-5 py-5 sm:px-8">
                <div className="flex items-start gap-3">
                  <div className="codex-icon-well"><Compass className="h-5 w-5" /></div>
                  <div><p className="font-semibold">Birth coordinates</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Use the most accurate information you have. Unknown time is better than invented precision.</p></div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7 p-5 sm:p-8">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel className="codex-field-label"><User className="h-4 w-4" /> Full name</FormLabel><FormControl><Input {...field} className={inputClass} placeholder="Enter your full name" data-testid="input-name" /></FormControl><FormMessage /></FormItem>
                  )} />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField control={form.control} name="birthDate" render={({ field }) => (
                      <FormItem><FormLabel className="codex-field-label"><Calendar className="h-4 w-4" /> Birth date</FormLabel><FormControl><Input {...field} className={inputClass} type="date" data-testid="input-birth-date" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="birthTime" render={({ field }) => (
                      <FormItem><FormLabel className="codex-field-label"><Clock className="h-4 w-4" /> Birth time <span className="ml-auto text-[11px] font-normal text-muted-foreground">optional when unknown</span></FormLabel><FormControl><Input {...field} className={inputClass} type="time" data-testid="input-birth-time" /></FormControl><FormMessage /><p className="text-xs leading-5 text-muted-foreground">Leave this blank if you do not know it. Soul Codex accepts unknown time and keeps time-dependent layers unresolved rather than manufacturing precision.</p></FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="birthLocation" render={({ field }) => (
                    <FormItem><FormLabel className="codex-field-label"><MapPin className="h-4 w-4" /> Birth location</FormLabel><div className="flex flex-col gap-2 sm:flex-row"><FormControl><Input {...field} className={inputClass} placeholder="City, state/province, country" data-testid="input-birth-location" /></FormControl><Button type="button" variant="outline" className="h-12 rounded-xl border-primary/25 bg-primary/5 px-5 hover:bg-primary/10" onClick={resolveLocation} disabled={isLocating} data-testid="button-location-lookup">{isLocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}Resolve place</Button></div><FormMessage /><p className="text-xs leading-5 text-muted-foreground">Resolve place uses the built-in city list first. If no built-in match exists and you are online, the entered place text may be sent to OpenStreetMap/Nominatim for coordinates. Manual coordinates avoid that lookup.</p></FormItem>
                  )} />

                  <div className="rounded-2xl border border-white/8 bg-black/15 p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between gap-4"><div><p className="text-sm font-semibold">Calculation coordinates</p><p className="mt-1 text-xs text-muted-foreground">Usually filled automatically after resolving the place.</p></div><span className="codex-status"><Database className="h-3.5 w-3.5" /> inspectable</span></div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <FormField control={form.control} name="latitude" render={({ field }) => (<FormItem><FormLabel className="text-xs text-muted-foreground">Latitude</FormLabel><FormControl><Input {...field} className={inputClass} placeholder="40.7128" /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="longitude" render={({ field }) => (<FormItem><FormLabel className="text-xs text-muted-foreground">Longitude</FormLabel><FormControl><Input {...field} className={inputClass} placeholder="-74.0060" /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="timezone" render={({ field }) => (<FormItem><FormLabel className="text-xs text-muted-foreground">Timezone</FormLabel><FormControl><Input {...field} className={inputClass} placeholder="America/New_York" /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-primary/15 bg-primary/[0.035] p-4" htmlFor="verify-online">
                    <input
                      id="verify-online"
                      data-testid="checkbox-online-verification"
                      type="checkbox"
                      checked={verifyOnline}
                      onChange={(event) => setVerifyOnline(event.target.checked)}
                      className="mt-1 h-4 w-4 accent-[var(--primary)]"
                    />
                    <span>
                      <span className="block text-sm font-semibold">Verify supported placements online after creation</span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">Optional. If selected, Soul Codex sends only birth date, optional birth time, timezone, and coordinates to the astronomy verification endpoint. It does not create a server profile or invoke AI generation for this check. Leave this off to keep profile creation entirely on-device.</span>
                    </span>
                  </label>

                  <Button type="submit" className="codex-primary-cta h-14 w-full rounded-xl text-[15px] font-semibold" disabled={isCreating} data-testid="button-create-profile">{isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Building your Codex...</> : <>Create my Soul Codex <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="codex-panel p-5"><div className="mb-4 flex items-center gap-3"><div className="codex-icon-well codex-icon-trust"><ShieldCheck className="h-5 w-5" /></div><div><p className="font-semibold">Local first</p><p className="text-xs text-muted-foreground">Your reading does not wait on the cloud.</p></div></div><div className="space-y-3 text-sm text-muted-foreground">{["Generated on this device", "Offline copy stays available", "Online verification is opt-in"].map((item) => <div key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /><span>{item}</span></div>)}</div></div>
            <div className="codex-panel p-5"><p className="codex-kicker mb-2">Accuracy rule</p><p className="codex-display text-xl leading-snug">Missing data stays missing.</p><p className="mt-3 text-sm leading-6 text-muted-foreground">A useful Codex distinguishes verified facts, calculated results, symbolic interpretation, and unresolved information. Precision theater is still theater.</p></div>
          </aside>
        </div>
      </main>
    </div>
  );
}