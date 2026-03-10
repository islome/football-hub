import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getSofascorePlayer,
  getSofascorePlayerLastMatches,
  getSofascorePlayerTransfers,
  getSofascorePlayerCharacteristics,
  getSofascorePlayerStatistics,
  LEAGUE_CONFIG,
} from "@/lib/sofascore";

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  try {
    const { id } = await params;
    const data = await getSofascorePlayer(parseInt(id));
    return { title: `${data?.player?.name} — FootballHub` };
  } catch {
    return { title: "O'yinchi — FootballHub" };
  }
}

const POS_FULL: Record<string, string> = {
  G: "Darvozabon",
  D: "Himoyachi",
  M: "Yarim himoyachi",
  F: "Hujumchi",
};
const POS_COLORS: Record<string, string> = {
  G: "#f59e0b",
  D: "#3b82f6",
  M: "#10b981",
  F: "#ef4444",
};
const POS_COLORS_LIGHT: Record<string, string> = {
  G: "#fef3c7",
  D: "#dbeafe",
  M: "#d1fae5",
  F: "#fee2e2",
};

function StatBar({
  label,
  value,
  max = 100,
}: {
  label: string;
  value: number;
  max?: number;
}) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  const color = pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-bold text-gray-800">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default async function PlayerDetailPage({ params }: Props) {
  const { id } = await params;
  const playerId = parseInt(id);
  if (isNaN(playerId)) notFound();

  const playerData = await getSofascorePlayer(playerId);
  if (!playerData?.player) notFound();

  const player = playerData.player;

  // Player image — proxy orqali
  const imageUrl = `https://img.freepik.com/premium-vector/soccer-player-black-simple-icon-isolated-white-background_98402-68338.jpg`;

  // Parallel fetch
  const [lastMatchesRes, transfersRes, charsRes] = await Promise.allSettled([
    getSofascorePlayerLastMatches(playerId),
    getSofascorePlayerTransfers(playerId),
    getSofascorePlayerCharacteristics(playerId),
  ]);

  // O'yinchi ligasiga qarab statistika
  let stats: any = null;
  try {
    const tournamentId = player.team?.primaryUniqueTournament?.id;
    const seasonId = player.team?.tournament?.uniqueTournament?.id
      ? Object.values(LEAGUE_CONFIG).find(
          (c) => c.tournamentId === player.team?.primaryUniqueTournament?.id,
        )?.seasonId
      : null;

    if (tournamentId && seasonId) {
      const statRes = await getSofascorePlayerStatistics(
        playerId,
        tournamentId,
        seasonId,
      );
      stats = statRes?.statistics;
    } else {
      // Fallback — PL
      const pl = LEAGUE_CONFIG["PL"];
      const statRes = await getSofascorePlayerStatistics(
        playerId,
        pl.tournamentId,
        pl.seasonId,
      );
      stats = statRes?.statistics;
    }
  } catch {}

  const matches =
    lastMatchesRes.status === "fulfilled"
      ? lastMatchesRes.value?.events || []
      : [];
  const transferList =
    transfersRes.status === "fulfilled"
      ? transfersRes.value?.transferHistory || []
      : [];
  const chars =
    charsRes.status === "fulfilled"
      ? charsRes.value?.playerCharacteristics
      : null;

  const pos = player.position || "M";
  const posColor = POS_COLORS[pos] || "#6b7280";
  const posColorLight = POS_COLORS_LIGHT[pos] || "#f3f4f6";

  // Yosh hisoblash
  const age = player.dateOfBirthTimestamp
    ? Math.floor(
        (Date.now() / 1000 - player.dateOfBirthTimestamp) /
          (365.25 * 24 * 3600),
      )
    : null;

  // Kontrakt tugash
  const contractUntil = player.contractUntilTimestamp
    ? new Date(player.contractUntilTimestamp * 1000).toLocaleDateString(
        "uz-UZ",
        { year: "numeric", month: "long" },
      )
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
        <Link href="/" className="hover:text-green-600 transition-colors">
          Bosh sahifa
        </Link>
        <span>/</span>
        <span className="text-gray-700">{player.name}</span>
      </div>

      <div className="bg-white  overflow-hidden pt-3">
        <div className="pt-8 sm:px-8 pb-6 mt-8">
          <div className="flex items-end gap-5 -mt-14 mb-5 flex-wrap">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={imageUrl}
                alt={player.name}
                width={96}
                height={96}
                className="w-24 h-24 object-cover z-10"
              />
              {/* Jersey number */}
              <div
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-black shadow-md"
                style={{ backgroundColor: posColor }}
              >
                {player.jerseyNumber || player.shirtNumber || "—"}
              </div>
            </div>

            {/* Name & info */}
            <div className="flex-1 pb-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 truncate">
                {player.name}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className="text-xs font-bold px-2.5 p-1 rounded text-white"
                  style={{ backgroundColor: posColor }}
                >
                  {POS_FULL[pos] || pos}
                </span>
                {player.team && (
                  <span className="text-sm text-gray-500 font-medium">
                    {player.team.name}
                  </span>
                )}
                {player.country?.name && (
                  <span className="text-sm text-gray-400">
                    {player.country.name}
                  </span>
                )}
              </div>
            </div>

            {/* Market value */}
            {player.proposedMarketValueRaw?.value && (
              <div className="pb-1 text-right">
                <div className="text-2xl font-black text-gray-900">
                  €
                  {(player.proposedMarketValueRaw.value / 1_000_000).toFixed(1)}
                  M
                </div>
                <div className="text-xs text-gray-400">Bozor narxi</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {age && (
              <div
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: posColorLight }}
              >
                <div className="text-2xl font-black text-gray-900">{age}</div>
                <div className="text-xs text-gray-500 mt-0.5">Yosh</div>
              </div>
            )}
            {player.height && (
              <div
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: posColorLight }}
              >
                <div className="text-2xl font-black text-gray-900">
                  {player.height}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Bo'y (sm)</div>
              </div>
            )}
            {player.weight && (
              <div
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: posColorLight }}
              >
                <div className="text-2xl font-black text-gray-900">
                  {player.weight}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Vazn (kg)</div>
              </div>
            )}
            {player.preferredFoot && (
              <div
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: posColorLight }}
              >
                <div className="text-2xl font-black text-gray-900">
                  {player.preferredFoot === "Right"
                    ? "O'ng"
                    : player.preferredFoot === "Left"
                      ? "Chap"
                      : player.preferredFoot}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Oyoq</div>
              </div>
            )}
          </div>

          {contractUntil && (
            <div className="mt-3 mb-4 flex items-center gap-2 text-xs text-gray-400">
              <span>📋 Kontrakt:</span>
              <span className="font-semibold text-gray-600">
                {contractUntil.toUpperCase()}-yilgacha
              </span>
            </div>
          )}
        </div>
      </div>

      {stats && (
        <div className="bg-whiteoverflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">📊 Mavsum Statistikasi</h2>
          </div>
          <div className="p-5">
            {/* Key numbers */}
            <div className="grid grid-cols-3 sm:grid-cols-2 gap-3 mb-8">
              {[
                { label: "O'yin", value: stats.appearances },
                { label: "Gol", value: stats.goals },
                { label: "Assist", value: stats.assists },
                { label: "🟨", value: stats.yellowCards },
                { label: "🟥", value: stats.redCards },
              ]
                .filter((s) => s.value != null)
                .map((s, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-xl p-3 text-center"
                  >
                    <div className="text-2xl font-black text-gray-900">
                      {s.value}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {s.label}
                    </div>
                  </div>
                ))}
            </div>

            {/* Bars */}
            <div className="space-y-3">
              {stats.rating != null && (
                <StatBar
                  label="O'rtacha reyting"
                  value={parseFloat(stats.rating)}
                  max={10}
                />
              )}
              {stats.accuratePassesPercentage != null && (
                <StatBar
                  label="Aniq paslar %"
                  value={Math.round(stats.accuratePassesPercentage)}
                />
              )}
              {stats.totalDuelsWonPercentage != null && (
                <StatBar
                  label="Duel g'alaba %"
                  value={Math.round(stats.totalDuelsWonPercentage)}
                />
              )}
              {stats.successfulDribblesPercentage != null && (
                <StatBar
                  label="Dribbling %"
                  value={Math.round(stats.successfulDribblesPercentage)}
                />
              )}
              {stats.minutesPlayed != null && (
                <StatBar
                  label="O'ynalgan daqiqa"
                  value={stats.minutesPlayed}
                  max={3000}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {chars?.positions && chars.positions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">⚡ Xususiyatlar</h2>
          </div>
          <div className="p-5 space-y-4">
            {chars.positions.map((posItem: any, i: number) => (
              <div key={i}>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {posItem.position}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {posItem.characteristics?.map((c: any, ci: number) => (
                    <div
                      key={ci}
                      className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2"
                    >
                      <span>{c.type === "positive" ? "✅" : "⚠️"}</span>
                      <span className="text-xs text-gray-700">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div className="bg-white mb-4 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">🏟 So'nggi Matchlar</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {matches.slice(0, 8).map((event: any, i: number) => {
              const isHome = event.homeTeam?.id === player.team?.id;
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
              const rating = event.playerStatistics?.rating
                ? parseFloat(event.playerStatistics.rating)
                : null;

              return (
                <div key={i} className="px-4 py-3 flex items-center gap-3">
                  {/* W/D/L */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 ${
                      won ? "bg-green-500" : draw ? "bg-gray-400" : "bg-red-500"
                    }`}
                  >
                    {won ? "G" : draw ? "D" : "M"}
                  </div>

                  {/* Opponent */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-700 truncate">
                      vs {oppTeam?.shortName || oppTeam?.name || "—"}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {event.tournament?.name} · {date}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-sm font-black text-gray-800 tabular-nums shrink-0">
                    {myScore ?? "—"}–{oppScore ?? "—"}
                  </div>

                  {/* Rating */}
                  {rating && (
                    <div
                      className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        rating >= 7
                          ? "bg-green-100 text-green-700"
                          : rating >= 6
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-600"
                      }`}
                    >
                      {rating.toFixed(1)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {transferList.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">🔄 Transfer Tarixi</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {transferList.slice(0, 8).map((t: any, i: number) => {
              const date = t.transferDateTimestamp
                ? new Date(t.transferDateTimestamp * 1000).toLocaleDateString(
                    "uz-UZ",
                    {
                      year: "numeric",
                      month: "short",
                    },
                  )
                : "";
              const fee = t.transferFeeRaw?.value
                ? `€${(t.transferFeeRaw.value / 1_000_000).toFixed(1)}M`
                : t.transferFeeDescription || "Bepul";

              return (
                <div key={i} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2 min-w-0 text-xs">
                    <span className="text-gray-500 truncate">
                      {t.fromTeam?.name || "—"}
                    </span>
                    <span className="text-gray-300 shrink-0">→</span>
                    <span className="font-semibold text-gray-700 truncate">
                      {t.toTeam?.name || "—"}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-green-600 shrink-0">
                    {fee}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">{date}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
