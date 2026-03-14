import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatch } from "@/lib/football-api";
import { getFullMatchData, findEventId } from "@/lib/football";
import { formatMatchDate, getStatusColor, getStatusLabel } from "@/lib/utils";

export const revalidate = 120;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  try {
    const { id } = await params;
    const match = await getMatch(parseInt(id));
    return {
      title: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName} — FootballHub`,
    };
  } catch {
    return { title: "Match — FootballHub" };
  }
}

const POS_COLORS: Record<string, { bg: string; border: string }> = {
  G: { bg: "#f59e0b", border: "#d97706" },
  D: { bg: "#3b82f6", border: "#2563eb" },
  M: { bg: "#10b981", border: "#059669" },
  F: { bg: "#ef4444", border: "#dc2626" },
};
const POS_LABELS: Record<string, string> = {
  G: "GK",
  D: "DEF",
  M: "MID",
  F: "FWD",
};

function normalizePos(pos: string): string {
  if (!pos) return "M";
  const p = pos.toUpperCase();
  if (p === "G" || p.includes("GOAL")) return "G";
  if (p === "D" || p.includes("DEF")) return "D";
  if (p === "M" || p.includes("MID")) return "M";
  if (p === "F" || p.includes("FOR") || p.includes("ATT")) return "F";
  return "M";
}

// Stats flatten helper
function flattenStats(
  groups: any[],
): { title: string; key: string; home: any; away: any; highlighted: string }[] {
  return groups
    .flatMap((g: any) => g.stats || [])
    .filter((s: any) => s.type !== "title" && s.stats?.[0] != null)
    .map((s: any) => ({
      title: s.title,
      key: s.key,
      home: s.stats[0],
      away: s.stats[1],
      highlighted: s.highlighted || "equal",
    }));
}

// Stat bar component
function StatRow({
  title,
  home,
  away,
  highlighted,
}: {
  title: string;
  home: any;
  away: any;
  highlighted: string;
}) {
  const hNum = parseFloat(String(home)) || 0;
  const aNum = parseFloat(String(away)) || 0;
  const total = hNum + aNum || 1;
  const hPct = Math.round((hNum / total) * 100);
  const aPct = 100 - hPct;

  return (
    <div>
      <div className="flex justify-between items-center text-sm mb-1.5">
        <span
          className={`font-bold w-16 ${highlighted === "home" ? "text-blue-600" : "text-gray-800"}`}
        >
          {home}
        </span>
        <span className="text-xs text-gray-500 text-center flex-1">
          {title}
        </span>
        <span
          className={`font-bold w-16 text-right ${highlighted === "away" ? "text-red-500" : "text-gray-800"}`}
        >
          {away}
        </span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100">
        <div
          className="bg-blue-500 transition-all"
          style={{ width: `${hPct}%` }}
        />
        <div
          className="bg-red-400 transition-all"
          style={{ width: `${aPct}%` }}
        />
      </div>
    </div>
  );
}

// Empty state
function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="py-8 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-gray-400">{text}</div>
    </div>
  );
}

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params;
  const matchId = parseInt(id);
  if (isNaN(matchId)) notFound();

  let match: any = null;
  try {
    match = await getMatch(matchId);
  } catch {
    notFound();
  }
  if (!match) notFound();

  const isLive = match.status === "IN_PLAY" || match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const hasStarted = isLive || isFinished;

  // Yangi API dan event ID topish
  let fotmobData: Awaited<ReturnType<typeof getFullMatchData>> | null = null;
  if (hasStarted) {
    try {
      const eventId = await findEventId(
        match.utcDate,
        match.homeTeam.name,
        match.awayTeam.name,
      );
      if (eventId) {
        fotmobData = await getFullMatchData(eventId);
      }
    } catch {}
  }

  const score = fotmobData?.score;
  const statsAll = flattenStats(fotmobData?.statsAll || []);
  const statsFirst = flattenStats(fotmobData?.statsFirst || []);
  const statsSecond = flattenStats(fotmobData?.statsSecond || []);
  const highlights = fotmobData?.highlights;
  const location = fotmobData?.location;
  const referee = fotmobData?.referee;
  const odds = fotmobData?.odds;
  const lineups = fotmobData?.lineups;

  const homePlayers: any[] = lineups?.home?.players || [];
  const awayPlayers: any[] = lineups?.away?.players || [];
  const homeFormation: string = lineups?.home?.formation || "";
  const awayFormation: string = lineups?.away?.formation || "";
  const homeStarters = homePlayers.filter((p) => !p.substitute);
  const awayStarters = awayPlayers.filter((p) => !p.substitute);
  const homeBench = homePlayers.filter((p) => p.substitute);
  const awayBench = awayPlayers.filter((p) => p.substitute);

  // Score display
  const homeScore = score?.homeScore ?? match.score?.fullTime?.home;
  const awayScore = score?.awayScore ?? match.score?.fullTime?.away;
  const homeHalf = score?.homeScoreHalfTime ?? match.score?.halfTime?.home;
  const awayHalf = score?.awayScoreHalfTime ?? match.score?.halfTime?.away;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
        <Link href="/" className="hover:text-green-600 transition-colors">
          Bosh sahifa
        </Link>
        <span>/</span>
        <Link
          href={`/leagues/${match.competition.code}`}
          className="hover:text-green-600 transition-colors"
        >
          {match.competition.name}
        </Link>
        <span>/</span>
        <span className="text-gray-700">
          {match.homeTeam.shortName} vs {match.awayTeam.shortName}
        </span>
      </div>

      <div
        className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isLive ? "border-red-200" : "border-gray-100"}`}
      >
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {match.competition.emblem && (
              <Image
                src={match.competition.emblem}
                alt={match.competition.name}
                width={24}
                height={24}
                className="object-contain"
              />
            )}
            <div>
              <div className="font-semibold text-gray-800 text-sm">
                {match.competition.name}
              </div>
              {match.matchday && (
                <div className="text-xs text-gray-400">
                  {match.matchday}-hafta
                </div>
              )}
            </div>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(match.status)}`}
          >
            {isLive && (
              <span className="inline-block w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse" />
            )}
            {getStatusLabel(match.status)}
          </span>
        </div>

        <div className="px-6 py-8">
          <div className="flex items-center justify-between gap-4">
            {/* Home */}
            <Link
              href={`/clubs/${match.homeTeam.id}`}
              className="flex flex-col items-center gap-3 flex-1 group"
            >
              {match.homeTeam.crest ? (
                <Image
                  src={match.homeTeam.crest}
                  alt={match.homeTeam.name}
                  width={72}
                  height={72}
                  className="object-contain group-hover:scale-110 transition-transform"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-xl font-black text-gray-400">
                  {match.homeTeam.tla}
                </div>
              )}
              <div className="text-center">
                <div className="font-black text-gray-900 group-hover:text-green-600 transition-colors">
                  {match.homeTeam.shortName}
                </div>
                {homeFormation && (
                  <div className="text-xs text-gray-400 font-mono mt-0.5">
                    {homeFormation}
                  </div>
                )}
              </div>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                Uy egasi
              </span>
            </Link>

            {/* Score */}
            <div className="flex flex-col items-center shrink-0">
              {hasStarted ? (
                <>
                  <div className="text-5xl sm:text-6xl font-black text-gray-900 tabular-nums">
                    {homeScore ?? 0}
                    <span className="text-gray-300 mx-2">~</span>
                    {awayScore ?? 0}
                  </div>
                  {homeHalf != null && (
                    <div className="text-xs text-gray-400 mt-1">
                      YV: {homeHalf}~{awayHalf}
                    </div>
                  )}
                  {isFinished && match.score.winner && (
                    <div className="mt-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      {match.score.winner === "HOME_TEAM"
                        ? `🏆 ${match.homeTeam.shortName} g'alaba`
                        : match.score.winner === "AWAY_TEAM"
                          ? `🏆 ${match.awayTeam.shortName} g'alaba`
                          : "🤝 Durrang"}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <div className="text-4xl font-black text-gray-300">VS</div>
                  <div className="text-lg font-bold text-gray-600 mt-1">
                    {new Date(match.utcDate).toLocaleTimeString("uz-UZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Away */}
            <Link
              href={`/clubs/${match.awayTeam.id}`}
              className="flex flex-col items-center gap-3 flex-1 group"
            >
              {match.awayTeam.crest ? (
                <Image
                  src={match.awayTeam.crest}
                  alt={match.awayTeam.name}
                  width={72}
                  height={72}
                  className="object-contain group-hover:scale-110 transition-transform"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-xl font-black text-gray-400">
                  {match.awayTeam.tla}
                </div>
              )}
              <div className="text-center">
                <div className="font-black text-gray-900 group-hover:text-green-600 transition-colors">
                  {match.awayTeam.shortName}
                </div>
                {awayFormation && (
                  <div className="text-xs text-gray-400 font-mono mt-0.5">
                    {awayFormation}
                  </div>
                )}
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                Mehmon
              </span>
            </Link>
          </div>
        </div>

        <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 flex flex-wrap gap-4 justify-center text-xs text-gray-500">
          <span>📅 {formatMatchDate(match.utcDate)}</span>
          {location?.stadium && <span>🏟 {location.stadium}</span>}
          {location?.city && <span>📍 {location.city}</span>}
          {referee?.name && <span>🟡 {referee.name}</span>}
          {match.referees?.[0] && !referee?.name && (
            <span>🟡 {match.referees[0].name}</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">
            📈 Tahminlar jadvali
          </h2>
        </div>
        {odds ? (
          <div className="p-5">
            <div className="grid grid-cols-3 gap-3">
              {/* Home win */}
              <div
                className={`rounded-xl p-4 text-center border-2 ${
                  odds.homeWin
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="text-xs text-gray-500 mb-1">
                  🏠 Uy g'alabasi
                </div>
                <div className="text-2xl font-black text-blue-600">
                  {odds.homeWin ?? odds["1"] ?? "—"}
                </div>
              </div>
              {/* Draw */}
              <div
                className={`rounded-xl p-4 text-center border-2 ${
                  odds.draw
                    ? "border-gray-200 bg-gray-50"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="text-xs text-gray-500 mb-1">🤝 Durrang</div>
                <div className="text-2xl font-black text-gray-600">
                  {odds.draw ?? odds["X"] ?? "—"}
                </div>
              </div>
              {/* Away win */}
              <div
                className={`rounded-xl p-4 text-center border-2 ${
                  odds.awayWin
                    ? "border-red-200 bg-red-50"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="text-xs text-gray-500 mb-1">
                  ✈️ Mehmon g'alabasi
                </div>
                <div className="text-2xl font-black text-red-500">
                  {odds.awayWin ?? odds["2"] ?? "—"}
                </div>
              </div>
            </div>
            {odds.provider && (
              <div className="text-xs text-gray-400 text-center mt-3">
                Manba: {odds.provider}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon="📊"
            text="Koeffitsient ma'lumotlari hali mavjud emas"
          />
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-bold text-gray-900">📊 Match Statistikasi</h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              {match.homeTeam.shortName}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
              {match.awayTeam.shortName}
            </span>
          </div>
        </div>

        {statsAll.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {/* Umumiy */}
            <div className="px-6 py-5 space-y-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Umumiy
              </div>
              {statsAll.map((s, i) => (
                <StatRow
                  key={i}
                  title={s.title}
                  home={s.home}
                  away={s.away}
                  highlighted={s.highlighted}
                />
              ))}
            </div>
            {/* Birinchi yarm */}
            {statsFirst.length > 0 && (
              <div className="px-6 py-5 space-y-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  1-yarm
                </div>
                {statsFirst.map((s, i) => (
                  <StatRow
                    key={i}
                    title={s.title}
                    home={s.home}
                    away={s.away}
                    highlighted={s.highlighted}
                  />
                ))}
              </div>
            )}
            {/* Ikkinchi yarm */}
            {statsSecond.length > 0 && (
              <div className="px-6 py-5 space-y-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  2-yarm
                </div>
                {statsSecond.map((s, i) => (
                  <StatRow
                    key={i}
                    title={s.title}
                    home={s.home}
                    away={s.away}
                    highlighted={s.highlighted}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon="📋"
            text="Statistika ma'lumotlari hali mavjud emas"
          />
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-bold text-gray-900">⚽ Tarkib</h2>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {Object.entries(POS_COLORS).map(([pos, c]) => (
              <span key={pos} className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: c.bg }}
                />
                {POS_LABELS[pos]}
              </span>
            ))}
          </div>
        </div>

        {homeStarters.length > 0 || awayStarters.length > 0 ? (
          <>
            <div className="grid grid-cols-2 divide-x divide-gray-100">
              {/* Home starters */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  {match.homeTeam.crest && (
                    <Image
                      src={match.homeTeam.crest}
                      alt=""
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  )}
                  <span className="text-sm font-bold text-gray-700">
                    {match.homeTeam.shortName}
                  </span>
                  {homeFormation && (
                    <span className="text-xs font-mono text-gray-400 ml-auto">
                      {homeFormation}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {homeStarters.map((p: any, i: number) => {
                    const pos = normalizePos(p.position || "M");
                    const colors = POS_COLORS[pos];
                    return (
                      <div
                        key={p.player?.id || i}
                        className="flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-gray-50"
                      >
                        <span
                          className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                          style={{ backgroundColor: colors.bg }}
                        >
                          {p.shirtNumber ?? p.jerseyNumber ?? ""}
                        </span>
                        <span className="text-xs text-gray-700 flex-1 truncate">
                          {p.player?.name || p.name}
                        </span>
                        <span className="text-xs font-mono text-gray-400">
                          {POS_LABELS[pos]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Away starters */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  {match.awayTeam.crest && (
                    <Image
                      src={match.awayTeam.crest}
                      alt=""
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  )}
                  <span className="text-sm font-bold text-gray-700">
                    {match.awayTeam.shortName}
                  </span>
                  {awayFormation && (
                    <span className="text-xs font-mono text-gray-400 ml-auto">
                      {awayFormation}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {awayStarters.reverse().map((p: any, i: number) => {
                    const pos = normalizePos(p.position || "M");
                    const colors = POS_COLORS[pos];
                    return (
                      <div
                        key={p.player?.id || i}
                        className="flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-gray-50"
                      >
                        <span
                          className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                          style={{ backgroundColor: colors.bg }}
                        >
                          {p.shirtNumber ?? p.jerseyNumber ?? ""}
                        </span>
                        <span className="text-xs text-gray-700 flex-1 truncate">
                          {p.player?.name || p.name}
                        </span>
                        <span className="text-xs font-mono text-gray-400">
                          {POS_LABELS[pos]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bench */}
            {(homeBench.length > 0 || awayBench.length > 0) && (
              <div className="border-t border-gray-100">
                <div className="px-6 py-3 border-b border-gray-50">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    🪑 Zaxira
                  </span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-gray-100">
                  <div className="p-4 space-y-1">
                    {homeBench.map((p: any, i: number) => {
                      const pos = normalizePos(p.position || "M");
                      const colors = POS_COLORS[pos];
                      return (
                        <div
                          key={p.player?.id || i}
                          className="flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-gray-50"
                        >
                          <span
                            className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 opacity-50"
                            style={{ backgroundColor: colors.bg }}
                          >
                            {p.shirtNumber ?? p.jerseyNumber ?? ""}
                          </span>
                          <span className="text-xs text-gray-400 flex-1 truncate">
                            {p.player?.name || p.name}
                          </span>
                          <span className="text-xs font-mono text-gray-300">
                            {POS_LABELS[pos]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-4 space-y-1">
                    {awayBench.map((p: any, i: number) => {
                      const pos = normalizePos(p.position || "M");
                      const colors = POS_COLORS[pos];
                      return (
                        <div
                          key={p.player?.id || i}
                          className="flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-gray-50"
                        >
                          <span
                            className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 opacity-50"
                            style={{ backgroundColor: colors.bg }}
                          >
                            {p.shirtNumber ?? p.jerseyNumber ?? ""}
                          </span>
                          <span className="text-xs text-gray-400 flex-1 truncate">
                            {p.player?.name || p.name}
                          </span>
                          <span className="text-xs font-mono text-gray-300">
                            {POS_LABELS[pos]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState icon="👥" text="Tarkib ma'lumotlari hali mavjud emas" />
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">🎬 Highlights</h2>
        </div>
        {highlights?.url ? (
          <div className="p-5">
            <a
              href={highlights.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-green-50 hover:border-green-200 border border-gray-100 transition-all group"
            >
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                  {match.homeTeam.shortName} vs {match.awayTeam.shortName} —
                  Highlights
                </div>
                <div className="text-xs text-gray-400 truncate mt-0.5">
                  {highlights.url}
                </div>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-green-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        ) : (
          <EmptyState icon="🎬" text="Highlights hali mavjud emas" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { team: match.homeTeam, label: "Uy egasi" },
          { team: match.awayTeam, label: "Mehmon" },
        ].map(({ team, label }) => (
          <Link
            key={team.id}
            href={`/clubs/${team.id}`}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-green-200 transition-all group"
          >
            {team.crest && (
              <Image
                src={team.crest}
                alt={team.name}
                width={36}
                height={36}
                className="object-contain"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-400">{label}</div>
              <div className="font-bold text-gray-800 group-hover:text-green-600 transition-colors text-sm truncate">
                {team.name}
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
        ))}
      </div>
    </div>
  );
}
