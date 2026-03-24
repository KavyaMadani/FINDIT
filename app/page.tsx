import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero */}
      <section style={{ textAlign: "center", padding: "48px 0 64px" }}>
        <div
          style={{
            display: "inline-block",
            fontSize: "4rem",
            marginBottom: 16,
            filter: "drop-shadow(0 0 20px #00f5ff)",
            animation: "pulse-neon 2.5s ease-in-out infinite",
          }}
        >
          🔍
        </div>
        <h1 className="font-pixel gradient-text" style={{ fontSize: "clamp(0.9rem, 3vw, 1.4rem)", lineHeight: 1.8, marginBottom: 12 }}>
          CAMPUS LOSTLINK
        </h1>
        <p
          className="font-pixel"
          style={{
            fontSize: "0.5rem",
            color: "#64748b",
            letterSpacing: "3px",
            marginBottom: 32,
          }}
        >
          LOST &amp; FOUND PORTAL
        </p>
        <p
          style={{
            fontSize: "1.05rem",
            color: "#94a3b8",
            maxWidth: 560,
            margin: "0 auto 48px",
            lineHeight: 1.7,
          }}
        >
          Lost something on campus? Found something? Post it here and help
          reunite belongings with their owners.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/post/lost">
            <button className="btn-pink" style={{ padding: "14px 32px" }}>
              📋 POST LOST ITEM
            </button>
          </Link>
          <Link href="/post/found">
            <button className="btn-cyan" style={{ padding: "14px 32px" }}>
              📦 POST FOUND ITEM
            </button>
          </Link>
        </div>
      </section>

      {/* Stats row */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 64,
        }}
      >
        {[
          { emoji: "😢", label: "Lost Items Posted", color: "#ff007f", value: "100+" },
          { emoji: "🎉", label: "Items Reunited", color: "#00ff88", value: "60+" },
          { emoji: "📍", label: "Campus Locations", color: "#ffe600", value: "30+" },
          { emoji: "🏫", label: "Active Students", color: "#00f5ff", value: "200+" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card-neon"
            style={{ padding: "24px", textAlign: "center" }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>{stat.emoji}</div>
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: stat.color,
                fontFamily: "'Rajdhani', sans-serif",
                textShadow: `0 0 10px ${stat.color}66`,
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section style={{ marginBottom: 64 }}>
        <h2
          className="font-pixel glow-purple"
          style={{
            fontSize: "0.65rem",
            color: "#bf00ff",
            textAlign: "center",
            marginBottom: 40,
            letterSpacing: "3px",
          }}
        >
          HOW IT WORKS
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {[
            {
              step: "01",
              title: "Post Your Item",
              desc: "Fill the form with item details, location, and your contact info. Optionally attach a photo.",
              color: "#ff007f",
            },
            {
              step: "02",
              title: "Browse Listings",
              desc: "Check the lost & found boards. Filter by category or type to find relevant items quickly.",
              color: "#00f5ff",
            },
            {
              step: "03",
              title: "Verify & Connect",
              desc: "Contact the poster directly. Verify ownership with specific questions before handing over.",
              color: "#bf00ff",
            },
            {
              step: "04",
              title: "Reunite! 🎉",
              desc: "Happy reuniting! The item finds its rightful owner, campus peace is restored.",
              color: "#00ff88",
            },
          ].map((step) => (
            <div
              key={step.step}
              className="card-neon"
              style={{ padding: "24px" }}
            >
              <div
                className="font-pixel"
                style={{
                  fontSize: "1.5rem",
                  color: step.color,
                  textShadow: `0 0 10px ${step.color}66`,
                  marginBottom: 12,
                }}
              >
                {step.step}
              </div>
              <h3
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#e2e8f0",
                  marginBottom: 8,
                }}
              >
                {step.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse CTA */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        <Link href="/browse/lost" className="block">
          <div
            className="card-neon-pink"
            style={{
              padding: "32px",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>😢</div>
            <h3
              className="font-pixel glow-pink"
              style={{ fontSize: "0.6rem", color: "#ff007f", marginBottom: 8, letterSpacing: "2px" }}
            >
              BROWSE LOST ITEMS
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              See all items people have lost on campus
            </p>
          </div>
        </Link>

        <Link href="/browse/found" className="block">
          <div
            className="card-neon"
            style={{
              padding: "32px",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎉</div>
            <h3
              className="font-pixel glow-cyan"
              style={{ fontSize: "0.6rem", color: "#00f5ff", marginBottom: 8, letterSpacing: "2px" }}
            >
              BROWSE FOUND ITEMS
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
              See all items people have found on campus
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
}
