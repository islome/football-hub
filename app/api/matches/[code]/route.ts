import { NextRequest, NextResponse } from "next/server";
import { getMatches, getUpcomingMatches, LeagueCode } from "@/lib/football-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code: rawCode } = await params;
    const code = rawCode.toUpperCase() as LeagueCode;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const upcoming = searchParams.get("upcoming");

    let matches;

    if (upcoming === "true") {
      matches = await getUpcomingMatches(code);
    } else if (status) {
      matches = await getMatches(code, status as any);
    } else {
      matches = await getMatches(code);
    }

    return NextResponse.json({ matches });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Matchlar olishda xato" },
      { status: 500 }
    );
  }
}