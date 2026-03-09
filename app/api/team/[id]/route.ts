import { NextRequest, NextResponse } from "next/server";
import { getTeam, getTeamMatches } from "@/lib/football-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    const { searchParams } = new URL(request.url);
    const matchStatus = searchParams.get("matches");

    if (matchStatus) {
      const matches = await getTeamMatches(id, matchStatus as any);
      return NextResponse.json({ matches });
    }

    const team = await getTeam(id);
    return NextResponse.json(team);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Team ma'lumotini olishda xato" },
      { status: 500 }
    );
  }
}