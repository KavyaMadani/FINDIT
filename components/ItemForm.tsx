"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addItem, Category, ItemType } from "@/lib/store";
import { validateText, validateImage } from "@/lib/moderation";
import ConfirmPopup from "@/components/ConfirmPopup";
import SafetyWarning from "@/components/SafetyWarning";

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

// Status type for clearer state machine
type SubmitStatus =
  | "idle"
  | "moderating"   // ← NEW: running content checks
  | "uploading"
  | "saving"
  | "done";

export default function ItemForm({ type }: ItemFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(DEFAULT_FORM);

  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  const [showPopup, setShowPopup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitted, setSubmitted] = useState(false);

  // Field errors (validation + moderation combined)
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Single top-level moderation error banner
  const [moderationError, setModerationError] = useState<string | null>(null);

  // Safety confirmation checkbox
  const [confirmed, setConfirmed] = useState(false);
  const [checkboxError, setCheckboxError] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const isLost = type === "lost";
  const accentColor = isLost ? "#ff007f" : "#00f5ff";
  const btnClass = isLost ? "btn-pink" : "btn-cyan";

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setModerationError(null);
  };

  const handleImage = (file: File) => {
    setImageFile(file);
    setModerationError(null);
    setErrors((prev) => ({ ...prev, image: "" }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── Basic field validation ────────────────────────────────
  const validateFields = () => {
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

  // ── Run moderation checks ─────────────────────────────────
  const runModeration = async (): Promise<boolean> => {
    setSubmitStatus("moderating");
    setModerationError(null);

    // 1. Text checks — title, description, name
    const textChecks: [string, "title" | "description" | "name"][] = [
      [form.title, "title"],
      [form.description, "description"],
      [form.name, "name"],
    ];

    for (const [value, field] of textChecks) {
      const result = validateText(field, value);
      if (!result.valid) {
        setErrors((prev) => ({ ...prev, [field]: result.reason ?? "Invalid content." }));
        setModerationError("Please fix the highlighted fields before submitting.");
        setSubmitStatus("idle");
        return false;
      }
    }

    // 2. Image check (only if image is attached)
    if (imageFile) {
      const imgResult = await validateImage(imageFile);
      if (!imgResult.valid) {
        setErrors((prev) => ({ ...prev, image: imgResult.reason ?? "Image not allowed." }));
        setModerationError(
          imgResult.reason ??
          "This image is not allowed. Please upload a real photo of the lost/found item."
        );
        setSubmitStatus("idle");
        return false;
      }
    }

    return true; // all checks passed
  };

  // ── Handle form submit ────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Checkbox guard
    if (!confirmed) {
      setCheckboxError(true);
      return;
    }
    setCheckboxError(false);

    // Required field validation
    const errs = validateFields();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    // Moderation
    const passed = await runModeration();
    if (!passed) {
      setSubmitting(false);
      return;
    }

    // Found item → confirmation popup
    if (type === "found") {
      setSubmitStatus("idle");
      setShowPopup(true);
    } else {
      await doSubmit();
    }
  };

  // ── Save to Supabase ──────────────────────────────────────
  const doSubmit = async () => {
    setSubmitting(true);
    try {
      if (imageFile) setSubmitStatus("uploading");
      else setSubmitStatus("saving");

      await addItem(
        { ...form, type, imageUrl: undefined },
        imageFile
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

  // ── Button label based on current status ─────────────────
  const btnLabel = () => {
    if (submitStatus === "moderating") return "CHECKING CONTENT…";
    if (submitStatus === "uploading") return "UPLOADING IMAGE…";
    if (submitStatus === "saving") return "SAVING…";
    if (submitStatus === "done") return "POSTED! ✓";
    return `POST ${type.toUpperCase()} ITEM`;
  };

  // ── Status indicator text ─────────────────────────────────
  const statusText = () => {
    if (submitStatus === "moderating") return "🔍 Checking content for safety…";
    if (submitStatus === "uploading") return "⏳ Uploading image to Supabase Storage…";
    if (submitStatus === "saving") return "⏳ Saving to database…";
    return null;
  };

  // ── Success screen ────────────────────────────────────────
  if (submitted) {
    return (
      <div
        className="card-neon"
        style={{ padding: "48px 32px", textAlign: "center", maxWidth: 500, margin: "0 auto" }}
      >
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
        <h2
          className="font-pixel glow-cyan"
          style={{ fontSize: "0.65rem", color: "#00f5ff", marginBottom: 12 }}
        >
          ITEM POSTED!
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
          Passed content review. Saved to Supabase. Redirecting…
        </p>
      </div>
    );
  }

  return (
    <>
      {showPopup && (
        <ConfirmPopup
          onConfirm={() => { setShowPopup(false); doSubmit(); }}
          onCancel={() => { setShowPopup(false); setSubmitting(false); }}
        />
      )}

      {/* Safety Warning */}
      <SafetyWarning />

      {/* Confirmation checkbox */}
      <div
        style={{
          marginBottom: 28,
          padding: "16px 20px",
          background: "rgba(255,255,255,0.02)",
          border: checkboxError
            ? "1px solid rgba(255,0,127,0.6)"
            : "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8,
          transition: "border-color 0.2s",
        }}
      >
        <label
          htmlFor="safetyConfirm"
          style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}
        >
          <input
            id="safetyConfirm"
            type="checkbox"
            checked={confirmed}
            onChange={(e) => {
              setConfirmed(e.target.checked);
              if (e.target.checked) setCheckboxError(false);
            }}
            style={{
              width: 18, height: 18, marginTop: 2,
              accentColor, cursor: "pointer", flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: "0.85rem",
              color: confirmed ? accentColor : "#94a3b8",
              lineHeight: 1.5,
              fontWeight: confirmed ? 600 : 400,
              transition: "color 0.2s",
            }}
          >
            I confirm this is a real lost/found item and I will verify the owner before returning it
          </span>
        </label>
        {checkboxError && (
          <p style={{ color: "#ff007f", fontSize: "0.75rem", marginTop: 8, marginLeft: 30 }}>
            ⚠️ You must confirm this before submitting.
          </p>
        )}
      </div>

      {/* Global moderation error banner */}
      {moderationError && (
        <div
          style={{
            marginBottom: 20,
            padding: "14px 18px",
            background: "rgba(255,0,127,0.08)",
            border: "1px solid rgba(255,0,127,0.5)",
            borderRadius: 8,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>🚫</span>
          <p style={{ color: "#ff007f", fontSize: "0.85rem", lineHeight: 1.5 }}>
            {moderationError}
          </p>
        </div>
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
            <label className="label-neon" htmlFor="title">Item Title *</label>
            <input
              id="title" name="title" className="input-neon"
              placeholder="e.g. Blue JBL Earbuds"
              value={form.title} onChange={handleChange}
              style={{ borderColor: errors.title ? "rgba(255,0,127,0.6)" : undefined }}
            />
            {errors.title && (
              <p style={{ color: "#ff007f", fontSize: "0.75rem", marginTop: 4 }}>{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="label-neon" htmlFor="category">Category *</label>
            <select
              id="category" name="category" className="input-neon"
              value={form.category} onChange={handleChange}
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
              id="date" name="date" type="date" className="input-neon"
              value={form.date} onChange={handleChange}
              style={{ colorScheme: "dark" }}
            />
            {errors.date && (
              <p style={{ color: "#ff007f", fontSize: "0.75rem", marginTop: 4 }}>{errors.date}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="label-neon" htmlFor="location">
              Location {isLost ? "Lost" : "Found"} *
            </label>
            <input
              id="location" name="location" className="input-neon"
              placeholder="e.g. Library 2nd Floor"
              value={form.location} onChange={handleChange}
            />
            {errors.location && (
              <p style={{ color: "#ff007f", fontSize: "0.75rem", marginTop: 4 }}>{errors.location}</p>
            )}
          </div>

          {/* Description */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label-neon" htmlFor="description">Description *</label>
            <textarea
              id="description" name="description" className="input-neon"
              rows={3}
              placeholder="Describe the item in detail — color, brand, unique marks…"
              value={form.description} onChange={handleChange}
              style={{
                resize: "vertical",
                borderColor: errors.description ? "rgba(255,0,127,0.6)" : undefined,
              }}
            />
            {errors.description && (
              <p style={{ color: "#ff007f", fontSize: "0.75rem", marginTop: 4 }}>{errors.description}</p>
            )}
          </div>

          {/* Image upload */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label-neon">Image (optional)</label>
            <div
              style={{
                border: errors.image
                  ? "2px dashed rgba(255,0,127,0.5)"
                  : "2px dashed rgba(0,245,255,0.2)",
                borderRadius: 8, padding: "20px", textAlign: "center",
                cursor: "pointer", background: "rgba(0,245,255,0.02)",
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
                  src={imagePreview} alt="preview"
                  style={{ maxHeight: 160, maxWidth: "100%", borderRadius: 6, margin: "0 auto" }}
                />
              ) : (
                <div style={{ color: "#64748b" }}>
                  <div style={{ fontSize: "2rem", marginBottom: 6 }}>📸</div>
                  <p style={{ fontSize: "0.8rem" }}>Click or drag & drop an image</p>
                  <p style={{ fontSize: "0.7rem", marginTop: 4, color: "#475569" }}>
                    Content is checked for safety before upload
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileRef} type="file" accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f); }}
            />
            {errors.image && (
              <p style={{ color: "#ff007f", fontSize: "0.75rem", marginTop: 6 }}>
                🚫 {errors.image}
              </p>
            )}
            {imagePreview && !errors.image && (
              <button
                type="button"
                onClick={() => {
                  setImagePreview(undefined); setImageFile(undefined);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                style={{
                  marginTop: 6, fontSize: "0.75rem", color: "#ff007f",
                  background: "none", border: "none", cursor: "pointer",
                }}
              >
                ✕ Remove image
              </button>
            )}
          </div>

          {/* Contact info section */}
          <div style={{ gridColumn: "1 / -1" }}>
            <h3
              className="font-pixel"
              style={{
                fontSize: "0.5rem", color: accentColor,
                letterSpacing: "2px", marginBottom: 16,
                paddingTop: 8, borderTop: `1px solid ${accentColor}22`,
              }}
            >
              YOUR CONTACT INFO
            </h3>
          </div>

          <div>
            <label className="label-neon" htmlFor="name">Your Name *</label>
            <input
              id="name" name="name" className="input-neon"
              placeholder="Full name"
              value={form.name} onChange={handleChange}
              style={{ borderColor: errors.name ? "rgba(255,0,127,0.6)" : undefined }}
            />
            {errors.name && (
              <p style={{ color: "#ff007f", fontSize: "0.75rem", marginTop: 4 }}>{errors.name}</p>
            )}
          </div>

          <div>
            <label className="label-neon" htmlFor="email">Your Email *</label>
            <input
              id="email" name="email" type="email" className="input-neon"
              placeholder="you@campus.edu"
              value={form.email} onChange={handleChange}
            />
            {errors.email && (
              <p style={{ color: "#ff007f", fontSize: "0.75rem", marginTop: 4 }}>{errors.email}</p>
            )}
          </div>

          <div>
            <label className="label-neon" htmlFor="phone">Phone Number (optional)</label>
            <input
              id="phone" name="phone" type="tel" className="input-neon"
              placeholder="e.g. 9876543210"
              value={form.phone} onChange={handleChange}
            />
          </div>
        </div>

        {/* Submit bar */}
        <div style={{ marginTop: 32 }}>
          {!confirmed && (
            <p style={{ fontSize: "0.75rem", color: "#64748b", textAlign: "right", marginBottom: 8 }}>
              ☝️ Check the confirmation above to enable submit
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {submitting && statusText() && (
              <span
                style={{
                  fontSize: "0.75rem",
                  color: submitStatus === "moderating" ? "#ffe600" : "#00f5ff",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {statusText()}
              </span>
            )}
            <button
              type="submit"
              className={btnClass}
              disabled={submitting || !confirmed}
              style={{
                minWidth: 220,
                opacity: submitting || !confirmed ? 0.5 : 1,
                cursor: !confirmed ? "not-allowed" : submitting ? "wait" : "pointer",
              }}
            >
              {btnLabel()}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
