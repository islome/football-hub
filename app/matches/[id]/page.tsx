import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatch } from "@/lib/football-api";
import {
  findSofascoreMatchId,
  getSofascoreMatchData,
  groupByFormation,
  getIncidentIcon,
} from "@/lib/sofascore";
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

// Position ranglar
const POS_COLORS: Record<string, { bg: string; border: string }> = {
  G: { bg: "#f59e0b", border: "#d97706" }, // GK — sariq
  D: { bg: "#3b82f6", border: "#2563eb" }, // DEF — ko'k
  M: { bg: "#10b981", border: "#059669" }, // MID — yashil
  F: { bg: "#ef4444", border: "#dc2626" }, // FWD — qizil
};

const POS_LABELS: Record<string, string> = {
  G: "GK",
  D: "DEF",
  M: "MID",
  F: "FWD",
};

// O'yinchi badge komponenti
function PlayerBadge({ player, side }: { player: any; side: "home" | "away" }) {
  const pos = player.position || "M";
  const colors = POS_COLORS[pos] || POS_COLORS["M"];
  const name = player.player?.shortName || player.player?.name || "";
  const lastName = name.split(" ").pop() || name;
  const num = player.shirtNumber ?? player.jerseyNumber ?? "";

  return (
    <div
      className="flex flex-col items-center gap-1 group cursor-default"
      style={{ minWidth: 44 }}
    >
      {/* Shirt number circle */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg transition-transform group-hover:scale-110"
        style={{
          backgroundColor: colors.bg,
          border: `2.5px solid ${colors.border}`,
        }}
      >
        {num}
      </div>
      {/* Name */}
      <span
        className="text-white font-semibold text-center leading-tight drop-shadow-sm"
        style={{ fontSize: "9px", maxWidth: 52, lineHeight: "1.2" }}
      >
        {lastName}
      </span>
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

  // Sofascore data
  let lineups: any = null;
  let statistics: any[] = [];
  let incidents: any[] = [];

  if (isFinished || isLive) {
    try {
      const sofaId = await findSofascoreMatchId(
        match.utcDate,
        match.homeTeam.name,
        match.awayTeam.name,
        match.competition.code,
      );
      if (sofaId) {
        const data = await getSofascoreMatchData(sofaId);
        lineups = data.lineups;
        statistics = data.statistics;
        incidents = data.incidents;
      }
    } catch {}
  }

  const homePlayers: any[] = lineups?.home?.players || [];
  const awayPlayers: any[] = lineups?.away?.players || [];
  const homeFormation: string = lineups?.home?.formation || "";
  const awayFormation: string = lineups?.away?.formation || "";

  const homeStarters = homePlayers.filter((p) => !p.substitute);
  const awayStarters = awayPlayers.filter((p) => !p.substitute);
  const homeBench = homePlayers.filter((p) => p.substitute);
  const awayBench = awayPlayers.filter((p) => p.substitute);

  const homeRows =
    homeFormation && homeStarters.length > 0
      ? groupByFormation(homeStarters, homeFormation)
      : [];
  const awayRows =
    awayFormation && awayStarters.length > 0
      ? groupByFormation(awayStarters, awayFormation)
      : [];

  const statsGroups = statistics?.[0]?.groups || [];
  const keyIncidents = incidents.filter(
    (i: any) => i.incidentType === "goal" || i.incidentType === "card",
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
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

      {/* ── Score Card ── */}
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
            <Link
              href={`/clubs/${match.homeTeam.id}`}
              className="flex flex-col items-center gap-3 flex-1 hover:opacity-80 transition-opacity group"
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

            <div className="flex flex-col items-center shrink-0">
              {isFinished || isLive ? (
                <>
                  <div className="text-5xl sm:text-6xl font-black text-gray-900 tabular-nums">
                    {match.score.fullTime.home ?? 0}
                    <span className="text-gray-200 mx-2">—</span>
                    {match.score.fullTime.away ?? 0}
                  </div>
                  {match.score.halfTime.home !== null && (
                    <div className="text-xs text-gray-400 mt-1">
                      YV: {match.score.halfTime.home}—
                      {match.score.halfTime.away}
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

            <Link
              href={`/clubs/${match.awayTeam.id}`}
              className="flex flex-col items-center gap-3 flex-1 hover:opacity-80 transition-opacity group"
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
          {match.venue && <span>🏟 {match.venue}</span>}
          {match.referees?.[0] && <span>🟡 {match.referees[0].name}</span>}
        </div>
      </div>

      {keyIncidents.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">📋 Match Voqealari</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {keyIncidents.map((incident: any, i: number) => {
              const isHome = incident.isHome;
              const icon = getIncidentIcon(incident);
              const playerName = incident.player?.name || "";
              const assistName = incident.assist1?.name || "";
              const min = incident.time ? `${incident.time}'` : "";

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-2.5 ${isHome ? "" : "flex-row-reverse"}`}
                >
                  <span className="text-xs text-gray-400 w-8 text-center font-mono shrink-0">
                    {min}
                  </span>
                  <span className="text-base shrink-0">{icon}</span>
                  <div
                    className={`flex-1 ${isHome ? "text-left" : "text-right"}`}
                  >
                    <span className="text-sm font-semibold text-gray-800">
                      {playerName}
                    </span>
                    {assistName && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({assistName})
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-5 h-5 shrink-0 ${isHome ? "" : "order-first"}`}
                  >
                    {isHome
                      ? match.homeTeam.crest && (
                          <Image
                            src={match.homeTeam.crest}
                            alt=""
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                        )
                      : match.awayTeam.crest && (
                          <Image
                            src={match.awayTeam.crest}
                            alt=""
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                        )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {statsGroups.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">📊 Match Statistikasi</h2>
          </div>
          <div className="px-6 py-5 space-y-6">
            {statsGroups.map((group: any, gi: number) => (
              <div key={gi}>
                {group.groupName && (
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    {group.groupName}
                  </div>
                )}
                <div className="space-y-3">
                  {group.statisticsItems?.map((item: any, ii: number) => {
                    const hVal = item.home ?? 0;
                    const aVal = item.away ?? 0;
                    const hNum =
                      typeof hVal === "string"
                        ? parseFloat(hVal)
                        : Number(hVal);
                    const aNum =
                      typeof aVal === "string"
                        ? parseFloat(aVal)
                        : Number(aVal);
                    const isPct =
                      typeof hVal === "string" && hVal.includes("%");
                    const total = hNum + aNum || 1;
                    const hPct = isPct
                      ? hNum
                      : Math.round((hNum / total) * 100);
                    const aPct = isPct ? aNum : 100 - hPct;

                    return (
                      <div key={ii}>
                        <div className="flex justify-between items-center text-sm mb-1.5">
                          <span className="font-bold text-gray-800 w-12">
                            {hVal}
                          </span>
                          <span className="text-xs text-gray-500 text-center flex-1">
                            {item.name}
                          </span>
                          <span className="font-bold text-gray-800 w-12 text-right">
                            {aVal}
                          </span>
                        </div>
                        <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                          <div
                            className="bg-blue-500 transition-all duration-500"
                            style={{ width: `${hPct}%` }}
                          />
                          <div
                            className="bg-red-400 transition-all duration-500"
                            style={{ width: `${aPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between text-xs font-semibold">
            <span className="text-blue-600 flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              {match.homeTeam.shortName}
            </span>
            <span className="text-red-500 flex items-center gap-1.5">
              {match.awayTeam.shortName}
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            </span>
          </div>
        </div>
      )}

      {homeRows.length > 0 && awayRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-2xl font-bold text-gray-900">⚽ Asosiy Tarkib</h2>
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
          <div className="p-3 sm:p-5">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(180deg, #16a34a 0%, #15803d 50%, #16a34a 100%)",
                height: 520,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 60px, transparent 60px, transparent 120px)",
                }}
              />

              <div className="absolute top-3 left-0 right-0 flex justify-between px-5 pointer-events-none z-10">
                <div className="flex items-center gap-1.5 bg-black/20 rounded px-3 py-1">
                  {match.homeTeam.crest && (
                    <img
                      src={match.homeTeam.crest}
                      alt=""
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                  )}
                  <span className="text-white text-xs font-bold">
                    {match.homeTeam.shortName}
                  </span>
                  <span className="text-white/60 text-xs font-mono">
                    {homeFormation}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/20 rounded-full px-3 py-1">
                  <span className="text-white/60 text-xs font-mono">
                    {awayFormation}
                  </span>
                  <span className="text-white text-xs font-bold">
                    {match.awayTeam.shortName}
                  </span>
                  {match.awayTeam.crest && (
                    <img
                      src={match.awayTeam.crest}
                      alt=""
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                  )}
                </div>
              </div>

              <div
                className="absolute inset-0 flex "
                style={{ paddingTop: 44, paddingBottom: 12 }}
              >
                <div
                  className="flex-1 flex flex-row items-stretch"
                  style={{ paddingLeft: 8, paddingRight: 4 }}
                >
                  {[...homeRows].map((row: any[], rowIdx: number) => (
                    <div
                      key={`home-row-${rowIdx}`} //
                      className="flex-1 flex flex-col items-center justify-center gap-8"
                    >
                      {row.map((player: any, pIdx: number) => (
                        <Link
                          key={`home-p-${player.player?.id || pIdx}-${rowIdx}`}
                          href={`/players/${player.player?.id}`}
                        >
                          <PlayerBadge
                            key={
                              player.player?.id || `away-p-${pIdx}-${rowIdx}`
                            }
                            player={player}
                            side="away"
                          />
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>

                <div
                  className="flex-1 flex items-stretch "
                  style={{ paddingRight: 8, paddingLeft: 4 }}
                >
                  {[...awayRows] //
                    .reverse()
                    .map((row: any[], rowIdx: number) => (
                      <div
                        key={`away-row-${rowIdx}`}
                        className="flex-1 flex flex-col items-center justify-center gap-8"
                      >
                        {row.map((player: any, pIdx: number) => (
                          <Link
                            key={`away-p-${player.player?.id || pIdx}-${rowIdx}`}
                            href={`players/${player.player?.id}`}
                          >
                            <PlayerBadge
                              key={
                                player.player?.id || `away-p-${pIdx}-${rowIdx}`
                              }
                              player={player}
                              side="away"
                            />
                          </Link>
                        ))}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
            {/* Home */}
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
              </div>
              <div className="space-y-1">
                {homeStarters.map((p: any) => {
                  const pos = p.position || "M";
                  const colors = POS_COLORS[pos] || POS_COLORS["M"];
                  return (
                    <div
                      key={p.player?.id}
                      className="flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span
                        className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                        style={{ backgroundColor: colors.bg }}
                      >
                        {p.shirtNumber}
                      </span>
                      <span className="text-xs text-gray-700 flex-1 truncate">
                        {p.player?.name}
                      </span>
                      <span className="text-xs font-mono text-gray-400">
                        {POS_LABELS[pos]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Away */}
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
              </div>
              <div className="space-y-1">
                {awayStarters.map((p: any) => {
                  const pos = p.position || "M";
                  const colors = POS_COLORS[pos] || POS_COLORS["M"];
                  return (
                    <div
                      key={p.player?.id}
                      className="flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span
                        className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                        style={{ backgroundColor: colors.bg }}
                      >
                        {p.shirtNumber}
                      </span>
                      <span className="text-xs text-gray-700 flex-1 truncate">
                        {p.player?.name}
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
        </div>
      )}

      {(homeBench.length > 0 || awayBench.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">🪑 Zaxira O'yinchilar</h2>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-4 space-y-1">
              <div className="flex items-center gap-2 mb-3">
                {match.homeTeam.crest && (
                  <Image
                    src={match.homeTeam.crest}
                    alt=""
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                )}
                <span className="text-xs font-bold text-gray-600">
                  {match.homeTeam.shortName}
                </span>
              </div>
              {homeBench.map((p: any) => {
                const pos = p.position || "M";
                const colors = POS_COLORS[pos] || POS_COLORS["M"];
                return (
                  <div
                    key={p.player?.id}
                    className="flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span
                      className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 opacity-60"
                      style={{ backgroundColor: colors.bg }}
                    >
                      {p.shirtNumber}
                    </span>
                    <span className="text-xs text-gray-500 flex-1 truncate">
                      {p.player?.name}
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      {POS_LABELS[pos]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="p-4 space-y-1">
              <div className="flex items-center gap-2 mb-3">
                {match.awayTeam.crest && (
                  <Image
                    src={match.awayTeam.crest}
                    alt=""
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                )}
                <span className="text-xs font-bold text-gray-600">
                  {match.awayTeam.shortName}
                </span>
              </div>
              {awayBench.map((p: any) => {
                const pos = p.position || "M";
                const colors = POS_COLORS[pos] || POS_COLORS["M"];
                return (
                  <div
                    key={p.player?.id}
                    className="flex items-center gap-2 px-1 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span
                      className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 opacity-60"
                      style={{ backgroundColor: colors.bg }}
                    >
                      {p.shirtNumber}
                    </span>
                    <span className="text-xs text-gray-500 flex-1 truncate">
                      {p.player?.name}
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
      )}

      {(isFinished || isLive) && homeRows.length === 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-gray-500 text-sm font-medium">
            Tarkib ma'lumoti mavjud emas
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Link
          href={`/clubs/${match.homeTeam.id}`}
          className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-green-200 transition-all group"
        >
          {match.homeTeam.crest && (
            <Image
              src={match.homeTeam.crest}
              alt={match.homeTeam.name}
              width={36}
              height={36}
              className="object-contain"
            />
          )}
          <div>
            <div className="text-xs text-gray-400">Uy egasi</div>
            <div className="font-bold text-gray-800 group-hover:text-green-600 transition-colors text-sm">
              {match.homeTeam.name}
            </div>
          </div>
          <svg
            className="w-4 h-4 text-gray-300 group-hover:text-green-500 ml-auto"
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
        <Link
          href={`/clubs/${match.awayTeam.id}`}
          className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-green-200 transition-all group"
        >
          {match.awayTeam.crest && (
            <Image
              src={match.awayTeam.crest}
              alt={match.awayTeam.name}
              width={36}
              height={36}
              className="object-contain"
            />
          )}
          <div>
            <div className="text-xs text-gray-400">Mehmon</div>
            <div className="font-bold text-gray-800 group-hover:text-green-600 transition-colors text-sm">
              {match.awayTeam.name}
            </div>
          </div>
          <svg
            className="w-4 h-4 text-gray-300 group-hover:text-green-500 ml-auto"
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
      </div>
    </div>
  );
}
