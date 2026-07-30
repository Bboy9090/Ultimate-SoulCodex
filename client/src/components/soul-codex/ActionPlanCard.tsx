/**
 * ActionPlanCard
 *
 * Practical next steps across different domains
 */

import type { ActionPlan } from "@soulcodex/core";

interface ActionPlanCardProps {
  actionPlan: ActionPlan;
}

interface ActionItem {
  label: string;
  icon: string;
  value: string;
  color: string;
}

export default function ActionPlanCard({ actionPlan }: ActionPlanCardProps) {
  const actions: ActionItem[] = [
    {
      label: "Today",
      icon: "☀️",
      value: actionPlan.today,
      color: "var(--sc-gold)",
    },
    {
      label: "This Week",
      icon: "📅",
      value: actionPlan.thisWeek,
      color: "var(--sc-teal)",
    },
    {
      label: "Relationship",
      icon: "💫",
      value: actionPlan.relationshipAction,
      color: "var(--sc-rose)",
    },
    {
      label: "Work",
      icon: "⚡",
      value: actionPlan.workAction,
      color: "var(--sc-violet)",
    },
  ];

  return (
    <div
      style={{
        padding: "2rem",
        background: "linear-gradient(135deg, rgba(212,168,95,0.12) 0%, rgba(212,168,95,0.05) 100%)",
        border: "1px solid rgba(212,168,95,0.2)",
        borderRadius: "16px",
      }}
    >
      {/* Header */}
      <h2
        style={{
          fontSize: "1rem",
          textTransform: "uppercase",
          color: "var(--sc-gold)",
          margin: "0 0 1.5rem 0",
        }}
      >
        Action Plan
      </h2>

      {/* Avoid Section */}
      <div
        style={{
          padding: "1.5rem",
          background: "rgba(255,152,0,0.1)",
          border: "1px solid rgba(255,152,0,0.2)",
          borderRadius: "12px",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            color: "var(--sc-amber)",
            marginBottom: "0.75rem",
          }}
        >
          ⚠️ Avoid
        </div>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--sc-ivory)",
            margin: 0,
            lineHeight: "1.6",
          }}
        >
          {actionPlan.avoid}
        </p>
      </div>

      {/* Action Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {actions.map((action, idx) => (
          <div
            key={idx}
            style={{
              padding: "1.5rem",
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${action.color}30`,
              borderRadius: "12px",
            }}
          >
            {/* Icon + Label */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>{action.icon}</span>
              <div
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  color: action.color,
                  fontWeight: 600,
                }}
              >
                {action.label}
              </div>
            </div>

            {/* Action Text */}
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--sc-ivory)",
                margin: 0,
                lineHeight: "1.6",
              }}
            >
              {action.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
