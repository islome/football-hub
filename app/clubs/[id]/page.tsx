import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getTeam } from "@/lib/football-api";
import {
  searchSofascoreTeam,
  getSofascoreTeamSquad,
  getSofascoreTeamLastMatches,
  getSofascoreTeamNextMatches,
  getSofascoreTeamImage,
} from "@/lib/sofascore";

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  try {
    const { id } = await params;
    const team = await getTeam(parseInt(id));
    return { title: `${team.name} — FootballHub` };
  } catch {
    return { title: "Klub — FootballHub" };
  }
}

const POS_ORDER = ["G", "D", "M", "F"];
const POS_FULL: Record<string, string> = {
  G: "Darvozabon",
  D: "Himoyachi",
  M: "Yarim himoyachi",
  F: "Hujumchi",
};
const POS_COLORS: Record<string, { bg: string; text: string; light: string }> =
  {
    G: { bg: "#f59e0b", text: "#ffffff", light: "#fef3c7" },
    D: { bg: "#3b82f6", text: "#ffffff", light: "#dbeafe" },
    M: { bg: "#10b981", text: "#ffffff", light: "#d1fae5" },
    F: { bg: "#ef4444", text: "#ffffff", light: "#fee2e2" },
  };

export default async function ClubDetailPage({ params }: Props) {
  const { id } = await params;
  const teamId = parseInt(id);
  if (isNaN(teamId)) notFound();

  // football-data.org dan asosiy info
  let fdTeam: any = null;
  try {
    fdTeam = await getTeam(teamId);
  } catch {
    notFound();
  }
  if (!fdTeam) notFound();

  // Sofascore ID topish
  let sofaTeamId: number | null = null;
  try {
    sofaTeamId = await searchSofascoreTeam(fdTeam.name);
  } catch {}

  // Sofascore dan squad + matches parallel
  let squad: any[] = [];
  let lastMatches: any[] = [];
  let nextMatches: any[] = [];

  if (sofaTeamId) {
    const [squadRes, lastRes, nextRes] = await Promise.allSettled([
      getSofascoreTeamSquad(sofaTeamId),
      getSofascoreTeamLastMatches(sofaTeamId),
      getSofascoreTeamNextMatches(sofaTeamId),
    ]);
    squad =
      squadRes.status === "fulfilled" ? squadRes.value?.players || [] : [];
    lastMatches =
      lastRes.status === "fulfilled" ? lastRes.value?.events || [] : [];
    nextMatches =
      nextRes.status === "fulfilled" ? nextRes.value?.events || [] : [];
  }

  // Squad pozitsiya bo'yicha guruhlash
  const squadByPos: Record<string, any[]> = { G: [], D: [], M: [], F: [] };
  squad.forEach((p: any) => {
    const pos = p.player?.position || p.position || "M";
    if (squadByPos[pos]) squadByPos[pos].push(p);
    else squadByPos["M"].push(p);
  });

  const sofaImageUrl = sofaTeamId ? getSofascoreTeamImage(sofaTeamId) : null;
  const teamCrest = fdTeam.crest || sofaImageUrl;

  const primaryColor = "#16a34a";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
        <Link href="/" className="hover:text-green-600 transition-colors">
          Bosh sahifa
        </Link>
        <span>/</span>
        <Link href="/clubs" className="hover:text-green-600 transition-colors">
          Klublar
        </Link>
        <span>/</span>
        <span className="text-gray-700">{fdTeam.shortName || fdTeam.name}</span>
      </div>

      <div className="bg-white  overflow-hidden">
        <div className="px-6 sm:px-8 pb-6 mt-8 mb-4">
          <div className="flex items-end gap-5 -mt-12 mb-5 flex-wrap">
            {/* Crest */}
            <div className="w-24 h-24 flex items-center justify-center shrink-0 overflow-hidden">
              {teamCrest ? (
                <Image
                  src={teamCrest}
                  alt={fdTeam.name}
                  width={80}
                  height={80}
                  className="object-contain p-1"
                />
              ) : (
                <span className="text-2xl font-black text-gray-300">
                  {fdTeam.tla}
                </span>
              )}
            </div>

            <div className="flex-1 pb-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                {fdTeam.name}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap text-sm text-gray-500">
                {fdTeam.area?.name && <span>🌍 {fdTeam.area.name}</span>}
                {fdTeam.tla && (
                  <span className="font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                    {fdTeam.tla}
                  </span>
                )}
              </div>
            </div>

            {/* Founded */}
            {fdTeam.founded && (
              <div className="pb-1 text-right">
                <div className="text-2xl font-black text-gray-900">
                  {fdTeam.founded}y
                </div>
                <div className="text-xs text-gray-400">Tashkil etilgan</div>
              </div>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {fdTeam.venue && (
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-1">🏟 Stadion</div>
                <div className="font-bold text-gray-800 text-sm">
                  {fdTeam.venue}
                </div>
              </div>
            )}
            {fdTeam.coach?.name && (
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-1">👔 Murabbiy</div>
                <div className="font-bold text-gray-800 text-sm">
                  {fdTeam.coach.name}
                </div>
              </div>
            )}
            {squad.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-1">👥 Tarkib</div>
                <div className="font-bold text-gray-800 text-sm">
                  {squad.length} o'yinchi
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {squad.length > 0 && (
        <div className="bg-white  overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900">👥 Tarkib</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {POS_ORDER.map((pos) => {
              const players = squadByPos[pos];
              if (!players.length) return null;
              const colors = POS_COLORS[pos];
              return (
                <div key={pos}>
                  {/* Position header */}
                  <div
                    className="px-4 py-2 flex items-center gap-2"
                    style={{ backgroundColor: colors.light }}
                  >
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {pos}
                    </span>
                    <span className="text-xs font-semibold text-gray-600">
                      {POS_FULL[pos]}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {players.length} nafar
                    </span>
                  </div>

                  {/* Players */}
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    {players.map((p: any, pi: number) => {
                      const player = p.player || p;
                      const playerId = player.id;
                      const age = player.dateOfBirthTimestamp
                        ? Math.floor(
                            (Date.now() / 1000 - player.dateOfBirthTimestamp) /
                              (365.25 * 24 * 3600),
                          )
                        : null;
                      const country = player.country?.name || "";
                      const num = p.jerseyNumber ?? player.jerseyNumber ?? "";

                      return (
                        <Link
                          key={`${pos}-${playerId || pi}`}
                          href={`/players/${playerId}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-0"
                        >
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <img
                              src={"https://img.freepik.com/premium-vector/soccer-player-black-simple-icon-isolated-white-background_98402-68338.jpg" }
                              alt={player.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200"
                              onError={undefined}
                            />
                            {num !== "" && (
                              <div
                                className="absolute -right-1 w-5 h-5 rounded-full border border-white flex items-center justify-center text-white text-xs font-black"
                                style={{
                                  backgroundColor: colors.bg,
                                  fontSize: "9px",
                                }}
                              >
                                {num}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 text-sm truncate group-hover:text-green-600 transition-colors">
                              {player.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {country && (
                                <span className="text-xs text-gray-400">
                                  {country}
                                </span>
                              )}
                              {age && (
                                <span className="text-xs text-gray-400">
                                  {age} yosh
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Market value */}
                          {player.proposedMarketValueRaw?.value && (
                            <div className="text-xs font-bold text-gray-500 shrink-0">
                              €
                              {(
                                player.proposedMarketValueRaw.value / 1_000_000
                              ).toFixed(2)}
                              M
                            </div>
                          )}

                          <svg
                            className="w-4 h-4 text-gray-300 group-hover:text-green-500 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Next Matches ── */}
      {nextMatches.length > 0 && (
        <div className="bg-white rounded-2xl mb-4 border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">📅 Keyingi Matchlar</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {nextMatches.slice(0, 5).map((event: any, i: number) => {
              const isHome = event.homeTeam?.id === sofaTeamId;
              const oppTeam = isHome ? event.awayTeam : event.homeTeam;
              const date = event.startTimestamp
                ? new Date(event.startTimestamp * 1000).toLocaleDateString(
                    "uz-UZ",
                    {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )
                : "";
              return (
                <div
                  key={`next-${event.id || i}`}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xs text-gray-400">
                        {isHome ? "Uy" : "Mehmonda"}
                      </span>
                      <span className="font-semibold text-gray-800 truncate">
                        vs {oppTeam?.shortName || oppTeam?.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {event.tournament?.name}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-500 shrink-0">
                    {date}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {lastMatches.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">🏟 So'nggi Matchlar</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {lastMatches.slice(0, 8).map((event: any, i: number) => {
              const isHome = event.homeTeam?.id === sofaTeamId;
              const myScore = isHome
                ? event.homeScore?.current
                : event.awayScore?.current;
              const oppScore = isHome
                ? event.awayScore?.current
                : event.homeScore?.current;
              const oppTeam = isHome ? event.awayTeam : event.homeTeam;
              const won =
                myScore != null && oppScore != null && myScore > oppScore;
              const draw =
                myScore != null && oppScore != null && myScore === oppScore;
              const date = event.startTimestamp
                ? new Date(event.startTimestamp * 1000).toLocaleDateString(
                    "uz-UZ",
                    {
                      day: "2-digit",
                      month: "short",
                    },
                  )
                : "";

              return (
                <div
                  key={`last-${event.id || i}`}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  {/* Result */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${
                      won ? "bg-green-500" : draw ? "bg-gray-400" : "bg-red-500"
                    }`}
                  >
                    {won ? "G" : draw ? "D" : "M"}
                  </div>

                  {/* Teams & tournament */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-xs text-gray-400">
                        {isHome ? "Uy" : "Mehmon"}
                      </span>
                      <span className="font-semibold text-gray-800 truncate">
                        vs {oppTeam?.shortName || oppTeam?.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {event.tournament?.name} · {date}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-sm font-black text-gray-800 tabular-nums shrink-0">
                    {myScore ?? "—"}–{oppScore ?? "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
