// components/BrandTag.tsx
// Fixed bottom-right branding tag — appears on every page via layout.

export default function BrandTag() {
  return (
    <>
      <div className="brand-tag">
        <span className="brand-tag-dot">✦</span>
        <span className="brand-tag-text">Made by Kavya Madani</span>
      </div>

      <style jsx global>{`
        .brand-tag {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9998;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(7, 8, 15, 0.85);
          border: 1px solid rgba(0, 245, 255, 0.5);
          border-radius: 999px;
          padding: 6px 14px 6px 10px;
          backdrop-filter: blur(8px);
          box-shadow:
            0 0 10px rgba(0, 245, 255, 0.2),
            0 0 24px rgba(0, 245, 255, 0.08),
            inset 0 0 12px rgba(0, 245, 255, 0.04);
          cursor: default;
          text-decoration: none;
          animation: brand-float 3.5s ease-in-out infinite;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          user-select: none;
        }

        .brand-tag:hover {
          transform: scale(1.08) translateY(-2px);
          border-color: rgba(0, 245, 255, 0.9);
          box-shadow:
            0 0 18px rgba(0, 245, 255, 0.5),
            0 0 40px rgba(0, 245, 255, 0.2),
            inset 0 0 16px rgba(0, 245, 255, 0.08);
        }

        .brand-tag-dot {
          font-size: 0.65rem;
          color: #ff007f;
          text-shadow: 0 0 6px #ff007f, 0 0 12px #ff007f;
          animation: dot-pulse 2s ease-in-out infinite;
          line-height: 1;
        }

        .brand-tag-text {
          font-family: "Press Start 2P", monospace;
          font-size: 0.42rem;
          color: #00f5ff;
          letter-spacing: 1.5px;
          text-shadow: 0 0 6px rgba(0, 245, 255, 0.7), 0 0 14px rgba(0, 245, 255, 0.3);
          white-space: nowrap;
          line-height: 1;
        }

        /* Floating up-down animation */
        @keyframes brand-float {
          0%,  100% { transform: translateY(0px); }
          50%        { transform: translateY(-5px); }
        }

        /* Pink dot pulse */
        @keyframes dot-pulse {
          0%,  100% { opacity: 1; text-shadow: 0 0 6px #ff007f, 0 0 12px #ff007f; }
          50%        { opacity: 0.5; text-shadow: 0 0 2px #ff007f; }
        }

        /* Mobile: slightly smaller */
        @media (max-width: 640px) {
          .brand-tag {
            bottom: 12px;
            right: 12px;
            padding: 5px 11px 5px 8px;
          }
          .brand-tag-text {
            font-size: 0.35rem;
            letter-spacing: 1px;
          }
          .brand-tag-dot {
            font-size: 0.55rem;
          }
        }
      `}</style>
    </>
  );
}
