import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@shared/schema";
import { Button } from "./ui/button";
import { apiRequest } from "../lib/queryClient";
import { loadActiveProfile, saveActiveProfile } from "../lib/ActiveProfileRepository";
import { reconcileActiveProfile } from "../lib/profileVerificationReconciliation";

export default function ProfileSystemVerificationButton({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const [result, setResult] = useState("");
  const currentId = useRef(profile.id);
  currentId.current = profile.id;
  useEffect(() => setResult(""), [profile.id]);
  const mutation = useMutation({
    mutationFn: async (requestedId: string) => {
      if (requestedId.startsWith("local-") || requestedId.startsWith("offline-")) throw new Error("Open the device-local profile to verify its systems.");
      const response = await apiRequest("POST", `/api/profiles/${encodeURIComponent(requestedId)}/verify-systems`, {});
      return response.json() as Promise<Profile>;
    },
    onSuccess: async (updated, requestedId) => {
      if (updated.id !== requestedId) throw new Error("Verification returned a different profile.");
      queryClient.setQueryData(["/api/profiles", requestedId], updated);
      if (currentId.current !== requestedId) return;
      const active = loadActiveProfile().profile;
      let snapshotFailed = false;
      // Device-local profiles are reconciled by their own flow, never here.
      if (active?.id === updated.id && !active.id.startsWith("local-") && !active.id.startsWith("offline-")) {
        const saved = saveActiveProfile(reconcileActiveProfile(active, updated as any));
        snapshotFailed = !saved.success;
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/profiles", requestedId] });
      if (currentId.current !== requestedId) return;
      setResult(snapshotFailed ? "Server profile updated. Reopen this profile to refresh the device snapshot." : "Saved birth details verified. Available systems and your reading have been refreshed.");
    },
    onError: (error, requestedId) => {
      if (currentId.current === requestedId) setResult(error instanceof Error ? error.message : "Verification failed. Your saved profile remains available.");
    },
  });
  return <section aria-label="Verify saved profile systems" className="my-6 space-y-3">
    <p className="text-sm text-muted-foreground">Verify online using this profile’s saved birth date, time, timezone, and birthplace coordinates. Missing information remains unresolved.</p>
    <p className="text-sm">{new Date(profile.birthDate).toISOString().slice(0, 10)} · {profile.birthTime || "Time unknown"} · {profile.timezone || "Timezone missing"} · {profile.birthLocation || "Birthplace missing"}</p>
    <Button disabled={mutation.isPending} onClick={() => { setResult(""); mutation.mutate(profile.id); }}>
      {mutation.isPending ? "Verifying saved birth details…" : "Verify saved birth details"}
    </Button>
    {result && <p role="status" className="text-sm">{result}</p>}
  </section>;
}
