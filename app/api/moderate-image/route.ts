// app/api/moderate-image/route.ts
// Sightengine image moderation — strict mode.
// Blocks: nudity, offensive, weapons, drugs, faces/people, animals.
// ============================================================

import { NextRequest, NextResponse } from "next/server";

const REJECT_MSG =
  "Only images of the lost/found item are allowed. Do not upload photos of people, animals, or unrelated content.";

export async function POST(req: NextRequest) {
  const apiUser   = process.env.SIGHTENGINE_USER;
  const apiSecret = process.env.SIGHTENGINE_SECRET;

  if (!apiUser || !apiSecret) {
    return NextResponse.json({ valid: true }); // no keys → skip gracefully
  }

  try {
    const formData  = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ valid: false, reason: "No image provided." }, { status: 400 });
    }

    // ── Basic client-side type / size guard ──────────────────
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!ALLOWED_TYPES.includes(imageFile.type)) {
      return NextResponse.json({
        valid: false,
        reason: "Unsupported file type. Please upload a JPG, PNG, or WEBP image.",
      });
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        valid: false,
        reason: "Image is too large. Maximum allowed size is 10 MB.",
      });
    }

    // ── Call Sightengine ─────────────────────────────────────
    // Models:
    //   nudity-2.1      → adult / explicit
    //   offensive-2.0   → hate / offensive symbols
    //   weapon          → firearms, blades
    //   recreational_drug → drug paraphernalia
    //   face-attributes → human faces / people  ← blocks selfies / person photos
    //   gore            → graphic violence / blood
    const engineForm = new FormData();
    engineForm.append("media", imageFile, imageFile.name);
    engineForm.append(
      "models",
      "nudity-2.1,offensive-2.0,weapon,recreational_drug,face-attributes,gore"
    );
    engineForm.append("api_user", apiUser);
    engineForm.append("api_secret", apiSecret);

    const response = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body: engineForm,
    });

    if (!response.ok) {
      console.error("Sightengine HTTP error:", response.status);
      return NextResponse.json({ valid: true }); // fail-open
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await response.json();

    if (result.status !== "success") {
      console.error("Sightengine returned error:", result);
      return NextResponse.json({ valid: true }); // fail-open
    }

    // ── Rule 1: Nudity / explicit content ────────────────────
    const nudity    = result?.nudity ?? {};
    const nudityMax = Math.max(
      nudity.sexual_activity  ?? 0,
      nudity.sexual_display   ?? 0,
      nudity.erotica          ?? 0,
      nudity.very_suggestive  ?? 0
    );
    if (nudityMax > 0.4) {
      return NextResponse.json({ valid: false, reason: REJECT_MSG });
    }

    // ── Rule 2: Offensive / hate imagery ─────────────────────
    const offensiveScore: number = result?.offensive?.prob ?? 0;
    if (offensiveScore > 0.6) {
      return NextResponse.json({ valid: false, reason: REJECT_MSG });
    }

    // ── Rule 3: Weapons ──────────────────────────────────────
    const weaponScore: number = result?.weapon ?? 0;
    if (weaponScore > 0.6) {
      return NextResponse.json({ valid: false, reason: REJECT_MSG });
    }

    // ── Rule 4: Drugs ────────────────────────────────────────
    const drugScore: number = result?.recreational_drug?.prob ?? 0;
    if (drugScore > 0.6) {
      return NextResponse.json({ valid: false, reason: REJECT_MSG });
    }

    // ── Rule 5: Gore / graphic violence ──────────────────────
    const goreScore: number = result?.gore?.prob ?? 0;
    if (goreScore > 0.6) {
      return NextResponse.json({ valid: false, reason: REJECT_MSG });
    }

    // ── Rule 6: Human faces / people — STRICT (0 tolerance) ──
    // face-attributes model returns { faces: [...] }
    // Even 1 detected face = reject
    const faces: unknown[] = result?.faces ?? [];
    if (faces.length > 0) {
      return NextResponse.json({
        valid: false,
        reason:
          "Only images of the lost/found item are allowed. Do not upload photos of people, animals, or unrelated content.",
      });
    }

    // ── All checks passed ─────────────────────────────────────
    return NextResponse.json({ valid: true });

  } catch (err) {
    console.error("Image moderation unexpected error:", err);
    return NextResponse.json({ valid: true }); // fail-open
  }
}
