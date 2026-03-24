"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addItem, Category, ItemType } from "@/lib/store";
import ConfirmPopup from "@/components/ConfirmPopup";

interface ItemFormProps {
  type: ItemType;
}

const CATEGORIES: Category[] = [
  "phone", "wallet", "bag", "keys",
  "electronics", "books", "bottle", "other",
];

const CATEGORY_EMOJI: Record<string, string> = {
  phone: "📱", wallet: "👛", bag: "🎒", keys: "🔑",
  electronics: "💻", books: "📚", bottle: "🍶", other: "📦",
};

const DEFAULT_FORM = {
  title: "",
  category: "other" as Category,
  description: "",
  location: "",
  date: new Date().toISOString().slice(0, 10),
  name: "",
  email: "",
  phone: "",
};

export default function ItemForm({ type }: ItemFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(DEFAULT_FORM);

  // imagePreview — only for display (base64). imageFile — the real File to upload.
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  const [showPopup, setShowPopup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "uploading" | "saving" | "done">("idle");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const isLost = type === "lost";
  const accentColor = isLost ? "#ff007f" : "#00f5ff";
  const btnClass = isLost ? "btn-pink" : "btn-cyan";

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleImage = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (!form.location.trim()) errs.location = "Location is required";
    if (!form.date) errs.date = "Date is required";
    if (!form.name.trim()) errs.name = "Your name is required";
    if (!form.email.trim()) errs.email = "Your email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    return errs;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (type === "found") {
      setShowPopup(true);
    } else {
      doSubmit();
    }
  };

  const doSubmit = async () => {
    setSubmitting(true);
    try {
      if (imageFile) setSubmitStatus("uploading");
      else setSubmitStatus("saving");

      await addItem(
        { ...form, type, imageUrl: undefined },
        imageFile // pass raw File — store.ts handles upload
      );

      setSubmitStatus("done");
      setSubmitted(true);
      setTimeout(() => router.push(`/browse/${type}`), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      alert(`❌ Error: ${message}`);
      setSubmitting(false);
      setSubmitStatus("idle");
    }
  };

  // ── Submit button label based on status ───────────────────
  const btnLabel = () => {
    if (submitStatus === "uploading") return "UPLOADING IMAGE…";
    if (submitStatus === "saving") return "SAVING…";
    if (submitStatus === "done") return "POSTED! ✓";
    return `POST ${type.toUpperCase()} ITEM`;
  };

  if (submitted) {
    return (
      <div
        className="card-neon"
        style={{
          padding: "48px 32px",
          textAlign: "center",
          maxWidth: 500,
          margin: "0 auto",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
        <h2
          className="font-pixel glow-cyan"
          style={{ fontSize: "0.65rem", color: "#00f5ff", marginBottom: 12 }}
        >
          ITEM POSTED!
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
          Saved to Supabase. Redirecting to browse page…
        </p>
      </div>
    );
  }

  return (
    <>
      {showPopup && (
        <ConfirmPopup
          onConfirm={() => {
            setShowPopup(false);
            doSubmit();
          }}
          onCancel={() => setShowPopup(false)}
        />
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Title */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label-neon" htmlFor="title">
              Item Title *
            </label>
            <input
              id="title"
              name="title"
              className="input-neon"
              placeholder="e.g. Blue JBL Earbuds"
              value={form.title}
              onChange={handleChange}
            />
            {errors.title && <p style={{ color: "#ff007f", fontSize: "0.75rem", marginTop: 4 }}>{errors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="label-neon" htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              className="input-neon"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_EMOJI[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="label-neon" htmlFor="date">
              Date {isLost ? "Lost" : "Found"} *
            </label>
            <input
              id="date"
              name="date"
              type="date"
              className="input-neon"
              value={form.date}
              onChange={handleChange}
              style={{ colorScheme: "dark" }}
            />
            {errors.date && <p style={{ color: "#ff007f", fontSize: "0.75rem", marginTop: 4 }}>{errors.date}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="label-neon" htmlFor="location">
              Location {isLost ? "Lost" : "Found"} *
            </label>
            <input
              id="location"
              name="location"
              className="input-neon"
              placeholder="e.g. Library 2nd Floor"
              value={form.location}
              onChange={handleChange}
            />
            {errors.location && <p style={{ color: "#ff007f", fontSize: "0.75rem", marginTop: 4 }}>{errors.location}</p>}
          </div>

          {/* Description */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label-neon" htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              className="input-neon"
              rows={3}
              placeholder="Describe the item in detail — color, brand, unique marks…"
              value={form.description}
              onChange={handleChange}
              style={{ resize: "vertical" }}
            />
            {errors.description && <p style={{ color: "#ff007f", fontSize: "0.75rem", marginTop: 4 }}>{errors.description}</p>}
          </div>

          {/* Image upload */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label-neon">Image (optional)</label>
            <div
              style={{
                border: "2px dashed rgba(0,245,255,0.2)",
                borderRadius: 8,
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                background: "rgba(0,245,255,0.02)",
                transition: "border-color 0.2s",
              }}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleImage(file);
              }}
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="preview"
                  style={{ maxHeight: 160, maxWidth: "100%", borderRadius: 6, margin: "0 auto" }}
                />
              ) : (
                <div style={{ color: "#64748b" }}>
                  <div style={{ fontSize: "2rem", marginBottom: 6 }}>📸</div>
                  <p style={{ fontSize: "0.8rem" }}>Click or drag & drop an image</p>
                  <p style={{ fontSize: "0.7rem", marginTop: 4, color: "#475569" }}>
                    Will be uploaded to Supabase Storage
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImage(file);
              }}
            />
            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  setImagePreview(undefined);
                  setImageFile(undefined);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                style={{
                  marginTop: 6,
                  fontSize: "0.75rem",
                  color: "#ff007f",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✕ Remove image
              </button>
            )}
          </div>

          {/* Contact info */}
          <div style={{ gridColumn: "1 / -1" }}>
            <h3
              className="font-pixel"
              style={{
                fontSize: "0.5rem",
                color: accentColor,
                letterSpacing: "2px",
                marginBottom: 16,
                paddingTop: 8,
                borderTop: `1px solid ${accentColor}22`,
              }}
            >
              YOUR CONTACT INFO
            </h3>
          </div>

          <div>
            <label className="label-neon" htmlFor="name">Your Name *</label>
            <input
              id="name"
              name="name"
              className="input-neon"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p style={{ color: "#ff007f", fontSize: "0.75rem", marginTop: 4 }}>{errors.name}</p>}
          </div>

          <div>
            <label className="label-neon" htmlFor="email">Your Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input-neon"
              placeholder="you@campus.edu"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <p style={{ color: "#ff007f", fontSize: "0.75rem", marginTop: 4 }}>{errors.email}</p>}
          </div>

          <div>
            <label className="label-neon" htmlFor="phone">
              Phone Number (optional)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="input-neon"
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16 }}>
          {submitting && submitStatus === "uploading" && (
            <span style={{ fontSize: "0.75rem", color: "#00f5ff" }}>
              ⏳ Uploading image to Supabase Storage…
            </span>
          )}
          {submitting && submitStatus === "saving" && (
            <span style={{ fontSize: "0.75rem", color: "#00f5ff" }}>
              ⏳ Saving to database…
            </span>
          )}
          <button
            type="submit"
            className={btnClass}
            disabled={submitting}
            style={{ minWidth: 200, opacity: submitting ? 0.7 : 1 }}
          >
            {btnLabel()}
          </button>
        </div>
      </form>
    </>
  );
}
