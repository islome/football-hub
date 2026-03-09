import { NextRequest, NextResponse } from "next/server";
import { findSofascoreMatchId } from "@/lib/sofascore";

// GET /api/debug-match?matchId=552052
// 552052 = Benfica vs Real Madrid (football-data match ID)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("matchId");

  if (!matchId) {
    return NextResponse.json({ error: "matchId kerak" });
  }

  // football-data dan match info olamiz
  const fdRes = await fetch(`${process.env.FOOTBALL_API_BASE_URL}/matches/${matchId}`, {
    headers: { "X-Auth-Token": process.env.FOOTBALL_API_TOKEN || "" },
  });
  const fdData = await fdRes.json();

  const utcDate = fdData.utcDate;
  const homeTeam = fdData.homeTeam?.name;
  const awayTeam = fdData.awayTeam?.name;
  const leagueCode = fdData.competition?.code;

  // Sofascore dan match topamiz
  const sofaId = await findSofascoreMatchId(utcDate, homeTeam, awayTeam, leagueCode);

  return NextResponse.json({
    footballData: { utcDate, homeTeam, awayTeam, leagueCode },
    sofascoreMatchId: sofaId,
  });
}