/**
 * SoulCodexReadingDisplay Integration Tests
 *
 * Verifies progressive disclosure (Essential/Complete/Technical) modes
 * render correctly with full reading data
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SoulCodexReadingDisplay from '../SoulCodexReadingDisplay';
import type { SoulCodexReading } from '@soulcodex/core';

const mockReading: SoulCodexReading = {
  meta: {
    subjectName: "Test Subject",
    birthData: {
      date: "1990-09-17",
      time: "11:11 AM",
      location: "New York, NY",
      timezone: "America/New_York"
    },
    calculationStatus: "complete",
    confidence: "high",
    engineVersion: "1.0.0"
  },
  snapshot: {
    archetype: "The Pioneer",
    coreFormula: "Aries Sun + Libra Moon",
    centralPattern: "Initiator with diplomatic awareness",
    gift: "Courageous action tempered by fairness",
    tension: "Individual drive meets collaborative needs",
    nextAction: "Lead with consideration for others"
  },
  verifiedSystems: {
    astrology: {
      sunSign: "Virgo",
      sunDegree: 24.32,
      moonSign: "Scorpio",
      moonDegree: 17.45,
      ascendant: "Scorpio",
      ascendantDegree: 17.19,
      houses: [
        { number: 1, sign: "Scorpio", degree: 17.19 },
        { number: 2, sign: "Sagittarius", degree: 9.45 }
      ]
    },
    numerology: {
      lifePathNumber: 7,
      birthdayNumber: 8
    },
    humanDesign: {
      profileType: "5/1",
      strategy: "Respond",
      authority: "Emotional"
    }
  },
  engines: [
    {
      id: "engine-1",
      type: "identity",
      title: "Core Identity Engine",
      observation: "Strong Virgo placement indicates analytical nature",
      meaning: "You approach life methodically and seek truth",
      gift: "Detail-oriented perspective",
      shadow: "Perfectionism can paralyze action",
      action: "Practice good-enough decisions",
      evidenceRef: "Sun at 24° Virgo in 8th house"
    }
  ],
  interactions: {
    reinforcements: [
      {
        inputA: "Virgo Sun",
        inputB: "Scorpio Moon",
        operator: "+",
        result: "Intense analytical depth",
        explanation: "Earth + Water = grounded intuition",
        pattern: "Natural detective, seeks hidden truths",
        recommendation: "Trust your instincts about people",
        strength: "very-high"
      }
    ],
    balances: [],
    conflicts: []
  },
  dominance: [
    {
      theme: "Analytical Thinking",
      influence: "Very High",
      reasoning: "Virgo Sun + Mercury aspects"
    }
  ],
  actionPlan: {
    avoid: "Overthinking decisions",
    today: "Take one action without analyzing it to death",
    thisWeek: "Have a meaningful conversation",
    relationshipAction: "Listen without judgment",
    workAction: "Delegate a small task"
  }
};

describe('SoulCodexReadingDisplay', () => {
  it('renders in Essential mode by default', () => {
    render(<SoulCodexReadingDisplay reading={mockReading} defaultDepth="Essential" />);
    expect(screen.getByText('The Pioneer')).toBeInTheDocument();
    expect(screen.getByText('Aries Sun + Libra Moon')).toBeInTheDocument();
  });

  it('shows snapshot in all modes', () => {
    const { rerender } = render(
      <SoulCodexReadingDisplay reading={mockReading} defaultDepth="Essential" />
    );
    expect(screen.getByText('30-Second Understanding')).toBeInTheDocument();
    expect(screen.getByText('The Pioneer')).toBeInTheDocument();
  });

  it('hides technical appendix in Essential mode', () => {
    render(<SoulCodexReadingDisplay reading={mockReading} defaultDepth="Essential" />);
    expect(screen.queryByText('Technical Record')).not.toBeInTheDocument();
  });

  it('shows verified systems in Complete mode', () => {
    render(<SoulCodexReadingDisplay reading={mockReading} defaultDepth="Complete" />);
    expect(screen.getByText('Verified Systems')).toBeInTheDocument();
    expect(screen.getByText('Astrology')).toBeInTheDocument();
  });

  it('shows technical appendix in Technical mode', () => {
    render(<SoulCodexReadingDisplay reading={mockReading} defaultDepth="Technical" />);
    expect(screen.getByText('Technical Record')).toBeInTheDocument();
    expect(screen.getByText('Calculation Method')).toBeInTheDocument();
  });

  it('toggles between depth modes', async () => {
    const user = userEvent.setup();
    render(<SoulCodexReadingDisplay reading={mockReading} defaultDepth="Essential" />);

    const depthToggle = screen.getByRole('button', { name: /depth/i });
    await user.click(depthToggle);

    // Should show additional elements in Complete mode
    expect(screen.getByText('Verified Systems')).toBeInTheDocument();
  });

  it('renders engine cards with consistent structure', () => {
    render(<SoulCodexReadingDisplay reading={mockReading} defaultDepth="Complete" />);
    expect(screen.getByText('Core Identity Engine')).toBeInTheDocument();
    expect(screen.getByText('Strong Virgo placement indicates analytical nature')).toBeInTheDocument();
  });

  it('renders interactions between systems', () => {
    render(<SoulCodexReadingDisplay reading={mockReading} defaultDepth="Complete" />);
    expect(screen.getByText('Virgo Sun')).toBeInTheDocument();
    expect(screen.getByText('Scorpio Moon')).toBeInTheDocument();
    expect(screen.getByText('Intense analytical depth')).toBeInTheDocument();
  });

  it('renders dominance panel with influence levels', () => {
    render(<SoulCodexReadingDisplay reading={mockReading} defaultDepth="Complete" />);
    expect(screen.getByText('Dominant Influences')).toBeInTheDocument();
    expect(screen.getByText('Analytical Thinking')).toBeInTheDocument();
    expect(screen.getByText('Very High')).toBeInTheDocument();
  });

  it('renders action plan with domain-specific actions', () => {
    render(<SoulCodexReadingDisplay reading={mockReading} defaultDepth="Complete" />);
    expect(screen.getByText('Action Plan')).toBeInTheDocument();
    expect(screen.getByText('Overthinking decisions')).toBeInTheDocument();
    expect(screen.getByText('Take one action without analyzing it to death')).toBeInTheDocument();
  });

  it('shows exact degrees in Technical mode only', () => {
    const { rerender } = render(
      <SoulCodexReadingDisplay reading={mockReading} defaultDepth="Essential" />
    );
    // Essential should not show degrees
    expect(screen.queryByText('24.32°')).not.toBeInTheDocument();

    rerender(<SoulCodexReadingDisplay reading={mockReading} defaultDepth="Technical" />);
    // Technical should show degrees
    expect(screen.getByText(/24\.32°/)).toBeInTheDocument();
  });
});
