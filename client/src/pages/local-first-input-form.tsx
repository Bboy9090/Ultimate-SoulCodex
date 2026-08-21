import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import {
  birthDataSchema,
  isCoordinateWithinRange,
  isValidIanaTimezone,
  type BirthData,
} from "@shared/schema";
import type { OfflineCodexProfile } from "@soulcodex/core";
import { generateFoundationOfflineCodexProfile } from "@/lib/foundationOfflineCodex";
import { apiRequest } from "@/lib/queryClient";
import { saveOfflineProfile } from "@/lib/offlineProfileStore";
import { loadActiveProfile, saveActiveProfile } from "@/lib/ActiveProfileRepository";
import {
  reconcileActiveProfile,
  reconcileOfflineProfile,
} from "@/lib/profileVerificationReconciliation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Compass,
  Database,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

const BUILT_IN_LOCATIONS: Record<
  string,
  { lat: string; lng: string; timezone: string }
> = {
  "new york": { lat: "40.7128", lng: "-74.0060", timezone: "America/New_York" },
  manhattan: { lat: "40.7831", lng: "-73.9712", timezone: "America/New_York" },
  bronx: { lat: "40.8448", lng: "-73.8648", timezone: "America/New_York" },
  "bronx new york": { lat: "40.8448", lng: "-73.8648", timezone: "America/New_York" },
  brooklyn: { lat: "40.6782", lng: "-73.9442", timezone: "America/New_York" },
  philadelphia: { lat: "39.9526", lng: "-75.1652", timezone: "America/New_York" },
  "los angeles": { lat: "34.0522", lng: "-118.2437", timezone: "America/Los_Angeles" },
  chicago: { lat: "41.8781", lng: "-87.6298", timezone: "America/Chicago" },
  miami: { lat: "25.7617", lng: "-80.1918", timezone: "America/New_York" },
  "san juan": { lat: "18.4655", lng: "-66.1057", timezone: "America/Puerto_Rico" },
  "la vega": { lat: "19.2221", lng: "-70.5296", timezone: "America/Santo_Domingo" },
  "santo domingo": { lat: "18.4861", lng: "-69.9312", timezone: "America/Santo_Domingo" },
  london: { lat: "51.5074", lng: "-0.1278", timezone: "Europe/London" },
  paris: { lat: "48.8566", lng: "2.3522", timezone: "Europe/Paris" },
  tokyo: { lat: "35.6762", lng: "139.6503", timezone: "Asia/Tokyo" },
};

function builtInLocation(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const inputTokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  const match = Object.entries(BUILT_IN_LOCATIONS)
    .map(([name, location]) => ({
      index:
        normalized === name
          ? 0
          : name.split(/[^a-z0-9]+/).filter(Boolean).length < 2
            ? -1
            : inputTokens.findIndex((_, start) =>
                name
                  .split(/[^a-z0-9]+/)
                  .filter(Boolean)
                  .every((token, offset) => inputTokens[start + offset] === token),
              ),
      name,
      location,
    }))
    .filter(({ index }) => index >= 0)
    .sort(
      (left, right) =>
        left.index - right.index || right.name.length - left.name.length,
    )[0];
  return match?.location ?? null;
}

async function requestVerificationWhenOnline(
  data: BirthData,
  localProfile: OfflineCodexProfile,
): Promise<void> {
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
      const activeSave = saveActiveProfile(
        reconcileActiveProfile(currentActive, verification, syncedAt),
      );
      if (!activeSave.success) {
        throw new Error(
          activeSave.error || "Verified profile reconciliation failed.",
        );
      }
    }

    await saveOfflineProfile(
      reconcileOfflineProfile(localProfile, verification, syncedAt),
    );

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("soulcodex:profile-updated", {
          detail: { localId: localProfile.id, verifiedAt: syncedAt },
        }),
      );
    }
  } catch (error) {
    console.warn(
      "[local-first-create] Requested online verification could not complete; local profile remains available",
      error,
    );
  }
}

export default function LocalFirstInputForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [verifyOnline, setVerifyOnline] = useState(false);

  const form = useForm<BirthData>({
    resolver: zodResolver(birthDataSchema),
    defaultValues: {
      name: "",
      birthDate: "",
      birthTime: "",
      birthLocation: "",
      timezone: "",
      latitude: "",
      longitude: "",
    },
  });

  const birthTime = form.watch("birthTime");
  const timezone = form.watch("timezone");
  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");
  const exactChartInputsReady = Boolean(
    birthTime &&
      isValidIanaTimezone(timezone) &&
      isCoordinateWithinRange(latitude, -90, 90) &&
      isCoordinateWithinRange(longitude, -180, 180),
  );

  const resolveLocation = async () => {
    const location = form.getValues("birthLocation");
    if (!location.trim()) {
      toast({
        title: "Location required",
        description: "Enter the birth city before resolving coordinates.",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);
    try {
      let result = builtInLocation(location);

      if (!result) {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          toast({
            title: "Location not found offline",
            description:
              "Enter latitude, longitude, and the birth location's IANA timezone manually. The reading can still be generated on this device.",
            variant: "destructive",
          });
          return;
        }

        const response = await apiRequest("POST", "/api/location/resolve", {
          place: location.trim(),
        });
        const resolved = await response.json();
        result = {
          lat: String(resolved.latitude),
          lng: String(resolved.longitude),
          timezone: String(resolved.timezone),
        };
      }

      form.setValue("latitude", result.lat, { shouldValidate: true });
      form.setValue("longitude", result.lng, { shouldValidate: true });
      form.setValue("timezone", result.timezone, { shouldValidate: true });

      toast({
        title: "Birth location ready",
        description: `Coordinates and ${result.timezone} were resolved for the birth location.`,
      });
    } catch (error) {
      console.warn("[local-first-create] Location lookup failed", error);
      toast({
        title: "Online lookup unavailable",
        description:
          "Enter latitude, longitude, and the birth location's IANA timezone manually. Soul Codex will not substitute your current device timezone.",
        variant: "destructive",
      });
    } finally {
      setIsLocating(false);
    }
  };

  const onSubmit = async (data: BirthData) => {
    setIsCreating(true);
    try {
      const profile = generateFoundationOfflineCodexProfile(data);
      await saveOfflineProfile(profile);

      const activeSave = saveActiveProfile({
        id: profile.id,
        name: profile.name,
        codename: profile.name,
        birthDate: profile.birthDate,
        birthTime: profile.birthTime ?? undefined,
        birthLocation: profile.birthLocation,
        timezone: profile.timezone,
        latitude: profile.latitude ?? undefined,
        longitude: profile.longitude ?? undefined,
        birthplace: { city: profile.birthLocation },
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
        throw new Error(
          activeSave.error || "The active profile could not be registered.",
        );
      }

      if (verifyOnline) {
        void requestVerificationWhenOnline(data, profile);
      }

      toast({
        title: "Soul Codex created on this device",
        description: verifyOnline
          ? "Your local reading is ready. Astronomy verification was requested; supported placements will merge back into this same local profile when the evidence check finishes."
          : exactChartInputsReady
            ? "Your exact chart inputs are saved locally. Moon and Rising candidates are calculable, but Soul Codex will not promote them as chart facts until you choose Verify online."
            : "Your local reading is ready. No profile data was uploaded for verification.",
      });
      setLocation(`/profile/${profile.id}`);
    } catch (error) {
      console.error("Local profile creation failed", error);
      toast({
        title: "Unable to create profile",
        description:
          error instanceof Error
            ? error.message
            : "The local reading could not be generated.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const inputClass =
    "h-12 rounded-xl border-[var(--sc-line)] bg-white/[0.045] px-4 text-[var(--sc-ivory)] shadow-inner placeholder:text-[var(--sc-stone)]/70 focus-visible:border-[var(--sc-gold)]/60 focus-visible:ring-[var(--sc-gold)]/20";

  return (
    <div className="sc-app-shell">
      <Navigation />
      <main className="sc-page pb-20">
        <section className="mx-auto mb-10 max-w-3xl text-center">
          <div className="sc-eyebrow mb-4 justify-center">
            <Sparkles className="h-3.5 w-3.5" /> Build your identity map
          </div>
          <h1 className="sc-display sc-display-gradient text-4xl sm:text-6xl">
            Start with the facts.<br />Then go deeper.
          </h1>
          <p className="sc-lede mx-auto mt-5 max-w-2xl">
            Your birth information anchors the Codex. The first reading is created locally on this device. Online astronomy verification happens only when you explicitly choose it.
          </p>
        </section>

        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="sc-panel overflow-hidden">
            <div className="border-b border-[var(--sc-line)] px-5 py-5 sm:px-8">
              <div className="flex items-start gap-3">
                <div className="sc-icon-well"><Compass className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold text-[var(--sc-ivory)]">Birth coordinates</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">
                    Use the most accurate information you have. Unknown time is better than invented precision.
                  </p>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7 p-5 sm:p-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-[var(--sc-ivory-soft)]"><User className="h-4 w-4" /> Full name</FormLabel>
                      <FormControl><Input {...field} className={inputClass} placeholder="Enter your full name" data-testid="input-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-[var(--sc-ivory-soft)]"><Calendar className="h-4 w-4" /> Birth date</FormLabel>
                        <FormControl><Input {...field} className={inputClass} type="date" data-testid="input-birth-date" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-[var(--sc-ivory-soft)]"><Clock className="h-4 w-4" /> Birth time <span className="ml-auto text-[11px] font-normal text-[var(--sc-stone)]">optional when unknown</span></FormLabel>
                        <FormControl><Input {...field} className={inputClass} type="time" data-testid="input-birth-time" /></FormControl>
                        <FormMessage />
                        <p className="text-xs leading-5 text-[var(--sc-stone)]">Leave this blank if you do not know it. Exact time unlocks time-sensitive calculation candidates; it is never invented.</p>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="birthLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-[var(--sc-ivory-soft)]"><MapPin className="h-4 w-4" /> Birth location</FormLabel>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <FormControl><Input {...field} className={inputClass} placeholder="City, state/province, country" data-testid="input-birth-location" /></FormControl>
                        <button type="button" className="flex h-12 items-center justify-center rounded-xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.06)] px-5 text-sm font-semibold text-[var(--sc-gold-bright)] transition hover:bg-[rgba(217,182,111,.12)] disabled:opacity-60" onClick={resolveLocation} disabled={isLocating} data-testid="button-location-lookup">
                          {isLocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}Resolve place
                        </button>
                      </div>
                      <FormMessage />
                      <p className="text-xs leading-5 text-[var(--sc-stone)]">
                        Built-in cities resolve on-device. Otherwise, pressing Resolve place sends only the entered place text to Soul Codex&apos;s location resolver; coordinates determine the birth location&apos;s IANA timezone. Your current device timezone is never substituted for a remote birthplace.
                      </p>
                    </FormItem>
                  )}
                />

                <div className="rounded-2xl border border-[var(--sc-line)] bg-black/15 p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--sc-ivory)]">Calculation coordinates</p>
                      <p className="mt-1 text-xs text-[var(--sc-stone)]">Resolve the birth place or enter these manually. They stay inspectable.</p>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full border border-[var(--sc-line)] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-[var(--sc-stone)]"><Database className="h-3.5 w-3.5" /> inspectable</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField control={form.control} name="latitude" render={({ field }) => (<FormItem><FormLabel className="text-xs text-[var(--sc-stone)]">Latitude</FormLabel><FormControl><Input {...field} className={inputClass} placeholder="40.7128" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="longitude" render={({ field }) => (<FormItem><FormLabel className="text-xs text-[var(--sc-stone)]">Longitude</FormLabel><FormControl><Input {...field} className={inputClass} placeholder="-74.0060" /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="timezone" render={({ field }) => (<FormItem><FormLabel className="text-xs text-[var(--sc-stone)]">Birth-place timezone</FormLabel><FormControl><Input {...field} className={inputClass} placeholder="America/New_York" /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </div>

                <div className={`rounded-2xl border p-4 ${exactChartInputsReady ? "border-[rgba(114,216,197,.28)] bg-[rgba(114,216,197,.05)]" : "border-[var(--sc-line)] bg-white/[0.02]"}`} data-testid="chart-input-readiness">
                  <div className="flex gap-3">
                    <ShieldCheck className={`mt-0.5 h-5 w-5 shrink-0 ${exactChartInputsReady ? "text-[var(--sc-teal)]" : "text-[var(--sc-stone)]"}`} />
                    <div>
                      <p className="text-sm font-semibold text-[var(--sc-ivory)]">
                        {exactChartInputsReady ? "Exact chart inputs are ready" : "Chart input status"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--sc-stone)]">
                        {exactChartInputsReady
                          ? "You supplied birth time, birth-place timezone, latitude, and longitude. Soul Codex can calculate Moon and Rising candidates. Independent online verification is the only remaining step before those values are promoted as chart facts."
                          : "Moon and Rising require an exact birth time plus the birth location's timezone and coordinates. Missing pieces stay unresolved rather than being guessed."}
                      </p>
                    </div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--sc-line-gold)] bg-[rgba(217,182,111,.045)] p-4" htmlFor="verify-online">
                  <input
                    id="verify-online"
                    data-testid="checkbox-online-verification"
                    type="checkbox"
                    checked={verifyOnline}
                    onChange={(event) => setVerifyOnline(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-[var(--sc-gold)]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-[var(--sc-ivory)]">Verify supported placements online after creation</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--sc-stone)]">
                      Optional. Soul Codex sends only birth date, optional birth time, timezone, and coordinates to the astronomy verification endpoint. It does not create a server profile or invoke AI generation for this check.
                      Leave this off to keep profile creation entirely on-device.
                    </span>
                  </span>
                </label>

                <button type="submit" className="sc-button-primary h-14 w-full justify-center text-[15px]" disabled={isCreating} data-testid="button-create-profile">
                  {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Building your Codex...</> : <>Create my Soul Codex <ArrowRight className="ml-2 h-4 w-4" /></>}
                </button>
              </form>
            </Form>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="sc-panel p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="sc-icon-well" style={{ color: "var(--sc-teal)" }}><ShieldCheck className="h-5 w-5" /></div>
                <div><p className="font-semibold text-[var(--sc-ivory)]">Local first</p><p className="text-xs text-[var(--sc-stone)]">Your reading does not wait on the cloud.</p></div>
              </div>
              <div className="space-y-3 text-sm text-[var(--sc-stone)]">
                {["Generated on this device", "Offline copy stays available", "Online verification is opt-in"].map((item) => <div key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sc-teal)]" /><span>{item}</span></div>)}
              </div>
            </div>
            <div className="sc-panel p-5">
              <p className="sc-eyebrow mb-2">Accuracy rule</p>
              <p className="font-serif text-xl font-medium leading-snug text-[var(--sc-ivory)]">Unknown is a status, not a result.</p>
              <p className="mt-3 text-sm leading-6 text-[var(--sc-stone)]">
                Complete inputs should become calculable. A calculated candidate should become visible as a candidate. Only independently verified evidence becomes a chart fact used as verified evidence.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
