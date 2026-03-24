import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Campus LostLink – Lost & Found Portal",
  description:
    "A retro-themed campus lost and found portal. Post lost or found items and connect with fellow students to reunite belongings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="scanlines grid-bg min-h-screen">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="border-t border-cyan-900/30 py-8 text-center mt-16">
          <p className="font-pixel text-[0.45rem] text-cyan-700 tracking-widest">
            © 2026 CAMPUS LOSTLINK · LOST &amp; FOUND PORTAL
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Built with ❤️ — Reuniting campus belongings, one item at a time
          </p>
        </footer>
      </body>
    </html>
  );
}
