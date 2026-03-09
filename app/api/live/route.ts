import { NextRequest, NextResponse } from "next/server";
import { getLiveMatches } from "@/lib/football-api";

export async function GET(request: NextRequest) {
  try {
    const matches = await getLiveMatches();
    return NextResponse.json(
      { matches },
      {
        headers: {
          // Live uchun cache yo'q
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Live matchlarni olishda xato" },
      { status: 500 }
    );
  }
}