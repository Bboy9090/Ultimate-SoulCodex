import { useState } from "react";
import { X } from "lucide-react";

interface DemoModalProps {
  onClose: () => void;
}

export function DemoModal({ onClose }: DemoModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden bg-black">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg z-10 transition"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Demo Video Placeholder */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-black">
          <div className="text-center space-y-4">
            <div className="text-6xl">🌌</div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome to Soul Codex Demo</h2>
            <p className="text-gray-300 max-w-md mx-auto">
              In this demo, discover how your birth chart reveals your complete cosmic blueprint.
            </p>
            <div className="mt-8 space-y-4">
              <div className="text-left text-sm text-gray-400">
                <p className="mb-2"><span className="font-semibold">Step 1:</span> Enter your birth date, time, and location</p>
                <p className="mb-2"><span className="font-semibold">Step 2:</span> Soul Codex calculates your astrology, numerology, archetype, and more</p>
                <p className="mb-2"><span className="font-semibold">Step 3:</span> Access your complete soul profile with insights from 12+ mystical systems</p>
                <p><span className="font-semibold">Premium:</span> Unlock astrocartography maps, palmistry analysis, and download your 30-40 page PDF dossier</p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6">
          <p className="text-white text-sm">
            Video demonstration placeholder • Soul Codex Complete Reading Experience
          </p>
        </div>
      </div>
    </div>
  );
}
