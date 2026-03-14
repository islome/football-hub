// lib/football.ts

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
const BASE_URL = "https://free-api-live-football-data.p.rapidapi.com";

const HEADERS = {
  "x-rapidapi-key": RAPIDAPI_KEY,
  "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
};

async function apiFetch<T>(
  path: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  if (!RAPIDAPI_KEY) throw new Error("RAPIDAPI_KEY o'rnatilmagan!");

  const url = new URL(`${BASE_URL}/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await fetch(url.toString(), {
    headers: HEADERS,
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[Football API] ${res.status} - ${path}:`, body);
    throw new Error(`Football API error: ${res.status}`);
  }

  return res.json();
}

// ════════════════════════════════════════════════════════════════
// 🔍 SEARCH & FIXTURES
// ════════════════════════════════════════════════════════════════

export async function searchPlayers(name: string) {
  try {
    const data = await apiFetch<any>("football-players-search", { search: name });
    return data?.response || [];
  } catch { return []; }
}

export async function getFixturesByDate(date: string) {
  try {
    // date format: "20241107"
    const data = await apiFetch<any>("football-get-matches-by-date-and-league", { date });
    return data?.response || [];
  } catch { return []; }
}

export async function findEventId(
  utcDate: string,  // "2024-11-07T20:00:00Z"
  homeTeam: string,
  awayTeam: string
): Promise<string | null> {
  try {
    const date = utcDate.split("T")[0].replace(/-/g, ""); // → "20241107"
    const fixtures = await getFixturesByDate(date);

    const found = fixtures.find((f: any) => {
      const home = (f.homeTeam?.name || f.home?.name || "").toLowerCase();
      const away = (f.awayTeam?.name || f.away?.name || "").toLowerCase();
      const sHome = homeTeam.toLowerCase();
      const sAway = awayTeam.toLowerCase();

      return (
        (home.includes(sHome.split(" ")[0]) || sHome.includes(home.split(" ")[0])) &&
        (away.includes(sAway.split(" ")[0]) || sAway.includes(away.split(" ")[0]))
      );
    });

    return found?.id || found?.eventId || null;
  } catch { return null; }
}

// ════════════════════════════════════════════════════════════════
// 🏟️ MATCH — Individual endpoints
// ════════════════════════════════════════════════════════════════

/** Match umumiy ma'lumotlari (jamoalar, vaqt, holat) */
export async function getMatchDetail(eventId: string) {
  try {
    const data = await apiFetch<any>("football-get-match-detail", { eventid: eventId });
    return data?.response || null;
  } catch { return null; }
}

export async function getMatchScore(eventId: string) {
  try {
    const data = await apiFetch<any>("football-get-match-score", { eventid: eventId });
    return data?.response || null;
  } catch { return null; }
}

export async function getMatchAllStats(eventId: string) {
  try {
    const data = await apiFetch<any>("football-get-match-all-stats", { eventid: eventId });
    return data?.response?.stats || [];
  } catch { return []; }
}

export async function getMatchFirstHalfStats(eventId: string) {
  try {
    const data = await apiFetch<any>("football-get-match-firstHalf-stats", { eventid: eventId });
    return data?.response?.stats || [];
  } catch { return []; }
}

export async function getMatchSecondHalfStats(eventId: string) {
  try {
    const data = await apiFetch<any>("football-get-match-secondhalf-stats", { eventid: eventId });
    return data?.response?.stats || [];
  } catch { return []; }
}

export async function getMatchHighlights(eventId: string) {
  try {
    const data = await apiFetch<any>("football-get-match-highlights", { eventid: eventId });
    return data?.response || null;
  } catch { return null; }
}

export async function getMatchLocation(eventId: string) {
  try {
    const data = await apiFetch<any>("football-get-match-location", { eventid: eventId });
    return data?.response || null;
  } catch { return null; }
}

export async function getMatchReferee(eventId: string) {
  try {
    const data = await apiFetch<any>("football-get-match-referee", { eventid: eventId });
    return data?.response || null;
  } catch { return null; }
}

export async function getMatchOdds(eventId: string) {
  try {
    const data = await apiFetch<any>("football-event-odds", { eventid: eventId });
    return data?.response || null;
  } catch { return null; }
}

export async function getMatchLineups(eventId: string) {
  try {
    const [home, away] = await Promise.all([
      apiFetch<any>("football-get-hometeam-lineup", { eventid: eventId }),
      apiFetch<any>("football-get-awayteam-lineup", { eventid: eventId }),
    ]);
    return {
      home: home?.response || null,
      away: away?.response || null,
    };
  } catch { return { home: null, away: null }; }
}

export async function getFullMatchData(eventId: string) {
  const [detail, score, statsAll, statsFirst, statsSecond, highlights, location, referee, odds, lineups] =
    await Promise.allSettled([
      getMatchDetail(eventId),
      getMatchScore(eventId),
      getMatchAllStats(eventId),
      getMatchFirstHalfStats(eventId),
      getMatchSecondHalfStats(eventId),
      getMatchHighlights(eventId),
      getMatchLocation(eventId),
      getMatchReferee(eventId),
      getMatchOdds(eventId),
      getMatchLineups(eventId),
    ]);

  return {
    detail:      detail.status      === "fulfilled" ? detail.value      : null,
    score:       score.status       === "fulfilled" ? score.value       : null,
    statsAll:    statsAll.status    === "fulfilled" ? statsAll.value    : [],
    statsFirst:  statsFirst.status  === "fulfilled" ? statsFirst.value  : [],
    statsSecond: statsSecond.status === "fulfilled" ? statsSecond.value : [],
    highlights:  highlights.status  === "fulfilled" ? highlights.value  : null,
    location:    location.status    === "fulfilled" ? location.value    : null,
    referee:     referee.status     === "fulfilled" ? referee.value     : null,
    odds:        odds.status        === "fulfilled" ? odds.value        : null,
    lineups:     lineups.status     === "fulfilled" ? lineups.value     : { home: null, away: null },
  };
}

// ─── Lineups ──────────────────────────────────────────────────
export async function getLineups(eventId: string) {
  try {
    const [home, away] = await Promise.all([
      apiFetch<any>("football-get-hometeam-lineup", { eventid: eventId }),
      apiFetch<any>("football-get-awayteam-lineup", { eventid: eventId }),
    ]);
    return {
      home: home?.response || null,
      away: away?.response || null,
    };
  } catch { return { home: null, away: null }; }
}


// ════════════════════════════════════════════════════════════════
// 🎯 STAT HELPERS
// ════════════════════════════════════════════════════════════════

const TOP_KEYS = [
  "BallPossesion", "expected_goals", "total_shots",
  "ShotsOnTarget", "big_chance", "accurate_passes",
  "fouls", "corners",
];



// ════════════════════════════════════════════════════════════════
// 👥 TEAM endpoints — lib/football.ts ga qo'shing
// ════════════════════════════════════════════════════════════════

/** Barcha jamoalar ro'yxati */
export async function getAllTeams() {
  try {
    const data = await apiFetch<any>("football-get-list-all-team");
    return data?.response || [];
  } catch { return []; }
}

/** Home jamoalar ro'yxati */
export async function getHomeTeams() {
  try {
    const data = await apiFetch<any>("football-get-list-home-team");
    return data?.response || [];
  } catch { return []; }
}

/** Away jamoalar ro'yxati */
export async function getAwayTeams() {
  try {
    const data = await apiFetch<any>("football-get-list-away-team");
    return data?.response || [];
  } catch { return []; }
}

/** Liga bo'yicha jamoalar (leagueid kerak bo'lishi mumkin) */
export async function getTeamsByLeague(leagueId: string | number) {
  try {
    const data = await apiFetch<any>("football-league-team", { leagueid: leagueId });
    return data?.response || [];
  } catch { return []; }
}

/** Jamoa logosi URL — async, JSON dan oladi */
export async function getTeamLogo(teamId: string | number): Promise<string | null> {
  try {
    const data = await apiFetch<any>("football-team-logo", { teamid: teamId });
    return data?.response?.url || null;
  } catch { return null; }
}

/** Jamoa qidirish (nom bo'yicha, local filter) */
export async function findTeamByName(name: string) {
  const teams = await getAllTeams();
  const q = name.toLowerCase();
  return teams.find((t: any) => {
    const tName = (t.name || t.teamName || "").toLowerCase();
    return tName.includes(q) || q.includes(tName.split(" ")[0]);
  }) || null;
}

/** Jamoa ID topish */
export async function findTeamId(name: string): Promise<string | null> {
  const team = await findTeamByName(name);
  return team?.id || team?.teamId || null;
}

// ════════════════════════════════════════════════════════════════
// 🧑 PLAYER
// ════════════════════════════════════════════════════════════════

export async function getPlayerDetail(playerId: string | number) {
  try {
    const data = await apiFetch<any>("football-get-player-detail", { playerid: playerId });
    const details: any[] = data?.response?.detail || [];

    // translationKey bo'yicha qidirish
    const get = (key: string) => details.find((d: any) => d.translationKey === key);

    const heightItem    = get("height_sentencecase");
    const shirtItem     = get("shirt");
    const ageItem       = get("age_sentencecase");
    const footItem      = get("preferred_foot");
    const countryItem   = get("country_sentencecase");
    const valueItem     = get("transfer_value");
    const contractItem  = get("contract_end");

    return {
      height:        heightItem?.value?.fallback || null,           // "179 cm"
      shirt:         shirtItem?.value?.numberValue || null,         // 12
      age:           ageItem?.value?.numberValue || null,           // 29
      preferredFoot: footItem?.value?.fallback || null,             // "Left"
      country:       countryItem?.value?.fallback || null,          // "Greece"
      countryCode:   countryItem?.countryCode || null,              // "GRE"
      marketValue:   valueItem?.value?.fallback || null,            // "€15.2M"
      marketValueRaw: valueItem?.value?.numberValue || null,        // 15163360
      // ✅ FIX: fallback object, string emas!
      contractEnd:   contractItem?.value?.fallback?.utcTime || null, // "2027-06-30T00:00:00.000Z"
    };
  } catch (err) {
    console.error("[getPlayerDetail] Xato:", err);
    return null;
  }
}

export async function getPlayerLogo(playerId: string | number): Promise<string | null> {
  try {
    console.log("[getPlayerLogo] playerid:", playerId);
    const data = await apiFetch<any>("football-get-player-logo", { playerid: playerId });
    console.log("[getPlayerLogo] response:", data);
    return data?.response?.url || null;
  } catch (err) {
    console.error("[getPlayerLogo] Xato:", err);
    return null;
  }
}

export function normalizePosition(pos: string): string {
  if (!pos) return "M";
  const p = pos.toUpperCase();
  if (p.includes("GOALKEEPER")) return "G";
  if (p.includes("DEFENCE") || p.includes("DEFENDER")) return "D";
  if (p.includes("MIDFIELD")) return "M";
  if (p.includes("OFFENCE") || p.includes("FORWARD") || p.includes("ATTACK")) return "F";
  return "M";
}

export function getPlayerAvatar(name: string, position: string): string {
  const colors: Record<string, string> = {
    G: "f59e0b", D: "3b82f6", M: "10b981", F: "ef4444",
  };
  const pos = normalizePosition(position);
  const bg = colors[pos] || "6b7280";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=96&background=${bg}&color=fff&bold=true&format=png`;
}