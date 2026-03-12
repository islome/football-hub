// app/clubs/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getTeam, getTeamSquad, getTeamMatches } from "@/lib/football-api";
import { getTeamLogo, getTeamsByLeague } from "@/lib/football";

export const revalidate = 86400;

export async function generateStaticParams() {
  const popularIds = [57, 61, 64, 65, 66, 73, 86, 81, 78, 5, 109, 98];
  return popularIds.map((id) => ({ id: String(id) }));
}

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

// football-data.org position → G/D/M/F
function normalizePosition(pos: string): string {
  if (!pos) return "M";
  const p = pos.toUpperCase();
  if (p.includes("GOALKEEPER") || p === "G") return "G";
  if (p.includes("DEFENCE") || p.includes("DEFENDER") || p === "D") return "D";
  if (p.includes("MIDFIELD") || p === "M") return "M";
  if (
    p.includes("OFFENCE") ||
    p.includes("FORWARD") ||
    p.includes("ATTACK") ||
    p === "F"
  )
    return "F";
  return "M";
}

function calcAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;
  const diff = Date.now() - new Date(dateOfBirth).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default async function ClubDetailPage({ params }: Props) {
  const { id } = await params;
  const teamId = parseInt(id);
  if (isNaN(teamId)) notFound();

  // Asosiy team ma'lumotlari
  let team: any = null;
  try {
    team = await getTeam(teamId);
  } catch {
    notFound();
  }
  if (!team) notFound();

  // Squad + matches parallel
  const [squadRes, lastMatchesRes, nextMatchesRes, logoRes] =
    await Promise.allSettled([
      getTeamSquad(teamId),
      getTeamMatches(teamId, "FINISHED"),
      getTeamMatches(teamId, "SCHEDULED"),
      getTeamLogo(teamId),
    ]);

  const squad = squadRes.status === "fulfilled" ? squadRes.value || [] : [];
  const lastMatches =
    lastMatchesRes.status === "fulfilled" ? lastMatchesRes.value || [] : [];
  const nextMatches =
    nextMatchesRes.status === "fulfilled" ? nextMatchesRes.value || [] : [];
  const logoUrl = logoRes.status === "fulfilled" ? logoRes.value : null;

  // Crest — football-data crest yoki fotmob logo
  const teamCrest = team.crest || logoUrl;

  // Squad pozitsiya bo'yicha guruhlash
  const squadByPos: Record<string, any[]> = { G: [], D: [], M: [], F: [] };
  squad.forEach((p: any) => {
    const pos = normalizePosition(p.position || "");
    squadByPos[pos].push(p);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
        <Link href="/" className="hover:text-green-600 transition-colors">
          Bosh sahifa
        </Link>
        <span>/</span>
        <Link href="/clubs" className="hover:text-green-600 transition-colors">
          Klublar
        </Link>
        <span>/</span>
        <span className="text-gray-700">{team.shortName || team.name}</span>
      </div>

      {/* Header */}
      <div className="overflow-hidden">
        <div className="px-6 sm:px-8 py-6">
          <div className="flex items-center gap-4 mb-5 flex-wrap">
            {/* Crest */}
            <div className="w-24 h-24 flex items-center justify-center shrink-0">
              {teamCrest ? (
                <Image
                  src={teamCrest}
                  alt={team.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              ) : (
                <span className="text-2xl font-black text-gray-300">
                  {team.tla}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                {team.name}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap text-sm text-gray-500">
                {team.area?.name && <span>🌍 {team.area.name}</span>}
                {team.tla && (
                  <span className="font-mono bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">
                    {team.tla}
                  </span>
                )}
                {team.clubColors && (
                  <span className="text-xs text-gray-400">
                    🎨 {team.clubColors}
                  </span>
                )}
              </div>
            </div>

            {team.founded && (
              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-gray-900">
                  {team.founded}
                </div>
                <div className="text-xs text-gray-400">Tashkil etilgan</div>
              </div>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {team.venue && (
              <div className="bg-gray-100 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-1">🏟 Stadion</div>
                <div className="font-bold text-gray-800 text-sm">
                  {team.venue}
                </div>
              </div>
            )}
            {team.coach?.name && (
              <div className="bg-gray-100 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-1">👔 Murabbiy</div>
                <div className="font-bold text-gray-800 text-sm">
                  {team.coach.name}
                </div>
                {team.coach.nationality && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    {team.coach.nationality}
                  </div>
                )}
              </div>
            )}
            {squad.length > 0 && (
              <div className="bg-gray-100 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-1">👥 Tarkib</div>
                <div className="font-bold text-gray-800 text-sm">
                  {squad.length} o'yinchi
                </div>
              </div>
            )}
            {team.website && (
              <div className="bg-gray-100 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-1">🌐 Vebsayt</div>
                <a
                  href={team.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-green-600 text-sm hover:underline truncate block"
                >
                  {team.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Squad */}
      {squad.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">👥 Tarkib</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {POS_ORDER.map((pos) => {
              const players = squadByPos[pos];
              if (!players.length) return null;
              const colors = POS_COLORS[pos];
              return (
                <div key={pos}>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    {players.map((player: any, pi: number) => {
                      const age = calcAge(player.dateOfBirth);
                      const shirtNum = player.shirtNumber;

                      return (
                        <Link
                          key={player.id || pi}
                          href={`/players/${player.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-0"
                        >
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                              <span className="text-sm font-bold text-gray-400">
                                {player.name?.charAt(0) || "?"}
                              </span>
                            </div>
                            {shirtNum && (
                              <div
                                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-white flex items-center justify-center text-white font-black"
                                style={{
                                  backgroundColor: colors.bg,
                                  fontSize: "9px",
                                }}
                              >
                                {shirtNum}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 text-sm truncate group-hover:text-green-600 transition-colors">
                              {player.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {player.nationality && (
                                <span className="text-xs text-gray-400">
                                  {player.nationality}
                                </span>
                              )}
                              {age && (
                                <span className="text-xs text-gray-400">
                                  {age} yosh
                                </span>
                              )}
                            </div>
                          </div>

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

      {/* Keyingi matchlar */}
      {nextMatches.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">📅 Keyingi Matchlar</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {nextMatches.slice(0, 5).map((match: any, i: number) => {
              const isHome = match.homeTeam?.id === teamId;
              const oppTeam = isHome ? match.awayTeam : match.homeTeam;
              const date = match.utcDate
                ? new Date(match.utcDate).toLocaleDateString("uz-UZ", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <Link
                  key={match.id || i}
                  href={`/matches/${match.id}`}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  {oppTeam?.crest && (
                    <Image
                      src={oppTeam.crest}
                      alt={oppTeam.name}
                      width={28}
                      height={28}
                      className="object-contain shrink-0"
                    />
                  )}
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
                      {match.competition?.name}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-500 shrink-0">
                    {date}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* So'nggi matchlar */}
      {lastMatches.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">🏟 So'nggi Matchlar</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {lastMatches.slice(0, 8).map((match: any, i: number) => {
              const isHome = match.homeTeam?.id === teamId;
              const myScore = isHome
                ? match.score?.fullTime?.home
                : match.score?.fullTime?.away;
              const oppScore = isHome
                ? match.score?.fullTime?.away
                : match.score?.fullTime?.home;
              const oppTeam = isHome ? match.awayTeam : match.homeTeam;
              const won =
                myScore != null && oppScore != null && myScore > oppScore;
              const draw =
                myScore != null && oppScore != null && myScore === oppScore;
              const date = match.utcDate
                ? new Date(match.utcDate).toLocaleDateString("uz-UZ", {
                    day: "2-digit",
                    month: "short",
                  })
                : "";

              return (
                <Link
                  key={match.id || i}
                  href={`/matches/${match.id}`}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${
                      won ? "bg-green-500" : draw ? "bg-gray-400" : "bg-red-500"
                    }`}
                  >
                    {won ? "G" : draw ? "D" : "M"}
                  </div>

                  {oppTeam?.crest && (
                    <Image
                      src={oppTeam.crest}
                      alt={oppTeam.name}
                      width={28}
                      height={28}
                      className="object-contain shrink-0"
                    />
                  )}

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
                      {match.competition?.name} · {date}
                    </div>
                  </div>

                  <div className="text-sm font-black text-gray-800 tabular-nums shrink-0">
                    {myScore ?? "—"}–{oppScore ?? "—"}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
