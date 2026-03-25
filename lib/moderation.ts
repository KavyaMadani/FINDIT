// ============================================================
// lib/moderation.ts  — Enhanced text + image moderation
// ============================================================

// ── Blocked single words ──────────────────────────────────────
const BLOCKED_WORDS: string[] = [
  // Profanity
  "fuck", "shit", "bitch", "asshole", "bastard", "crap",
  "piss", "slut", "whore", "dick", "cock", "pussy", "ass",
  "boob", "butt", "penis", "vagina", "rape", "kill", "murder",
  // Inappropriate / adult themes
  "sex", "sexy", "nude", "naked", "porn", "adult", "hot girl",
  "hot boy", "nudes", "nsfw", "onlyfans", "escort", "hookup",
  // Romance / unrelated emotions
  "love", "gf", "bf", "crush", "girlfriend", "boyfriend",
  "heartbreak", "breakup", "miss you", "forever alone",
  // Spam / marketing
  "buy now", "click here", "free money", "win prize",
  "congratulations", "100% free", "make money", "earn money",
  "work from home", "bitcoin", "crypto", "investment",
  // Placeholder / test garbage
  "asdf", "qwerty", "xxxx", "aaaa", "lorem ipsum",
  "lmao", "lol", "haha", "hehe", "wtf", "omg", "bruh",
  "yolo", "swag", "random", "idk", "idc",
  // Abuse / threats
  "abuse", "threat", "attack", "racist", "hate",
];

// ── Blocked full phrases ──────────────────────────────────────
const BLOCKED_PHRASES: string[] = [
  "lost in love", "i am lost", "i feel lost", "lost my soul",
  "lost my heart", "lost my mind", "lost my way", "lost in life",
  "nothing to lose", "this is a test", "just testing",
  "test item", "ignore this", "delete this", "feeling sad",
  "feeling lonely", "i'm bored", "just for fun", "for testing",
  "hello world", "sample text", "dummy data", "placeholder",
  "no idea", "don't know", "not sure", "whatever",
];

// ── Fake / reserved name strings ─────────────────────────────
const FAKE_NAMES: string[] = [
  "abc", "xyz", "test", "user", "admin", "root", "name",
  "john doe", "jane doe", "anonymous", "unknown", "nobody",
  "someone", "anyone", "person", "human", "student",
  "aaa", "bbb", "ccc", "zzz", "xxx", "111",
];

// ── Thresholds ────────────────────────────────────────────────
const MIN_TITLE_LEN   = 5;
const MAX_TITLE_LEN   = 120;
const MIN_DESC_LEN    = 15;
const MAX_DESC_LEN    = 1000;
const MIN_NAME_LEN    = 3;
const MAX_NAME_LEN    = 80;

export interface ModerationResult {
  valid: boolean;
  reason?: string;
}

const INVALID_MSG =
  "Please enter valid and appropriate details related to a real lost or found item.";

// ── Text validation ───────────────────────────────────────────
export function validateText(
  field: "title" | "description" | "name",
  content: string
): ModerationResult {
  const raw    = content.trim();
  const lower  = raw.toLowerCase();

  // ─ 1. Empty / length ────────────────────────────────────────
  if (!raw) return { valid: false, reason: `${capitalize(field)} is required.` };

  if (field === "title") {
    if (raw.length < MIN_TITLE_LEN)
      return { valid: false, reason: `Title must be at least ${MIN_TITLE_LEN} characters.` };
    if (raw.length > MAX_TITLE_LEN)
      return { valid: false, reason: `Title must be under ${MAX_TITLE_LEN} characters.` };
  }

  if (field === "description") {
    if (raw.length < MIN_DESC_LEN)
      return {
        valid: false,
        reason: `Description must be at least ${MIN_DESC_LEN} characters. Describe the item in more detail.`,
      };
    if (raw.length > MAX_DESC_LEN)
      return { valid: false, reason: `Description must be under ${MAX_DESC_LEN} characters.` };
  }

  if (field === "name") {
    if (raw.length < MIN_NAME_LEN)
      return { valid: false, reason: `Name must be at least ${MIN_NAME_LEN} characters.` };
    if (raw.length > MAX_NAME_LEN)
      return { valid: false, reason: `Name must be under ${MAX_NAME_LEN} characters.` };

    // Name: only letters (including Unicode) and spaces
    if (!/^[a-zA-Z\u00C0-\u024F\s.'-]+$/.test(raw))
      return {
        valid: false,
        reason: "Name must contain only alphabets and spaces. No numbers or symbols.",
      };

    // Fake / reserved names
    if (FAKE_NAMES.some((fake) => lower === fake || lower.trim() === fake))
      return { valid: false, reason: "Please enter your real full name." };
  }

  // ─ 2. Repeating character spam (aaaa, ...., 1111) ───────────
  if (/^(.)\1{4,}$/.test(lower))
    return { valid: false, reason: INVALID_MSG };

  // ─ 3. Blocked words (whole-word match) ──────────────────────
  for (const word of BLOCKED_WORDS) {
    // Escape special regex chars in the word
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex   = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(lower)) return { valid: false, reason: INVALID_MSG };
  }

  // ─ 4. Blocked phrases (substring match) ─────────────────────
  for (const phrase of BLOCKED_PHRASES) {
    if (lower.includes(phrase)) return { valid: false, reason: INVALID_MSG };
  }

  // ─ 5. Too few real letters (all numbers / symbols) ──────────
  if (field === "title" || field === "description") {
    const letterCount  = (lower.match(/[a-z]/gi) ?? []).length;
    const nonSpaceLen  = lower.replace(/\s/g, "").length;
    if (nonSpaceLen > 0 && letterCount / nonSpaceLen < 0.4)
      return { valid: false, reason: "Please use real words to describe the item." };
  }

  // ─ 6. Title: must contain at least one noun-like word (3+ letters) ─
  if (field === "title") {
    const words = raw.split(/\s+/).filter((w) => /[a-zA-Z]{3,}/.test(w));
    if (words.length === 0)
      return { valid: false, reason: "Title must contain at least one real word." };
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
      console.warn("Image moderation API unavailable — allowing image.");
      return { valid: true };
    }

    const data: ModerationResult = await res.json();
    return data;
  } catch {
    console.warn("Image moderation network error — allowing image.");
    return { valid: true };
  }
}

// ── Utility ───────────────────────────────────────────────────
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
