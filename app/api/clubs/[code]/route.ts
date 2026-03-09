import { NextRequest, NextResponse } from "next/server";
import { getTeams, LeagueCode } from "@/lib/football-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const upperCode = code.toUpperCase() as LeagueCode;
    const teams = await getTeams(upperCode);
    return NextResponse.json({ teams });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Clublar olishda xato" },
      { status: 500 }
    );
  }
}