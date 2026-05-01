import { NextRequest, NextResponse } from "next/server";

import { getPrayerTimes } from "@/lib/aladhan";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const prayerTimes = await getPrayerTimes(lat, lng);

  return NextResponse.json({ prayerTimes });
}