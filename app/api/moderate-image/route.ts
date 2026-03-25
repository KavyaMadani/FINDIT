// app/api/moderate-image/route.ts
// Server-side image moderation using Sightengine API.
// Blocks: nudity, offensive content, weapons, drugs, faces/people.
// ============================================================

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiUser = process.env.SIGHTENGINE_USER;
  const apiSecret = process.env.SIGHTENGINE_SECRET;

  // ── No API key configured → skip moderation ──────────────
  if (!apiUser || !apiSecret) {
    return NextResponse.json({ valid: true });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { valid: false, reason: "No image provided." },
        { status: 400 }
      );
    }

    // ── Basic file checks (always run) ──────────────────────
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json({
        valid: false,
        reason: "Unsupported file type. Please upload a JPG, PNG, or WEBP image.",
      });
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        valid: false,
        reason: "Image is too large. Maximum allowed size is 10MB.",
      });
    }

    // ── Call Sightengine API ─────────────────────────────────
    // Models used:
    //   nudity-2.1    → adult/explicit content
    //   offensive-2.0 → offensive / hate imagery
    //   weapon        → firearms, knives
    //   recreational_drug → drug imagery
    //   face-attributes   → detects human faces / people ← NEW
    const engineForm = new FormData();
    engineForm.append("media", imageFile, imageFile.name);
    engineForm.append(
      "models",
      "nudity-2.1,offensive-2.0,weapon,recreational_drug,face-attributes"
    );
    engineForm.append("api_user", apiUser);
    engineForm.append("api_secret", apiSecret);

    const response = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      body: engineForm,
    });

    if (!response.ok) {
      // Sightengine unreachable → fail-open
      console.error("Sightengine API HTTP error:", response.status);
      return NextResponse.json({ valid: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await response.json();

    if (result.status !== "success") {
      console.error("Sightengine error:", result);
      return NextResponse.json({ valid: true }); // fail-open
    }

    // ── Evaluation thresholds ────────────────────────────────

    // 1. Nudity / adult content
    const nudity = result?.nudity ?? {};
    const nudityMax = Math.max(
      nudity.sexual_activity ?? 0,
      nudity.sexual_display ?? 0,
      nudity.erotica ?? 0,
      nudity.very_suggestive ?? 0
    );
    if (nudityMax > 0.5) {
      return NextResponse.json({
        valid: false,
        reason: "This image is not allowed. Please upload a real photo of the lost/found item.",
      });
    }

    // 2. Offensive / hate imagery
    const offensiveScore: number = result?.offensive?.prob ?? 0;
    if (offensiveScore > 0.7) {
      return NextResponse.json({
        valid: false,
        reason: "This image is not allowed. Please upload a real photo of the lost/found item.",
      });
    }

    // 3. Weapons
    const weaponScore: number = result?.weapon ?? 0;
    if (weaponScore > 0.7) {
      return NextResponse.json({
        valid: false,
        reason: "This image is not allowed. Please upload a real photo of the lost/found item.",
      });
    }

    // 4. Drugs
    const drugScore: number = result?.recreational_drug?.prob ?? 0;
    if (drugScore > 0.7) {
      return NextResponse.json({
        valid: false,
        reason: "This image is not allowed. Please upload a real photo of the lost/found item.",
      });
    }

    // 5. Faces / People — STRICT: zero faces allowed ─────────
    // face-attributes returns { faces: [ { ... } ] }
    // If any face is detected in the image, reject it.
    const faces: unknown[] = result?.faces ?? [];
    if (faces.length > 0) {
      return NextResponse.json({
        valid: false,
        reason:
          "Images containing people or faces are not allowed. Please upload a clear photo of only the item.",
      });
    }

    // ── All checks passed ────────────────────────────────────
    return NextResponse.json({ valid: true });

  } catch (err) {
    console.error("Image moderation unexpected error:", err);
    return NextResponse.json({ valid: true }); // fail-open on unexpected errors
  }
}
