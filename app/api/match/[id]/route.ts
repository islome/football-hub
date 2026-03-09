import { NextRequest, NextResponse } from "next/server";
import { getMatch } from "@/lib/football-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const match = await getMatch(parseInt(id));
    return NextResponse.json(match);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Match ma'lumotini olishda xato" },
      { status: 500 }
    );
  }
}