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
          maxWidth: 540,
          width: "100%",
          padding: "32px",
          position: "relative",
          animation: "fadeIn 0.2s ease",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>⚠️</div>
          <h2
            className="font-pixel glow-pink"
            style={{ fontSize: "0.65rem", color: "#ff007f", letterSpacing: "2px" }}
          >
            IMPORTANT NOTICE
          </h2>
        </div>

        {/* ── NEW: Image upload warning block ── */}
        <div
          style={{
            background: "rgba(255, 30, 30, 0.08)",
            border: "1px solid rgba(255, 30, 30, 0.45)",
            borderRadius: 8,
            padding: "14px 18px",
            marginBottom: 14,
          }}
        >
          {/* Red urgent warning */}
          <p
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#ff2222",
              textShadow: "0 0 8px rgba(255,34,34,0.4)",
              marginBottom: 10,
              lineHeight: 1.5,
            }}
          >
            ⚠️ DO NOT upload any human face or animal images.
          </p>

          {/* Yellow instructional note */}
          <p
            style={{
              fontSize: "0.8rem",
              color: "#ffe600",
              lineHeight: 1.6,
              textShadow: "0 0 6px rgba(255,230,0,0.3)",
            }}
          >
            If the item includes a human face (like in jewellery or printed items), upload
            only the item image without clearly showing the face.
          </p>
        </div>

        {/* ── Existing: owner verification block ── */}
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
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}
