"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useProfile } from "@/hooks/useProfile"

type JournalEntry = {
  id: string
  date: string
  mood: number
  tags: string[]
  text: string
}

const MOOD_LABELS = ["", "Low", "Drained", "Neutral", "Good", "Strong"]
const MOOD_COLORS = ["", "text-red-400", "text-orange-400", "text-codex-textMuted", "text-codex-blue", "text-codex-gold"]

const REFLECTION_PROMPTS = [
  "What pattern did I notice today?",
  "What did I tolerate that I shouldn't have?",
  "What felt right about today?",
  "Where did I lose energy?",
  "What would I do differently if I could replay today?",
  "What am I avoiding right now?",
  "What did I finish that I'm proud of?",
  "What truth am I not saying out loud?",
]

const PATTERN_TAGS = [
  "overthinking", "procrastinating", "boundary-setting", "confrontation",
  "flow-state", "burnout", "clarity", "isolation", "connection",
  "self-sabotage", "breakthrough", "patience", "impatience", "honesty",
]

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [text, setText] = useState("")
  const [mood, setMood] = useState(3)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [prompt, setPrompt] = useState("")

  const profileId = typeof window !== "undefined"
    ? localStorage.getItem("profileId") ?? undefined
    : undefined
  const { profile } = useProfile(profileId)

  useEffect(() => {
    const stored = localStorage.getItem("soul_journal")
    if (stored) setEntries(JSON.parse(stored))
    setPrompt(REFLECTION_PROMPTS[new Date().getDate() % REFLECTION_PROMPTS.length])
  }, [])

  const synthesis = profile?.synthesis
  const monthFocus = synthesis?.practicalGuidance?.[0] || "Focus on one thing that compounds."

  const save = () => {
    if (!text.trim()) return
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      mood,
      tags: selectedTags,
      text: text.trim(),
    }
    const updated = [entry, ...entries]
    setEntries(updated)
    localStorage.setItem("soul_journal", JSON.stringify(updated))
    setText("")
    setSelectedTags([])
    setMood(3)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const moodHistory = entries.slice(0, 14).map(e => e.mood)
  const avgMood = moodHistory.length > 0 ? (moodHistory.reduce((a, b) => a + b, 0) / moodHistory.length).toFixed(1) : "—"

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 space-y-6">

      <h1 className="text-xl font-bold">Journal</h1>

      {/* Monthly focus */}
      <div className="card text-center">
        <p className="text-xs text-codex-gold font-bold uppercase tracking-wider mb-2">This Month's Focus</p>
        <p className="oracle-text text-sm">{monthFocus}</p>
      </div>

      {/* Reflection prompt */}
      <div className="card">
        <p className="text-xs text-codex-purple font-bold uppercase tracking-wider text-center mb-2">Reflection</p>
        <p className="oracle-text text-sm">{prompt}</p>
      </div>

      {/* Entry form */}
      <div className="card space-y-4">
        <p className="text-xs text-codex-textMuted uppercase tracking-wider text-center">New Entry</p>

        {/* Mood */}
        <div>
          <p className="text-xs text-codex-textMuted mb-2">Mood</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(m => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`flex-1 py-1.5 rounded-codex text-xs border transition-colors ${
                  mood === m
                    ? "bg-codex-purple border-codex-purple"
                    : "border-codex-border hover:border-codex-purple/60"
                }`}
              >
                {MOOD_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <p className="text-xs text-codex-textMuted mb-2">Pattern Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {PATTERN_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-codex-gold/20 border-codex-gold text-codex-gold"
                    : "border-codex-border text-codex-textMuted hover:border-codex-gold/40"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Text */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What happened today? What did you notice?"
          rows={4}
          className="w-full bg-codex-surface border border-codex-border rounded-codex px-4 py-3 text-sm text-codex-text placeholder:text-codex-textMuted focus:outline-none focus:border-codex-purple resize-none"
        />

        <button
          onClick={save}
          disabled={!text.trim()}
          className="w-full bg-codex-purple text-sm font-semibold py-2.5 rounded-codex hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Save Entry
        </button>
      </div>

      {/* Mood trend */}
      {entries.length > 2 && (
        <div className="card">
          <p className="text-xs text-codex-textMuted uppercase tracking-wider text-center mb-2">Mood Trend</p>
          <div className="flex items-end gap-1 justify-center h-12">
            {moodHistory.map((m, i) => (
              <div
                key={i}
                className="bg-codex-purple rounded-sm"
                style={{ width: 8, height: `${m * 20}%`, opacity: 0.5 + i * 0.03 }}
              />
            ))}
          </div>
          <p className="text-xs text-codex-textMuted text-center mt-2">Average: {avgMood}/5</p>
        </div>
      )}

      {/* Past entries */}
      {entries.slice(0, 5).map(entry => (
        <div key={entry.id} className="card">
          <div className="flex justify-between text-xs text-codex-textMuted mb-2">
            <span>{entry.date}</span>
            <span className={MOOD_COLORS[entry.mood]}>{MOOD_LABELS[entry.mood]}</span>
          </div>
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {entry.tags.map(t => (
                <span key={t} className="px-2 py-0.5 bg-codex-card border border-codex-border rounded-full text-xs">{t}</span>
              ))}
            </div>
          )}
          <p className="text-sm">{entry.text}</p>
        </div>
      ))}

      <Link
        href="/growth"
        className="block w-full text-center py-3 rounded-codex text-sm font-semibold tracking-wide transition-all duration-200"
        style={{
          background: "linear-gradient(135deg, rgba(123,97,255,0.2) 0%, rgba(242,201,76,0.1) 100%)",
          border: "1px solid rgba(123,97,255,0.2)",
        }}
      >
        View Growth Dashboard
      </Link>

      <Link href="/home" className="block text-center text-xs text-codex-textMuted underline">
        Back to Oracle
      </Link>

    </div>
  )
}
