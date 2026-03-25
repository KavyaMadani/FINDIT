// ============================================================
// lib/moderation.ts
// Content moderation helpers — text + image (via API route).
// No external API key required for text.
// Image moderation calls /api/moderate-image (Sightengine).
// ============================================================

// ── Blocked word / phrase list ────────────────────────────────
const BLOCKED_WORDS = [
  // Profanity (common, safe to keep list short in src)
  "fuck", "shit", "bitch", "asshole", "bastard", "crap", "damn", "hell",
  "piss", "slut", "whore", "dick", "cock", "pussy", "ass",
  // Spam / nonsense indicators
  "buy now", "click here", "free money", "win prize", "congratulations",
  "100% free", "make money", "earn money", "work from home",
  // Romance / unrelated
  "lost in love", "losing my mind", "broken heart", "love you",
  "miss you", "forever alone", "heartbreak",
  // Test / placeholder
  "test", "asdf", "qwerty", "1234", "xxxx", "aaaa", "lorem ipsum",
  "abc", "xyz", "lmao", "lol", "haha", "hehe", "wtf", "omg",
];

const BLOCKED_PHRASES = [
  "i am lost",
  "i feel lost",
  "lost my soul",
  "lost my heart",
  "lost my mind",
  "lost my way",
  "lost in life",
  "nothing to lose",
  "this is a test",
  "just testing",
  "ignore this",
  "delete this",
];

// Minimum meaningful content thresholds
const MIN_TITLE_LENGTH = 5;
const MAX_TITLE_LENGTH = 120;
const MIN_DESC_LENGTH = 15;
const MAX_DESC_LENGTH = 1000;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 80;

export interface ModerationResult {
  valid: boolean;
  reason?: string; // shown to user if invalid
}

// ── Text validation ───────────────────────────────────────────
export function validateText(
  field: "title" | "description" | "name",
  content: string
): ModerationResult {
  const trimmed = content.trim().toLowerCase();

  // 1. Length checks
  if (field === "title") {
    if (trimmed.length < MIN_TITLE_LENGTH)
      return { valid: false, reason: `Title is too short (min ${MIN_TITLE_LENGTH} chars).` };
    if (trimmed.length > MAX_TITLE_LENGTH)
      return { valid: false, reason: `Title is too long (max ${MAX_TITLE_LENGTH} chars).` };
  }

  if (field === "description") {
    if (trimmed.length < MIN_DESC_LENGTH)
      return {
        valid: false,
        reason: `Description is too short. Add more detail about the item (min ${MIN_DESC_LENGTH} chars).`,
      };
    if (trimmed.length > MAX_DESC_LENGTH)
      return { valid: false, reason: `Description is too long (max ${MAX_DESC_LENGTH} chars).` };
  }

  if (field === "name") {
    if (trimmed.length < MIN_NAME_LENGTH)
      return { valid: false, reason: "Name is too short." };
    if (trimmed.length > MAX_NAME_LENGTH)
      return { valid: false, reason: "Name is too long." };
    // Name should have at least one letter
    if (!/[a-z]/i.test(trimmed))
      return { valid: false, reason: "Please enter a real name." };
  }

  // 2. Repeating character spam (e.g. "aaaaaa", "......")
  if (/^(.)\1{4,}$/.test(trimmed)) {
    return {
      valid: false,
      reason: "Please enter a valid item description. Avoid jokes, spam, or inappropriate language.",
    };
  }

  // 3. Blocked words
  for (const word of BLOCKED_WORDS) {
    // Match whole-word or close match
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(trimmed)) {
      return {
        valid: false,
        reason: "Please enter a valid item description. Avoid jokes, spam, or inappropriate language.",
      };
    }
  }

  // 4. Blocked phrases — exact substring match
  for (const phrase of BLOCKED_PHRASES) {
    if (trimmed.includes(phrase)) {
      return {
        valid: false,
        reason: "Please enter a valid item description. Avoid jokes, spam, or inappropriate language.",
      };
    }
  }

  // 5. Only numbers / special chars — no real words
  if (field === "title" || field === "description") {
    const letterCount = (trimmed.match(/[a-z]/gi) ?? []).length;
    const totalChars = trimmed.replace(/\s/g, "").length;
    if (totalChars > 0 && letterCount / totalChars < 0.4) {
      return {
        valid: false,
        reason: "Please enter a meaningful item description using real words.",
      };
    }
  }

  return { valid: true };
}

// ── Image moderation (calls Next.js API route) ────────────────
export async function validateImage(file: File): Promise<ModerationResult> {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/moderate-image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      // If API route fails / not configured → allow the image
      // (fail-open so missing API keys don't block legitimate users)
      console.warn("Image moderation API unavailable — allowing image.");
      return { valid: true };
    }

    const data: ModerationResult = await res.json();
    return data;
  } catch {
    // Network error → fail-open
    console.warn("Image moderation network error — allowing image.");
    return { valid: true };
  }
}
