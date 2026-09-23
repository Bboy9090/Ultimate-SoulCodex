import { FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";
import { BookOpen, HeartHandshake, LockKeyhole, PlusCircle, UserRoundPlus } from "lucide-react";
import Navigation from "@/components/navigation";
import { ATLAS_SIGNS, personalPlacementMeaning, type AtlasSign } from "@/lib/astrologyAtlas";
import {
  CONNECTION_PLACEMENT_KEYS,
  compatibilityLink,
  loadConnections,
  placementLabel,
  removeConnection,
  saveConnection,
  type ConnectionPlacement,
  type ConnectionPlacementKey,
  type SavedConnection,
} from "@/lib/connectionRepository";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<SavedConnection[]>([]);
  const [name, setName] = useState("");
  const [sunSign, setSunSign] = useState<AtlasSign>("Aries");
  const [placementKey, setPlacementKey] = useState<ConnectionPlacementKey>("moon");
  const [placementSign, setPlacementSign] = useState<AtlasSign>("Aries");
  const [placementHouse, setPlacementHouse] = useState(1);
  const [placements, setPlacements] = useState<ConnectionPlacement[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { setConnections(loadConnections()); }, []);
  function addPlacement() {
    const next = { key: placementKey, sign: placementSign, house: placementHouse };
    setPlacements(current => [...current.filter(row => row.key !== placementKey), next]);
  }
  function removePlacement(key: ConnectionPlacementKey) {
    setPlacements(current => current.filter(row => row.key !== key));
  }
  function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    try { setConnections(saveConnection({ name, sunSign, placements })); setName(""); setPlacements([]); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "This person could not be saved."); }
  }
  return <div className="sc-app-shell"><Navigation /><main className="sc-page mx-auto max-w-4xl pb-24">
    <header className="mb-7"><p className="sc-eyebrow">Connections</p><h1 className="sc-display mt-4 text-4xl sm:text-6xl">Understand people without flattening them.</h1><p className="sc-lede mt-4">Keep a private list on this device and reopen a comparison without typing the person again.</p></header>
    <section className="sc-panel p-5"><div className="flex gap-3"><LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-[var(--sc-teal)]"/><div><h2 className="font-semibold">Private on this device</h2><p className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">These names, Sun signs, and optional chart placements are stored only in this app’s local device storage. Soul Codex does not upload contacts or claim that these people joined, consented to chart sharing, or verified their birth data.</p></div></div></section>
    <form onSubmit={submit} className="sc-panel mt-5 p-5"><h2 className="font-serif text-2xl">Add a person</h2><div className="mt-4 grid gap-4 sm:grid-cols-[1fr_180px_auto]"><label><span className="block text-sm font-semibold">Name or nickname</span><input value={name} maxLength={80} onChange={event=>setName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--sc-line)] bg-white/[0.025] px-3" required /></label><label><span className="block text-sm font-semibold">Sun sign</span><select value={sunSign} onChange={event=>setSunSign(event.target.value as AtlasSign)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--sc-line)] bg-[var(--sc-bg,#100b19)] px-3">{ATLAS_SIGNS.map(sign=><option key={sign}>{sign}</option>)}</select></label><button className="sc-button-primary self-end" type="submit"><UserRoundPlus className="mr-2 h-4 w-4"/>Save</button></div>
      <div className="mt-6 rounded-xl border border-[var(--sc-line)] p-4">
        <div className="flex gap-3"><BookOpen className="mt-1 h-5 w-5 shrink-0 text-[var(--sc-gold)]"/><div><h3 className="font-semibold">Optional friend chart placements</h3><p className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">Add what you know, such as Moon in Virgo in House 7 or Mars in Capricorn in House 10. Each placement gets its own meaning; missing placements stay missing.</p></div></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_120px_auto]">
          <label><span className="block text-sm font-semibold">Planet or point</span><select value={placementKey} onChange={event=>setPlacementKey(event.target.value as ConnectionPlacementKey)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--sc-line)] bg-[var(--sc-bg,#100b19)] px-3">{CONNECTION_PLACEMENT_KEYS.map(key=><option key={key} value={key}>{placementLabel(key)}</option>)}</select></label>
          <label><span className="block text-sm font-semibold">Sign</span><select value={placementSign} onChange={event=>setPlacementSign(event.target.value as AtlasSign)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--sc-line)] bg-[var(--sc-bg,#100b19)] px-3">{ATLAS_SIGNS.map(sign=><option key={sign}>{sign}</option>)}</select></label>
          <label><span className="block text-sm font-semibold">House</span><select value={placementHouse} onChange={event=>setPlacementHouse(Number(event.target.value))} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--sc-line)] bg-[var(--sc-bg,#100b19)] px-3">{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label>
          <button type="button" className="sc-button-ghost self-end" onClick={addPlacement}><PlusCircle className="mr-2 h-4 w-4"/>Add</button>
        </div>
        {placements.length>0&&<ul className="mt-4 grid gap-2">{placements.map(row=><li key={row.key} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--sc-line)] px-3 py-2 text-sm"><span>{placementLabel(row.key)} in {row.sign} · House {row.house}</span><button type="button" className="text-[var(--sc-stone)] underline-offset-4 hover:underline" onClick={()=>removePlacement(row.key)}>Remove</button></li>)}</ul>}
      </div>
      {error&&<p role="alert" className="mt-3 text-sm">{error}</p>}</form>
    <section className="mt-6" aria-labelledby="saved-connections"><div className="mb-3 flex items-end justify-between"><h2 id="saved-connections" className="font-serif text-3xl">Saved people</h2><span className="text-sm text-[var(--sc-stone)]">{connections.length}/100</span></div>
      {connections.length===0?<div className="sc-panel p-6 text-center"><HeartHandshake className="mx-auto h-8 w-8 text-[var(--sc-gold)]"/><p className="mt-3">No one is saved on this device yet.</p></div>:<ul className="grid gap-3">{connections.map(connection=><li key={connection.id} className="sc-panel p-4"><div className="flex flex-wrap items-start justify-between gap-4"><div><strong className="text-lg">{connection.name}</strong><p className="text-sm text-[var(--sc-stone)]">{connection.sunSign} Sun · local symbolic comparison input</p></div><div className="flex gap-2"><Link className="sc-button-primary" href={compatibilityLink(connection)}>Compare</Link><button type="button" className="sc-button-ghost" onClick={()=>setConnections(removeConnection(connection.id))} aria-label={`Remove ${connection.name}`}>Remove</button></div></div>{connection.placements&&connection.placements.length>0?<div className="mt-4 grid gap-3">{connection.placements.map(row=>{const meaning=personalPlacementMeaning(row.key,row.sign,row.house);return <article key={row.key} className="rounded-xl border border-[var(--sc-line)] p-3"><h3 className="font-semibold">{placementLabel(row.key)} in {row.sign} · House {row.house}</h3><p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{meaning.synthesis}</p><p className="mt-2 text-sm leading-6"><span className="font-semibold">Reflection:</span> {meaning.question}</p></article>;})}</div>:<p className="mt-4 text-sm text-[var(--sc-stone)]">Only a Sun sign is saved for this person. Add their known chart placements next time to unlock sign-in-house explanations.</p>}</li>)}</ul>}
    </section>
  </main></div>;
}
