"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getItemsByType, ItemType, Item } from "@/lib/store";
import ItemCard from "@/components/ItemCard";
import { useState, useEffect } from "react";

export default function BrowsePage() {
  const params = useParams();
  const type = params.type as ItemType;
  const isLost = type === "lost";

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    setItems([]);

    getItemsByType(type)
      .then(setItems)
      .catch((err: unknown) =>
        setFetchError(err instanceof Error ? err.message : "Failed to load items.")
      )
      .finally(() => setLoading(false));
  }, [type]);

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const accentColor = isLost ? "#ff007f" : "#00f5ff";
  const glowClass = isLost ? "glow-pink" : "glow-cyan";

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Link
            href="/"
            style={{ color: "#64748b", fontSize: "0.8rem", textDecoration: "none" }}
            className="hover:text-cyan-400"
          >
            ← Home
          </Link>
        </div>
        <h1
          className={`font-pixel ${glowClass}`}
          style={{
            fontSize: "clamp(0.65rem, 2vw, 0.85rem)",
            color: accentColor,
            letterSpacing: "3px",
            marginBottom: 8,
          }}
        >
          {isLost ? "😢 LOST ITEMS" : "🎉 FOUND ITEMS"}
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
          {loading ? "Loading from Supabase…" : `${filtered.length} item${filtered.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {/* Toggle + Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <Link href="/browse/lost">
          <button
            className={isLost ? "btn-pink" : "btn-purple"}
            style={{ padding: "8px 20px", fontSize: "0.5rem" }}
          >
            😢 LOST
          </button>
        </Link>
        <Link href="/browse/found">
          <button
            className={!isLost ? "btn-cyan" : "btn-purple"}
            style={{ padding: "8px 20px", fontSize: "0.5rem" }}
          >
            🎉 FOUND
          </button>
        </Link>

        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            type="text"
            className="input-neon"
            placeholder="Search by title, location, category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Link href={`/post/${type}`}>
          <button
            className={isLost ? "btn-pink" : "btn-cyan"}
            style={{ padding: "8px 20px", fontSize: "0.5rem" }}
          >
            + POST {type.toUpperCase()}
          </button>
        </Link>
      </div>

      {/* Error state */}
      {fetchError && (
        <div
          className="card-neon-pink"
          style={{ padding: "24px", marginBottom: 24, textAlign: "center" }}
        >
          <p style={{ color: "#ff007f", fontSize: "0.85rem" }}>
            ⚠️ Could not connect to Supabase: {fetchError}
          </p>
          <p style={{ color: "#64748b", fontSize: "0.75rem", marginTop: 8 }}>
            Check your .env.local file and ensure the Supabase table exists.
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card-neon"
              style={{
                height: 320,
                opacity: 0.4,
                animation: "pulse-neon 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !fetchError && filtered.length === 0 && (
        <div
          className="card-neon"
          style={{ padding: "64px", textAlign: "center" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🕵️</div>
          <h3
            className={`font-pixel ${glowClass}`}
            style={{ fontSize: "0.6rem", color: accentColor, marginBottom: 12 }}
          >
            NOTHING FOUND
          </h3>
          <p style={{ color: "#64748b", marginBottom: 24 }}>
            {search ? "No items match your search." : `No ${type} items posted yet.`}
          </p>
          <Link href={`/post/${type}`}>
            <button className={isLost ? "btn-pink" : "btn-cyan"}>
              POST THE FIRST ONE
            </button>
          </Link>
        </div>
      )}

      {/* Grid */}
      {!loading && !fetchError && filtered.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
