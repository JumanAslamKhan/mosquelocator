import { NextRequest, NextResponse } from "next/server";

import { createMosque, listMosques } from "@/lib/mosque-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") ?? undefined;
  const lat = searchParams.get("lat") ? Number(searchParams.get("lat")) : undefined;
  const lng = searchParams.get("lng") ? Number(searchParams.get("lng")) : undefined;
  const ownerId = searchParams.get("ownerId") ?? undefined;

  const mosques = await listMosques({ q, lat, lng, ownerId });

  return NextResponse.json({ mosques });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Require an owner_id to prevent anonymous/unauthenticated creates.
    // The client should include the logged-in user's id as `owner_id`.
    if (!body?.owner_id) {
      return NextResponse.json({ error: "Authentication required to create a mosque." }, { status: 401 });
    }

    const mosque = await createMosque(body);

    return NextResponse.json({ mosque }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save the mosque.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}