import { unstable_cache } from "next/cache";

// lib/sofascore.ts
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
const BASE_URL = "https://sofascore.p.rapidapi.com";

const HEADERS = {
  "x-rapidapi-key": RAPIDAPI_KEY,
  "x-rapidapi-host": "sofascore.p.rapidapi.com",
};

export const LEAGUE_CONFIG: Record<string, { tournamentId: number; seasonId: number }> = {
  PL: { tournamentId: 17, seasonId: 76986 },
  CL: { tournamentId: 7,  seasonId: 76953 },
  PD: { tournamentId: 8,  seasonId: 77559 },
};

async function sofaFetch<T>(endpoint: string, revalidate: number | false = 300): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: HEADERS,
    ...(revalidate === false
      ? { cache: "no-store" }
      : { next: { revalidate } }),
  });
  if (!res.ok) throw new Error(`Sofascore error: ${res.status}`);
  return res.json();
}

// ─── Match topish ─────────────────────────────────────────────
export async function findSofascoreMatchId(
  utcDate: string,
  homeTeamName: string,
  awayTeamName: string,
  leagueCode: string
): Promise<number | null> {
  try {
    const config = LEAGUE_CONFIG[leagueCode];
    if (!config) return null;

    const { tournamentId, seasonId } = config;
    const matchDate = utcDate.split("T")[0];

    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const sHome = normalize(homeTeamName);
    const sAway = normalize(awayTeamName);

    const isMatch = (e: any) => {
      const eDate = new Date(e.startTimestamp * 1000).toISOString().split("T")[0];
      if (eDate !== matchDate) return false;
      const home = normalize(e.homeTeam?.name || "");
      const away = normalize(e.awayTeam?.name || "");
      // To'liq yoki qisman moslik
      const homeOk = home.includes(sHome.slice(0, 5)) || sHome.includes(home.slice(0, 5));
      const awayOk = away.includes(sAway.slice(0, 5)) || sAway.includes(away.slice(0, 5));
      return homeOk && awayOk;
    };

    // 3 ta page tekshiramiz (har page ~10 match)
    for (let page = 0; page < 3; page++) {
      try {
        const data = await sofaFetch<any>(
          `/tournaments/get-last-matches?tournamentId=${tournamentId}&seasonId=${seasonId}&page=${page}`,
          false
        );
        const events: any[] = data?.events || [];
        if (!events.length) break;

        const found = events.find(isMatch);
        if (found) return found.id;
      } catch {
        break;
      }
    }

    return null;
  } catch {
    return null;
  }
}

// ─── Lineup ───────────────────────────────────────────────────
export async function getSofascoreLineups(matchId: number) {
  try {
    return await sofaFetch<any>(`/matches/get-lineups?matchId=${matchId}`, false);
  } catch {
    return null;
  }
}

// ─── Statistics ───────────────────────────────────────────────
export async function getSofascoreStatistics(matchId: number) {
  try {
    const data = await sofaFetch<any>(`/matches/get-statistics?matchId=${matchId}`, false);
    return data?.statistics || [];
  } catch {
    return [];
  }
}

// ─── Incidents ────────────────────────────────────────────────
export async function getSofascoreIncidents(matchId: number) {
  try {
    const data = await sofaFetch<any>(`/matches/get-incidents?matchId=${matchId}`, false);
    return data?.incidents || [];
  } catch {
    return [];
  }
}

// ─── Parallel fetch ───────────────────────────────────────────
export async function getSofascoreMatchData(matchId: number) {
  const [lineups, statistics, incidents] = await Promise.allSettled([
    getSofascoreLineups(matchId),
    getSofascoreStatistics(matchId),
    getSofascoreIncidents(matchId),
  ]);
  return {
    lineups: lineups.status === "fulfilled" ? lineups.value : null,
    statistics: statistics.status === "fulfilled" ? statistics.value : [],
    incidents: incidents.status === "fulfilled" ? incidents.value : [],
  };
}

// ─── Formation bo'yicha o'yinchilarni qatorlarga ajratish ─────
// "4-2-3-1" => GK(1) + [4, 2, 3, 1]
export function groupByFormation(players: any[], formation: string): any[][] {
  // Faqat asosiy o'yinchilar (substitute: false)
  const starters = players.filter((p) => !p.substitute);

  // Formation parse
  const rows = formation.split("-").map(Number); // [4,2,3,1]

  const result: any[][] = [];
  let idx = 0;

  // GK — har doim birinchi
  const gk = starters.find((p) => p.position === "G") || starters[0];
  result.push([gk]);
  idx = 1;

  // Qolganlarni GK dan keyin olamiz
  const outfield = starters.filter((p) => p.position !== "G");

  let oIdx = 0;
  for (const count of rows) {
    result.push(outfield.slice(oIdx, oIdx + count));
    oIdx += count;
  }

  return result;
}

// ─── Incident icon ────────────────────────────────────────────
export function getIncidentIcon(incident: any): string {
  const type = incident.incidentType;
  const cls = incident.incidentClass;

  if (type === "goal") {
    if (cls === "ownGoal") return "🔴";
    if (cls === "penalty") return "🎯";
    return "⚽";
  }
  if (type === "card") {
    if (cls === "yellow") return "🟨";
    if (cls === "red") return "🟥";
    if (cls === "yellowRed") return "🟧";
  }
  if (type === "substitution") return "🔄";
  if (type === "missedPenalty") return "❌";
  return "•";
}

// ─── Player API ───────────────────────────────────────────────

export async function getSofascorePlayer(playerId: number) {
  try {
    return await sofaFetch<any>(`/players/detail?playerId=${playerId}`);
  } catch { return null; }
}

export async function getSofascorePlayerImage(playerId: number): Promise<string> {
  return `https://api.sofascore.app/api/v1/player/${playerId}/image`;
}

export async function getSofascorePlayerStatistics(playerId: number, tournamentId: number, seasonId: number) {
  try {
    return await sofaFetch<any>(`/players/get-statistics?playerId=${playerId}&tournamentId=${tournamentId}&seasonId=${seasonId}`);
  } catch { return null; }
}

export async function getSofascorePlayerLastMatches(playerId: number, page = 0) {
  try {
    return await sofaFetch<any>(`/players/get-last-matches?playerId=${playerId}&page=${page}`);
  } catch { return null; }
}

export async function getSofascorePlayerTransfers(playerId: number) {
  try {
    return await sofaFetch<any>(`/players/get-transfer-history?playerId=${playerId}`);
  } catch { return null; }
}

export async function getSofascorePlayerCharacteristics(playerId: number) {
  try {
    return await sofaFetch<any>(`/players/get-characteristics?playerId=${playerId}`);
  } catch { return null; }
}

// ─── Team API ─────────────────────────────────────────────────

export const searchSofascoreTeam = unstable_cache(
  async (name: string): Promise<number | null> => {
    try {
      const data = await sofaFetch<any>(`/search?q=${encodeURIComponent(name)}`);
      const teams = (data?.results || []).filter((r: any) => r.type === "team");
      if (!teams.length) return null;
      const exact = teams.find((t: any) =>
        t.entity.name.toLowerCase() === name.toLowerCase() ||
        t.entity.shortName?.toLowerCase() === name.toLowerCase()
      );
      return exact?.entity?.id || teams[0]?.entity?.id || null;
    } catch { return null; }
  },
  ["sofa-team-search"],
  { revalidate: 86400 } // 24 soat — team ID lar o'zgarmaydi
);

export async function getSofascoreTeam(teamId: number) {
  try {
    return await sofaFetch<any>(`/teams/detail?teamId=${teamId}`);
  } catch { return null; }
}

export async function getSofascoreTeamSquad(teamId: number) {
  try {
    return await sofaFetch<any>(`/teams/get-squad?teamId=${teamId}`);
  } catch { return null; }
}

export async function getSofascoreTeamLastMatches(teamId: number, page = 0) {
  try {
    return await sofaFetch<any>(`/teams/get-last-matches?teamId=${teamId}&pageIndex=${page}`);
  } catch { return null; }
}

export async function getSofascoreTeamNextMatches(teamId: number) {
  try {
    return await sofaFetch<any>(`/teams/get-next-matches?teamId=${teamId}&pageIndex=0`);
  } catch { return null; }
}

export function getSofascoreTeamImage(teamId: number): string {
  return `/api/team-image?teamId=${teamId}`;
}