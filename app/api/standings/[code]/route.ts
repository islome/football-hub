import { NextRequest, NextResponse } from "next/server";
import { getStandings, LeagueCode } from "@/lib/football-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const upperCode = code.toUpperCase() as LeagueCode;
    const data = await getStandings(upperCode);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Standings olishda xato" },
      { status: 500 }
    );
  }
}