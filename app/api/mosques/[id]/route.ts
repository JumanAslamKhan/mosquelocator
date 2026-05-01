import { NextRequest, NextResponse } from "next/server";

import { getMosqueById, updateMosque } from "@/lib/mosque-store";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const mosque = await getMosqueById(id);

  if (!mosque) {
    return NextResponse.json({ error: "Mosque not found" }, { status: 404 });
  }

  return NextResponse.json({ mosque });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const mosque = await updateMosque(id, body);

  if (!mosque) {
    return NextResponse.json({ error: "Mosque not found" }, { status: 404 });
  }

  return NextResponse.json({ mosque });
}