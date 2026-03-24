"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getItemById, Item } from "@/lib/store";
import { useEffect, useState } from "react";

const CATEGORY_EMOJI: Record<string, string> = {
  phone: "📱", wallet: "👛", bag: "🎒", keys: "🔑",
  electronics: "💻", books: "📚", bottle: "🍶", other: "📦",
};

export default function ItemDetailPage() {
  const { id } = useParams() as { id: string };
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    getItemById(id)
      .then((data) => {
        setItem(data);
        if (!data) setFetchError("Item not found.");
      })
      .catch((err: unknown) =>
        setFetchError(err instanceof Error ? err.message : "Failed to load item.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div
          style={{
            fontSize: "3rem",
            marginBottom: 16,
            animation: "pulse-neon 1.5s ease-in-out infinite",
          }}
        >
          🔍
        </div>
        <p className="font-pixel glow-cyan" style={{ fontSize: "0.55rem", color: "#00f5ff" }}>
          LOADING…
        </p>
      </div>
    );
  }

  // ── Error / Not found ──────────────────────────────────────
  if (fetchError || !item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div style={{ fontSize: "4rem", marginBottom: 16 }}>🕵️</div>
        <h1 className="font-pixel glow-pink" style={{ fontSize: "0.7rem", color: "#ff007f" }}>
          ITEM NOT FOUND
        </h1>
        <p style={{ color: "#64748b", margin: "16px 0" }}>
          {fetchError ?? "This item may have been removed or the link is invalid."}
        </p>
        <Link href="/">
          <button className="btn-cyan">GO HOME</button>
        </Link>
      </div>
    );
  }

  // ── Detail view ────────────────────────────────────────────
  const isLost = item.type === "lost";
  const emoji = CATEGORY_EMOJI[item.category] ?? "📦";
  const accentColor = isLost ? "#ff007f" : "#00f5ff";
  const glowClass = isLost ? "glow-pink" : "glow-cyan";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Back */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href={`/browse/${item.type}`}
          style={{ color: "#64748b", fontSize: "0.85rem", textDecoration: "none" }}
          className="hover:text-cyan-400"
        >
          ← Browse {item.type} items
        </Link>
      </div>

      <div
        className={isLost ? "card-neon-pink" : "card-neon"}
        style={{ overflow: "hidden" }}
      >
        {/* Image */}
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            style={{ width: "100%", maxHeight: 340, objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              height: 200,
              background: isLost
                ? "linear-gradient(135deg, #1a0010, #0d0018)"
                : "linear-gradient(135deg, #00101a, #00041a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "5rem",
              opacity: 0.5,
            }}
          >
            {emoji}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: "32px" }}>
          {/* Badge + Category */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <span className={isLost ? "badge-lost" : "badge-found"}>{item.type}</span>
            <span className="category-pill">{emoji} {item.category}</span>
          </div>

          {/* Title */}
          <h1
            className={glowClass}
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              fontWeight: 700,
              color: accentColor,
              marginBottom: 24,
            }}
          >
            {item.title}
          </h1>

          {/* Key info grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
              marginBottom: 24,
              background: "rgba(255,255,255,0.02)",
              borderRadius: 10,
              padding: "20px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div>
              <p style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                📍 Location
              </p>
              <p style={{ color: "#e2e8f0", fontWeight: 600 }}>{item.location}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                📅 Date
              </p>
              <p style={{ color: "#e2e8f0", fontWeight: 600 }}>{item.date}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                🏷️ Category
              </p>
              <p style={{ color: "#e2e8f0", fontWeight: 600, textTransform: "capitalize" }}>{item.category}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.65rem", color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                🕑 Posted
              </p>
              <p style={{ color: "#e2e8f0", fontWeight: 600 }}>
                {new Date(item.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 28 }}>
            <p
              style={{
                fontSize: "0.65rem",
                color: accentColor,
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 10,
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              Description
            </p>
            <p
              style={{
                color: "#94a3b8",
                lineHeight: 1.8,
                fontSize: "0.95rem",
                background: "rgba(255,255,255,0.02)",
                borderRadius: 8,
                padding: "16px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {item.description}
            </p>
          </div>

          {/* Contact */}
          <div
            style={{
              background: `${accentColor}08`,
              border: `1px solid ${accentColor}22`,
              borderRadius: 10,
              padding: "20px",
            }}
          >
            <p
              style={{
                fontSize: "0.6rem",
                color: accentColor,
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 16,
                fontFamily: "'Press Start 2P', monospace",
              }}
            >
              Contact Info
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.1rem" }}>👤</span>
                <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{item.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.1rem" }}>📧</span>
                <a
                  href={`mailto:${item.email}`}
                  style={{ color: accentColor, textDecoration: "none", fontWeight: 500 }}
                  className="hover:underline"
                >
                  {item.email}
                </a>
              </div>
              {item.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.1rem" }}>📞</span>
                  <a
                    href={`tel:${item.phone}`}
                    style={{ color: accentColor, textDecoration: "none", fontWeight: 500 }}
                    className="hover:underline"
                  >
                    {item.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href={`mailto:${item.email}?subject=Re: ${item.title}`}>
              <button className={isLost ? "btn-pink" : "btn-cyan"}>
                ✉️ CONTACT VIA EMAIL
              </button>
            </a>
            {item.phone && (
              <a href={`tel:${item.phone}`}>
                <button className="btn-purple">
                  📞 CALL NOW
                </button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
