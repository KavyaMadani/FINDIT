"use client";

interface ConfirmPopupProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmPopup({ onConfirm, onCancel }: ConfirmPopupProps) {
  return (
    <div className="modal-backdrop">
      <div
        className="card-neon-pink"
        style={{
          maxWidth: 520,
          width: "100%",
          padding: "32px",
          position: "relative",
          animation: "fadeIn 0.2s ease",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠️</div>
          <h2
            className="font-pixel glow-pink"
            style={{ fontSize: "0.65rem", color: "#ff007f", letterSpacing: "2px" }}
          >
            IMPORTANT NOTICE
          </h2>
        </div>

        {/* Body */}
        <div
          style={{
            background: "rgba(255,0,127,0.06)",
            border: "1px solid rgba(255,0,127,0.2)",
            borderRadius: 8,
            padding: "16px 20px",
            marginBottom: 24,
          }}
        >
          <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e2e8f0", marginBottom: 12 }}>
            Please confirm the owner before returning the item.
          </p>
          <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: 10 }}>
            Ask the claimant questions such as:
          </p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "What brand is the item?",
              "What color is it?",
              "Where did you lose it?",
              "What items were inside it?",
              "Any unique mark or sticker?",
            ].map((q) => (
              <li
                key={q}
                style={{
                  fontSize: "0.8rem",
                  color: "#cbd5e1",
                  paddingLeft: 12,
                  borderLeft: "2px solid #ff007f",
                  paddingTop: 2,
                  paddingBottom: 2,
                }}
              >
                {q}
              </li>
            ))}
          </ul>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button className="btn-purple" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-cyan" onClick={onConfirm}>
            I Understand
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
