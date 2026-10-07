import { NextResponse } from "next/server";
import { v1 as uuidv1, v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const version = body.version === "v1" ? "v1" : "v4";
    const count = Number(body.count ?? 1);

    if (!Number.isInteger(count) || count < 1 || count > 1000) {
      return NextResponse.json(
        { success: false, error: "Count must be between 1 and 1000" },
        { status: 400 }
      );
    }

    const uuids = Array.from({ length: count }, () =>
      version === "v1" ? uuidv1() : uuidv4()
    );

    return NextResponse.json({ success: true, data: { uuids } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to generate UUIDs" },
      { status: 500 }
    );
  }
}
