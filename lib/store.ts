// ============================================================
// lib/store.ts — Supabase backend version
// All data operations now go through Supabase.
// UI components remain unchanged.
// ============================================================

// Items older than 10 days are hidden from browse pages.
const DAYS_VISIBLE = 10;

/** Returns ISO timestamp for N days ago (used as .gte filter) */
function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

import { supabase } from "./supabase";

export type ItemType = "lost" | "found";

export type Category =
  | "phone"
  | "wallet"
  | "bag"
  | "keys"
  | "electronics"
  | "books"
  | "bottle"
  | "other";

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  category: Category;
  description: string;
  location: string;
  date: string;
  imageUrl?: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

// Map Supabase snake_case row → camelCase Item
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Item {
  return {
    id: row.id,
    type: row.type as ItemType,
    title: row.title,
    category: row.category as Category,
    description: row.description,
    location: row.location,
    date: row.date,
    imageUrl: row.image_url ?? undefined,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    createdAt: row.created_at,
  };
}

// ── Fetch all items (last 10 days) ordered by newest first ──
export async function getAllItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .gte("created_at", daysAgoISO(DAYS_VISIBLE))
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

// ── Fetch items by type (last 10 days) ──────────────────────
export async function getItemsByType(type: ItemType): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("type", type)
    .gte("created_at", daysAgoISO(DAYS_VISIBLE))
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

// ── Fetch single item by ID ──────────────────────────────────
export async function getItemById(id: string): Promise<Item | null> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return mapRow(data);
}

// ── Upload image to Supabase Storage, return public URL ──────
async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `items/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("item-images")
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

  const { data } = supabase.storage
    .from("item-images")
    .getPublicUrl(path);

  return data.publicUrl;
}

// ── Insert new item into Supabase ────────────────────────────
export async function addItem(
  data: Omit<Item, "id" | "createdAt">,
  imageFile?: File // raw File object from the form input
): Promise<Item> {
  let imageUrl: string | undefined = data.imageUrl; // fallback for base64 preview

  // If a real File was provided, upload it to Storage instead
  if (imageFile) {
    imageUrl = await uploadImage(imageFile);
  }

  const { data: inserted, error } = await supabase
    .from("items")
    .insert({
      type: data.type,
      title: data.title,
      category: data.category,
      description: data.description,
      location: data.location,
      date: data.date,
      image_url: imageUrl ?? null,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save item: ${error.message}`);
  return mapRow(inserted);
}
