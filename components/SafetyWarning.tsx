// components/SafetyWarning.tsx
// Reusable safety notice box — shown at top of both post forms.

export default function SafetyWarning() {
  return (
    <div
      style={{
        background: "rgba(255, 230, 0, 0.05)",
        border: "1px solid rgba(255, 230, 0, 0.45)",
        borderRadius: 10,
        padding: "20px 24px",
        marginBottom: 28,
        boxShadow: "0 0 16px rgba(255, 230, 0, 0.08), inset 0 0 20px rgba(255,230,0,0.03)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: "1.3rem" }}>⚠️</span>
        <h3
          className="font-pixel"
          style={{
            fontSize: "0.5rem",
            color: "#ffe600",
            letterSpacing: "2px",
            textShadow: "0 0 8px rgba(255,230,0,0.5)",
          }}
        >
          IMPORTANT SAFETY NOTICE
        </h3>
      </div>

      {/* Main text */}
      <p
        style={{
          fontSize: "0.85rem",
          color: "#e2e8f0",
          fontWeight: 500,
          marginBottom: 14,
          lineHeight: 1.6,
        }}
      >
        Before giving an item to anyone, please verify they are the real owner.
      </p>

      {/* Question list */}
      <p
        style={{
          fontSize: "0.78rem",
          color: "#94a3b8",
          marginBottom: 10,
        }}
      >
        Ask questions like:
      </p>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {[
          "What brand is the item?",
          "What color is it?",
          "Where exactly did you lose it?",
          "What items were inside it?",
          "Is there any unique mark, sticker, or scratch?",
        ].map((q) => (
          <li
            key={q}
            style={{
              fontSize: "0.8rem",
              color: "#cbd5e1",
              paddingLeft: 12,
              borderLeft: "2px solid #ffe600",
              paddingTop: 2,
              paddingBottom: 2,
            }}
          >
            • {q}
          </li>
        ))}
      </ul>

      {/* Warning footer */}
      <p
        style={{
          fontSize: "0.8rem",
          color: "#ffe600",
          fontWeight: 700,
          textShadow: "0 0 6px rgba(255,230,0,0.4)",
          marginTop: 4,
        }}
      >
        🔒 Do NOT return the item unless answers match correctly.
      </p>
    </div>
  );
}
