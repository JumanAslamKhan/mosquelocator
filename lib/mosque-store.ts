import { getSupabaseAdminClient } from "@/lib/supabase-server";
import { formatDistance, haversineDistanceKm } from "@/lib/haversine";
import { seedMosques } from "@/lib/seed-mosques";
import type { Mosque, MosqueInput } from "@/lib/types";

let fallbackMosques = seedMosques.map((mosque) => ({ ...mosque }));

function normalizeText(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function matchesQuery(mosque: Mosque, query?: string) {
  if (!query) {
    return true;
  }

  const normalizedQuery = normalizeText(query);

  return [mosque.name, mosque.address, mosque.city, mosque.description, ...(mosque.facilities ?? [])]
    .filter(Boolean)
    .some((field) => normalizeText(String(field)).includes(normalizedQuery));
}

function decorateMosque(mosque: Mosque, lat?: number, lng?: number) {
  if (typeof lat !== "number" || typeof lng !== "number") {
    return mosque;
  }

  const distanceKm = haversineDistanceKm(lat, lng, mosque.lat, mosque.lng);

  return {
    ...mosque,
    distanceKm,
    distanceLabel: formatDistance(distanceKm),
  };
}

function toMosque(row: Partial<Mosque> & Record<string, unknown>): Mosque {
  return {
    id: String(row.id),
    name: String(row.name ?? "Unnamed mosque"),
    address: String(row.address ?? ""),
    lat: Number(row.lat ?? 0),
    lng: Number(row.lng ?? 0),
    phone: (row.phone as string | null | undefined) ?? null,
    timings: (row.timings as Mosque["timings"]) ?? null,
    created_at: String(row.created_at ?? new Date().toISOString()),
    owner_id: (row.owner_id as string | null | undefined) ?? null,
    city: (row.city as string | null | undefined) ?? null,
    description: (row.description as string | null | undefined) ?? null,
    facilities: Array.isArray(row.facilities) ? (row.facilities as string[]) : [],
    photos: Array.isArray(row.photos) ? (row.photos as string[]) : [],
  };
}

async function fetchMosqueRows() {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return fallbackMosques;
  }

  const { data, error } = await supabase.from("mosques").select("*").order("created_at", { ascending: false });

  if (error) {
    console.warn("Falling back to local mosque data because Supabase query failed.", error);
    return fallbackMosques;
  }

  return (data ?? []).map((row) => toMosque(row as Partial<Mosque> & Record<string, unknown>));
}

export async function listMosques(options: { q?: string; lat?: number; lng?: number; ownerId?: string }) {
  const rows = await fetchMosqueRows();
  const filtered = rows.filter((mosque) => matchesQuery(mosque, options.q)).filter((mosque) => !options.ownerId || mosque.owner_id === options.ownerId);

  const decorated = filtered.map((mosque) => decorateMosque(mosque, options.lat, options.lng));

  return decorated.sort((left, right) => {
    if (typeof left.distanceKm === "number" && typeof right.distanceKm === "number") {
      return left.distanceKm - right.distanceKm;
    }

    return right.created_at.localeCompare(left.created_at);
  });
}

export async function getMosqueById(id: string) {
  const rows = await fetchMosqueRows();
  return rows.find((mosque) => mosque.id === id) ?? null;
}

export async function createMosque(input: MosqueInput) {
  const supabase = getSupabaseAdminClient();
  const mosque = {
    id: crypto.randomUUID(),
    name: input.name,
    address: input.address,
    lat: input.lat,
    lng: input.lng,
    phone: input.phone ?? null,
    timings: input.timings ?? null,
    created_at: new Date().toISOString(),
    owner_id: input.owner_id ?? null,
    city: input.city ?? null,
    description: input.description ?? null,
    facilities: input.facilities ?? [],
    photos: input.photos ?? [],
  } satisfies Mosque;

  if (!supabase) {
    fallbackMosques = [mosque, ...fallbackMosques];
    return mosque;
  }

  const { data, error } = await supabase.from("mosques").insert(mosque).select("*").single();

  if (error) {
    throw new Error(error.message || "Supabase insert failed while saving the mosque.");
  }

  return toMosque(data as Partial<Mosque> & Record<string, unknown>);
}

export async function updateMosque(id: string, input: Partial<MosqueInput>) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    const index = fallbackMosques.findIndex((mosque) => mosque.id === id);

    if (index === -1) {
      return null;
    }

    fallbackMosques[index] = {
      ...fallbackMosques[index],
      ...input,
      facilities: input.facilities ?? fallbackMosques[index].facilities,
      photos: input.photos ?? fallbackMosques[index].photos,
      owner_id: input.owner_id ?? fallbackMosques[index].owner_id,
      timings: input.timings ?? fallbackMosques[index].timings,
    };

    return fallbackMosques[index];
  }

  const { data, error } = await supabase.from("mosques").update(input).eq("id", id).select("*").single();

  if (error) {
    throw error;
  }

  return toMosque(data as Partial<Mosque> & Record<string, unknown>);
}