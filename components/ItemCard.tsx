"use client";

import Link from "next/link";
import { Item } from "@/lib/store";

interface ItemCardProps {
  item: Item;
}

const CATEGORY_EMOJI: Record<string, string> = {
  phone: "📱",
  wallet: "👛",
  bag: "🎒",
  keys: "🔑",
  electronics: "💻",
  books: "📚",
  bottle: "🍶",
  other: "📦",
};

export default function ItemCard({ item }: ItemCardProps) {
  const isLost = item.type === "lost";
  const emoji = CATEGORY_EMOJI[item.category] ?? "📦";

  return (
    <Link href={`/items/${item.id}`} className="block h-full">
      <div
        className={isLost ? "card-neon-pink h-full" : "card-neon h-full"}
        style={{ padding: "0", overflow: "hidden" }}
      >
        {/* Image / Placeholder */}
        <div
          style={{
            height: 180,
            background: isLost
              ? "linear-gradient(135deg, #1a0010, #0d0018)"
              : "linear-gradient(135deg, #00101a, #00041a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span style={{ fontSize: "4rem", opacity: 0.4 }}>{emoji}</span>
          )}

          {/* Type badge */}
          <span
            className={isLost ? "badge-lost" : "badge-found"}
            style={{ position: "absolute", top: 10, right: 10 }}
          >
            {item.type}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: "16px" }}>
          {/* Category pill */}
          <div className="flex items-center justify-between mb-2">
            <span className="category-pill">{emoji} {item.category}</span>
          </div>

          <h3
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: isLost ? "#ff007f" : "#00f5ff",
              marginBottom: 6,
              textShadow: isLost
                ? "0 0 6px rgba(255,0,127,0.4)"
                : "0 0 6px rgba(0,245,255,0.4)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.title}
          </h3>

          <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: 4 }}>
            📍 {item.location}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: 10 }}>
            📅 {item.date}
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              paddingTop: 10,
              fontSize: "0.8rem",
              color: "#94a3b8",
            }}
          >
            <div>👤 {item.name}</div>
            {item.phone && <div style={{ marginTop: 2 }}>📞 {item.phone}</div>}
          </div>
        </div>
      </div>
    </Link>
  );
}
