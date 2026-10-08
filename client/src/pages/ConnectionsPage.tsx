import { FormEvent, useEffect, useState } from "react";
import { Link } from "wouter";
import { BookOpen, HeartHandshake, LockKeyhole, Mail, MessageCircle, PlusCircle, Search, Share2, UserRoundPlus } from "lucide-react";
import Navigation from "@/components/navigation";
import { ATLAS_SIGNS, personalPlacementMeaning, type AtlasSign } from "@/lib/astrologyAtlas";
import { pickConnectionContacts } from "@/lib/deviceContactPicker";
import {
  CONNECTION_PLACEMENT_KEYS,
  CONNECTION_RELATIONSHIPS,
  buildSoulCodexInvite,
  connectionComparableSunSign,
  compatibilityLink,
  connectionProfileSummary,
  deriveConnectionSunSignFromBirthDate,
  hasComparableConnectionData,
  loadConnections,
  placementLabel,
  relationshipLabel,
  removeConnection,
  saveConnection,
  saveImportedContacts,
  searchConnections,
  type ConnectionPlacement,
  type ConnectionPlacementKey,
  type ConnectionRelationship,
  type SavedConnection,
} from "@/lib/connectionRepository";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<SavedConnection[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState<ConnectionRelationship>("friend");
  const [birthDate, setBirthDate] = useState("");
  const [sunSign, setSunSign] = useState<AtlasSign | "">("");
  const [placementKey, setPlacementKey] = useState<ConnectionPlacementKey>("moon");
  const [placementSign, setPlacementSign] = useState<AtlasSign>("Aries");
  const [placementHouse, setPlacementHouse] = useState(1);
  const [placements, setPlacements] = useState<ConnectionPlacement[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [contactStatus, setContactStatus] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const visibleConnections = searchConnections(connections, search);
  const derivedSunSign = (() => {
    try { return birthDate ? deriveConnectionSunSignFromBirthDate(birthDate) : ""; }
    catch { return ""; }
  })();
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
    try { setConnections(saveConnection({ name, phone, email, relationship, birthDate, sunSign, placements })); setName(""); setPhone(""); setEmail(""); setBirthDate(""); setSunSign(""); setPlacements([]); setContactStatus(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "This person could not be saved."); }
  }
  async function importContact() {
    setError("");
    setContactStatus("");
    try {
      const result = await pickConnectionContacts();
      if (result.status === "unsupported") {
      setContactStatus("This device or browser does not expose contact picking here. You can still type a name or phone number manually.");
      return;
      }
      if (result.status === "cancelled") {
        setContactStatus("Contact import cancelled.");
        return;
      }
      if (result.contacts.length === 1) {
        const [contact] = result.contacts;
        setName(contact.name ?? "");
        setPhone(contact.phone ?? "");
        setEmail(contact.email ?? "");
        setContactStatus("Contact loaded locally. Add only the chart facts you actually know, then save.");
        return;
      }
      const next = saveImportedContacts(result.contacts, relationship);
      setConnections(next);
      setContactStatus(`${result.contacts.length} selected contacts were reviewed; new contacts with a phone or email were saved only on this device.`);
    } catch (cause) {
      setContactStatus("Contact import could not complete. Check the device contact permission and try again.");
    }
  }
  async function shareInvite(connection: SavedConnection) {
    setInviteStatus("");
    const invite = buildSoulCodexInvite(connection, window.location.origin);
    const shareData = { title: "Join me on Soul Codex", text: invite.text, url: invite.url };
    try {
      if (typeof navigator.share === "function" && (typeof navigator.canShare !== "function" || navigator.canShare(shareData))) {
        await navigator.share(shareData);
        setInviteStatus(`Invite prepared for ${connection.name}.`);
        return;
      }
      await navigator.clipboard.writeText(invite.text);
      setInviteStatus(`Invite copied for ${connection.name}. Choose Text or Email to address it directly.`);
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") return;
      setInviteStatus("The share sheet was unavailable. Use the Text or Email invite button when shown.");
    }
  }
  return <div className="sc-app-shell"><Navigation /><main className="sc-page mx-auto max-w-4xl pb-24">
    <header className="mb-7"><p className="sc-eyebrow">Connections</p><h1 className="sc-display mt-4 text-4xl sm:text-6xl">Your people. Their consent. A clearer comparison.</h1><p className="sc-lede mt-4">Choose friends or family from your contacts, invite them to Soul Codex, and compare only the chart details each person chooses to share.</p></header>
    <section className="sc-panel p-5"><div className="flex gap-3"><LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-[var(--sc-teal)]"/><div><h2 className="font-semibold">Contacts stay on this device</h2><p className="mt-1 text-sm leading-6 text-[var(--sc-stone)]">Soul Codex opens the device contact picker only after you tap Import. Selected names, phone numbers, and emails remain in local app storage and are not uploaded for account matching. A person is never labeled as a member or chart source until they deliberately share their own Soul Codex card.</p></div></div></section>
    <form onSubmit={submit} className="sc-panel mt-5 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl">Add a person</h2><button type="button" className="sc-button-ghost" onClick={()=>void importContact()}><UserRoundPlus className="mr-2 h-4 w-4"/>Choose contacts</button></div>{contactStatus&&<p className="mt-3 text-sm text-[var(--sc-stone)]">{contactStatus}</p>}<div className="mt-4 grid gap-4 sm:grid-cols-2"><label><span className="block text-sm font-semibold">Name or nickname</span><input value={name} maxLength={80} onChange={event=>setName(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--sc-line)] bg-white/[0.025] px-3" required /></label><label><span className="block text-sm font-semibold">Relationship</span><select value={relationship} onChange={event=>setRelationship(event.target.value as ConnectionRelationship)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--sc-line)] bg-[var(--sc-bg,#100b19)] px-3">{CONNECTION_RELATIONSHIPS.map(value=><option key={value} value={value}>{relationshipLabel(value)}</option>)}</select></label><label><span className="block text-sm font-semibold">Phone number</span><input value={phone} inputMode="tel" maxLength={32} onChange={event=>setPhone(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--sc-line)] bg-white/[0.025] px-3" placeholder="Optional, local only" /></label><label><span className="block text-sm font-semibold">Email</span><input value={email} type="email" maxLength={254} onChange={event=>setEmail(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--sc-line)] bg-white/[0.025] px-3" placeholder="Optional, local only" /></label><label><span className="block text-sm font-semibold">Birthday</span><input value={birthDate} type="date" onChange={event=>setBirthDate(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--sc-line)] bg-white/[0.025] px-3" /></label><label><span className="block text-sm font-semibold">Sun fallback</span><select value={sunSign} onChange={event=>setSunSign(event.target.value as AtlasSign | "")} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--sc-line)] bg-[var(--sc-bg,#100b19)] px-3" disabled={Boolean(derivedSunSign)}><option value="">{derivedSunSign ? `Derived: ${derivedSunSign}` : "Unknown / not entered"}</option>{ATLAS_SIGNS.map(sign=><option key={sign}>{sign}</option>)}</select></label><button className="sc-button-primary self-end" type="submit"><UserRoundPlus className="mr-2 h-4 w-4"/>Save</button></div>
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
      <label className="mb-4 block"><span className="block text-sm font-semibold">Search friends and family</span><span className="mt-2 flex min-h-12 items-center rounded-xl border border-[var(--sc-line)] bg-white/[0.025] px-3"><Search className="mr-2 h-4 w-4 text-[var(--sc-stone)]"/><input value={search} onChange={event=>setSearch(event.target.value)} className="min-h-10 flex-1 bg-transparent outline-none" placeholder="Search by name, phone, email, relationship, or Sun sign" /></span></label>
      {inviteStatus&&<p role="status" className="mb-4 text-sm text-[var(--sc-stone)]">{inviteStatus}</p>}
      {connections.length===0?<div className="sc-panel p-6 text-center"><HeartHandshake className="mx-auto h-8 w-8 text-[var(--sc-gold)]"/><p className="mt-3">No one is saved on this device yet.</p></div>:visibleConnections.length===0?<div className="sc-panel p-6 text-center"><p>No saved person matches that search.</p></div>:<ul className="grid gap-3">{visibleConnections.map(connection=>{const comparableSun=connectionComparableSunSign(connection);const canCompare=hasComparableConnectionData(connection);const invite=buildSoulCodexInvite(connection,typeof window === "undefined" ? "https://soulcodex.up.railway.app" : window.location.origin);return <li key={connection.id} className="sc-panel p-4"><div className="flex flex-wrap items-start justify-between gap-4"><div><strong className="text-lg">{connection.name}</strong><p className="text-sm text-[var(--sc-stone)]">{relationshipLabel(connection.relationship)} · {comparableSun ? `${comparableSun} Sun` : "Sun unknown"} · {canCompare ? "comparison ready" : "invite for chart sharing"}{connection.phone ? ` · ${connection.phone}` : ""}{connection.email ? ` · ${connection.email}` : ""}</p><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--sc-stone)]">{connectionProfileSummary(connection)}</p></div><div className="flex flex-wrap gap-2">{canCompare?<Link className="sc-button-primary" href={compatibilityLink(connection)}>Compare</Link>:<span className="sc-button-ghost opacity-60" aria-disabled="true">Chart not shared yet</span>}{invite.smsHref&&<a className="sc-button-ghost" href={invite.smsHref}><MessageCircle className="mr-2 h-4 w-4"/>Text invite</a>}{invite.emailHref&&<a className="sc-button-ghost" href={invite.emailHref}><Mail className="mr-2 h-4 w-4"/>Email invite</a>}<button type="button" className="sc-button-ghost" onClick={()=>void shareInvite(connection)}><Share2 className="mr-2 h-4 w-4"/>Invite</button><button type="button" className="sc-button-ghost" onClick={()=>setConnections(removeConnection(connection.id))} aria-label={`Remove ${connection.name}`}>Remove</button></div></div>{connection.placements&&connection.placements.length>0?<div className="mt-4 grid gap-3">{connection.placements.map(row=>{const meaning=personalPlacementMeaning(row.key,row.sign,row.house);return <article key={row.key} className="rounded-xl border border-[var(--sc-line)] p-3"><h3 className="font-semibold">{placementLabel(row.key)} in {row.sign} · House {row.house}</h3><p className="mt-2 text-sm leading-6 text-[var(--sc-stone)]">{meaning.synthesis}</p><p className="mt-2 text-sm leading-6"><span className="font-semibold">Reflection:</span> {meaning.question}</p></article>;})}</div>:<p className="mt-4 text-sm text-[var(--sc-stone)]">No chart placements are saved for this person yet. Send an invite so they can join and deliberately share a revocable Soul Codex card; missing chart facts remain unknown.</p>}</li>;})}</ul>}
    </section>
  </main></div>;
}
