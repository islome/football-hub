import { unstable_cache } from "next/cache";

const BASE_URL = process.env.FOOTBALL_API_BASE_URL || "https://api.football-data.org/v4";
const TOKEN = process.env.FOOTBALL_API_TOKEN || "";

export const LEAGUES = {
  PL: { name: "Premier League", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  CL: { name: "Champions League", country: "Europe", flag: "🇪🇺" },
  PD: { name: "La Liga", country: "Spain", flag: "🇪🇸" },
} as const;

export type LeagueCode = keyof typeof LEAGUES;

async function footballFetch<T>(
  endpoint: string,
  revalidate: number = 3600,
  extraHeaders: Record<string, string> = {},
  retries = 3
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "X-Auth-Token": TOKEN,
        ...extraHeaders,
      },
      next: { revalidate },
    });

    // 429 — rate limit, kutib qayta urinamiz
    if (res.status === 429) {
      if (attempt < retries - 1) {
        const waitMs = (attempt + 1) * 12000; // 12s, 24s, 36s
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      throw new Error(`Football API error: 429 - Too Many Requests`);
    }

    if (!res.ok) {
      throw new Error(`Football API error: ${res.status} - ${res.statusText}`);
    }

    return res.json();
  }
  throw new Error("Football API: max retries exceeded");
}

// ─── Types ───────────────────────────────────────────────────
export interface Player {
  id: number;
  name: string;
  position: string;
  dateOfBirth: string;
  nationality: string;
  shirtNumber?: number;
  currentTeam?: Team;
  section?: string;
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address?: string;
  website?: string;
  founded?: number;
  clubColors?: string;
  venue?: string;
  coach?: { id: number; name: string; nationality: string; dateOfBirth?: string };
  squad?: Player[];
}

export interface Standing {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string;
}

export interface Match {
  id: number;
  utcDate: string;
  status: "SCHEDULED" | "LIVE" | "IN_PLAY" | "PAUSED" | "FINISHED" | "TIMED";
  matchday?: number;
  stage?: string;
  group?: string;
  homeTeam: Team;
  awayTeam: Team;
  score: {
    winner?: string | null;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  competition: { id: number; name: string; code: string; emblem: string };
  referees?: { name: string; nationality: string }[];
}

// ─── API funksiyalari ────────────────────────────────────────

export async function getStandings(leagueCode: LeagueCode) {
  const data = await footballFetch<{
    competition: { name: string; emblem: string };
    standings: { type: string; table: Standing[] }[];
  }>(`/competitions/${leagueCode}/standings`, 3600);

  const total = data.standings.find((s) => s.type === "TOTAL");
  return {
    competition: data.competition,
    table: total?.table || [],
  };
}

export async function getMatches(
  leagueCode: LeagueCode,
  status?: "SCHEDULED" | "LIVE" | "FINISHED" | "TIMED"
) {
  const query = status ? `?status=${status}` : "";
  const data = await footballFetch<{ matches: Match[] }>(
    `/competitions/${leagueCode}/matches${query}`,
    1800
  );
  return data.matches;
}

export async function getUpcomingMatches(leagueCode: LeagueCode) {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  const dateFrom = today.toISOString().split("T")[0];
  const dateTo = nextWeek.toISOString().split("T")[0];

  const data = await footballFetch<{ matches: Match[] }>(
    `/competitions/${leagueCode}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
    1800
  );
  return data.matches;
}

export async function getLiveMatches() {
  const data = await footballFetch<{ matches: Match[] }>(`/matches?status=IN_PLAY`, 60);
  return data.matches;
}

export const getTeams = unstable_cache(
  async (leagueCode: LeagueCode) => {
    const data = await footballFetch<{ teams: Team[] }>(
      `/competitions/${leagueCode}/teams`,
      86400
    );
    return data.teams;
  },
  ["teams"],
  { revalidate: 86400 } // 24 soat
);

export const getTeam = unstable_cache(
  async (teamId: number) => {
    return footballFetch<Team>(`/teams/${teamId}`, 86400);
  },
  ["team"],
  { revalidate: 86400 }
);

// Squad alohida — /teams/{id} + ?squad=true emas, balki to'g'ridan squad field keladi
// Lekin free tier da squad bo'sh kelishi mumkin, shuning uchun competitions orqali olamiz
export async function getTeamSquad(teamId: number): Promise<Player[]> {
  try {
    const data = await footballFetch<{ squad: Player[] }>(`/teams/${teamId}`, 21600);
    return data.squad || [];
  } catch {
    return [];
  }
}

export async function getTeamMatches(teamId: number, status?: "SCHEDULED" | "FINISHED") {
  const query = status ? `?status=${status}&limit=10` : "?limit=10";
  const data = await footballFetch<{ matches: Match[] }>(
    `/teams/${teamId}/matches${query}`,
    1800
  );
  return data.matches;
}

// Bitta match detail — lineup, bench, statistics uchun unfolding headers kerak
export async function getMatch(matchId: number) {
  return footballFetch<Match>(`/matches/${matchId}`, 60, {
    "X-Unfold-Goals": "true",
    "X-Unfold-Bookings": "true",
    "X-Unfold-Lineups": "true",
    "X-Unfold-Statistics": "true",
  });
}

export async function getPlayer(playerId: number) {
  return footballFetch<Player & { currentTeam?: Team }>(
    `/persons/${playerId}`,
    43200
  );
}

// O'yinchi matchlari
export async function getPlayerMatches(playerId: number) {
  try {
    const data = await footballFetch<{ matches: Match[] }>(
      `/persons/${playerId}/matches?limit=10&status=FINISHED`,
      3600
    );
    return data.matches || [];
  } catch {
    return [];
  }
}