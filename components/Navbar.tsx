"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "HOME" },
  { href: "/browse/lost", label: "LOST ITEMS" },
  { href: "/browse/found", label: "FOUND ITEMS" },
  { href: "/post/lost", label: "POST LOST" },
  { href: "/post/found", label: "POST FOUND" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      style={{
        background: "rgba(7, 8, 15, 0.9)",
        borderBottom: "1px solid rgba(0, 245, 255, 0.15)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            style={{
              width: 36,
              height: 36,
              background:
                "linear-gradient(135deg, #00f5ff22, #bf00ff22)",
              border: "1px solid #00f5ff44",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              transition: "box-shadow 0.2s",
            }}
            className="group-hover:shadow-[0_0_12px_#00f5ff]"
          >
            🔍
          </div>
          <div>
            <span
              className="font-pixel gradient-text"
              style={{ fontSize: "0.55rem", letterSpacing: "2px" }}
            >
              CAMPUS
            </span>
            <br />
            <span
              className="font-pixel glow-cyan"
              style={{ fontSize: "0.65rem", color: "#00f5ff", letterSpacing: "1px" }}
            >
              LOSTLINK
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "0.45rem",
                  letterSpacing: "1.5px",
                  color: active ? "#00f5ff" : "#64748b",
                  textShadow: active
                    ? "0 0 8px #00f5ff, 0 0 16px #00f5ff"
                    : "none",
                  borderBottom: active ? "2px solid #00f5ff" : "none",
                  paddingBottom: active ? "2px" : "0",
                  transition: "color 0.2s, text-shadow 0.2s",
                }}
                className="hover:text-cyan-400"
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-cyan-400 text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: "rgba(7, 8, 15, 0.98)",
            borderTop: "1px solid rgba(0, 245, 255, 0.1)",
          }}
          className="md:hidden px-4 py-4 flex flex-col gap-4"
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "0.5rem",
                letterSpacing: "1px",
                color: pathname === l.href ? "#00f5ff" : "#64748b",
                textShadow:
                  pathname === l.href ? "0 0 8px #00f5ff" : "none",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
