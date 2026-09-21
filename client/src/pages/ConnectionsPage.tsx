import { FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";
import { HeartHandshake, LockKeyhole, UserRoundPlus } from "lucide-react";
import Navigation from "@/components/navigation";
import { ATLAS_SIGNS, type AtlasSign } from "@/lib/astrologyAtlas";
import { compatibilityLink, loadConnections, removeConnection, saveConnection, type SavedConnection } from "@/lib/connectionRepository";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<SavedConnection[]>([]);
  const [name, setName] = useState("");
  const [sunSign, setSunSign] = useState<AtlasSign>("Aries");
  const [error, setError] = useState("");
  useEffect(() => { setConnections(loadConnections()); }, []);
  function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    try { setConnections(saveConnection({ name, sunSign })); setName(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "This person could not be saved."); }
  }
  return <div className="sc-app-shell"><Navigation /><main className="sc-page mx-auto max-w-4xl pb-24">
    <header className="mb-7"><p className="sc-eyebrow">Connections</p><h1 className="sc-display mt-4 text-4xl sm:text-6xl">Understand people without flattening them.</h1><p className="sc-lede mt-4">Keep a private list on this device and reopen a comparison without typing the person again.</p></header>
    <section className="sc-panel p-5"><div className="flex gap-3"><LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-[var(--sc-teal)]"/><div><h2 className="font-semibold">Private on this device</h2><p className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">These names and Sun signs are stored only in this app’s local device storage. Soul Codex does not upload contacts or claim that these people joined, consented to chart sharing, or verified their birth data.</p></div></div></section>
    <form onSubmit={submit} className="sc-panel mt-5 p-5"><h2 className="font-serif text-2xl">Add a person</h2><div className="mt-4 grid gap-4 sm:grid-cols-[1fr_180px_auto]"><label><span className="block text-sm font-semibold">Name or nickname</span><input value={name} maxLength={80} onChange={event=>setName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--sc-line)] bg-white/[0.025] px-3" required /></label><label><span className="block text-sm font-semibold">Sun sign</span><select value={sunSign} onChange={event=>setSunSign(event.target.value as AtlasSign)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--sc-line)] bg-[var(--sc-bg,#100b19)] px-3">{ATLAS_SIGNS.map(sign=><option key={sign}>{sign}</option>)}</select></label><button className="sc-button-primary self-end" type="submit"><UserRoundPlus className="mr-2 h-4 w-4"/>Save</button></div>{error&&<p role="alert" className="mt-3 text-sm">{error}</p>}</form>
    <section className="mt-6" aria-labelledby="saved-connections"><div className="mb-3 flex items-end justify-between"><h2 id="saved-connections" className="font-serif text-3xl">Saved people</h2><span className="text-sm text-[var(--sc-stone)]">{connections.length}/100</span></div>
      {connections.length===0?<div className="sc-panel p-6 text-center"><HeartHandshake className="mx-auto h-8 w-8 text-[var(--sc-gold)]"/><p className="mt-3">No one is saved on this device yet.</p></div>:<ul className="grid gap-3">{connections.map(connection=><li key={connection.id} className="sc-panel flex flex-wrap items-center justify-between gap-4 p-4"><div><strong className="text-lg">{connection.name}</strong><p className="text-sm text-[var(--sc-stone)]">{connection.sunSign} Sun · symbolic comparison input</p></div><div className="flex gap-2"><Link className="sc-button-primary" href={compatibilityLink(connection)}>Compare</Link><button type="button" className="sc-button-ghost" onClick={()=>setConnections(removeConnection(connection.id))} aria-label={`Remove ${connection.name}`}>Remove</button></div></li>)}</ul>}
    </section>
  </main></div>;
}
