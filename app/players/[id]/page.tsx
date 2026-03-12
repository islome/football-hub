// app/players/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPlayer, getPlayerMatches } from "@/lib/football-api";
import { getPlayerDetail } from "@/lib/football";

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  try {
    const { id } = await params;
    const player = await getPlayer(parseInt(id));
    return { title: `${player?.name} — FootballHub` };
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

function normalizePosition(pos: string): string {
  if (!pos) return "M";
  const p = pos.toUpperCase();
  if (p.includes("GOALKEEPER")) return "G";
  if (p.includes("DEFENCE") || p.includes("DEFENDER")) return "D";
  if (p.includes("MIDFIELD")) return "M";
  if (p.includes("OFFENCE") || p.includes("FORWARD") || p.includes("ATTACK"))
    return "F";
  return "M";
}

function calcAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;
  return Math.floor(
    (Date.now() - new Date(dateOfBirth).getTime()) /
      (1000 * 60 * 60 * 24 * 365.25),
  );
}

export default async function PlayerDetailPage({ params }: Props) {
  const { id } = await params;
  const playerId = parseInt(id);
  if (isNaN(playerId)) notFound();

  const [playerRes, detailRes, matchesRes] = await Promise.allSettled([
    getPlayer(playerId),
    getPlayerDetail(playerId),
    getPlayerMatches(playerId),
  ]);

  const player = playerRes.status === "fulfilled" ? playerRes.value : null;
  const detail = detailRes.status === "fulfilled" ? detailRes.value : null;
  const matches = matchesRes.status === "fulfilled" ? matchesRes.value : [];

  if (!player) notFound();

  const pos = normalizePosition(player.position || "");
  const posColor = POS_COLORS[pos] || "#6b7280";
  const posColorLight = POS_COLORS_LIGHT[pos] || "#f3f4f6";
  const age = detail?.age || calcAge(player.dateOfBirth);
  const teamCrest = player.currentTeam?.crest || null;

  const finishedMatches = (matches || []).filter(
    (m: any) => m.status === "FINISHED",
  );

  const goals = finishedMatches.reduce((sum: number, m: any) => {
    return (
      sum +
      (m.goals?.filter((g: any) => g.scorer?.id === playerId)?.length || 0)
    );
  }, 0);

  const wins = finishedMatches.filter((m: any) => {
    const isHome = m.homeTeam?.id === player.currentTeam?.id;
    const my = isHome ? m.score?.fullTime?.home : m.score?.fullTime?.away;
    const opp = isHome ? m.score?.fullTime?.away : m.score?.fullTime?.home;
    return my != null && opp != null && my > opp;
  }).length;

  const contractEnd = detail?.contractEnd
    ? new Date(detail.contractEnd).toLocaleDateString("uz-UZ", {
        year: "numeric",
        month: "long",
      })
    : null;

  // UI Avatars — fotmob bloklaydi, shuning uchun ismlarga qarab avatar
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&size=128&background=${posColor.replace("#", "")}&color=fff&bold=true&format=png`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
        <Link href="/" className="hover:text-green-600 transition-colors">
          Bosh sahifa
        </Link>
        <span>/</span>
        <span className="text-gray-700">{player.name}</span>
      </div>

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 sm:px-8 py-6">
          <div className="flex items-center gap-5 mb-5 flex-wrap">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={avatarUrl}
                alt={player.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              {(detail?.shirt || player.shirtNumber) && (
                <div
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-black shadow"
                  style={{ backgroundColor: posColor }}
                >
                  {detail?.shirt || player.shirtNumber}
                </div>
              )}
            </div>

            {/* Name & info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 truncate">
                {player.name}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded text-white"
                  style={{ backgroundColor: posColor }}
                >
                  {POS_FULL[pos] || pos}
                </span>
                {player.currentTeam && (
                  <Link
                    href={`/clubs/${player.currentTeam.id}`}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 transition-colors"
                  >
                    {teamCrest && (
                      <Image
                        src={teamCrest}
                        alt={player.currentTeam.name}
                        width={18}
                        height={18}
                        className="object-contain"
                      />
                    )}
                    {player.currentTeam.name}
                  </Link>
                )}
                {(detail?.country || player.nationality) && (
                  <span className="text-sm text-gray-400">
                    🌍 {detail?.country || player.nationality}
                  </span>
                )}
              </div>
            </div>

            {/* Market value */}
            {detail?.marketValue && (
              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-gray-900">
                  {detail.marketValue}
                </div>
                <div className="text-xs text-gray-400">Bozor narxi</div>
              </div>
            )}
          </div>

          {/* Info grid */}
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
            {detail?.height && (
              <div
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: posColorLight }}
              >
                <div className="text-xl font-black text-gray-900">
                  {detail.height}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Bo'y</div>
              </div>
            )}
            {detail?.preferredFoot && (
              <div
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: posColorLight }}
              >
                <div className="text-xl font-black text-gray-900">
                  {detail.preferredFoot === "Left"
                    ? "⬅️ Chap"
                    : detail.preferredFoot === "Right"
                      ? "➡️ O'ng"
                      : detail.preferredFoot}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Oyoq</div>
              </div>
            )}
            {finishedMatches.length > 0 && (
              <div
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: posColorLight }}
              >
                <div className="text-2xl font-black text-gray-900">
                  {finishedMatches.length}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">O'yin</div>
              </div>
            )}
          </div>

          {contractEnd && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <span>📋 Kontrakt:</span>
              <span className="font-semibold text-gray-600">
                {contractEnd}gacha
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Statistika ── */}
      {finishedMatches.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">📊 Statistika</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-gray-900">
                  {finishedMatches.length}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">O'yin</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-gray-900">{goals}</div>
                <div className="text-xs text-gray-400 mt-0.5">Gol ⚽</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-green-600">{wins}</div>
                <div className="text-xs text-gray-400 mt-0.5">G'alaba</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-gray-900">
                  {Math.round((wins / finishedMatches.length) * 100)}%
                </div>
                <div className="text-xs text-gray-400 mt-0.5">G'alaba %</div>
              </div>
            </div>

            {/* Forma */}
            {finishedMatches.length >= 3 && (
              <div>
                <div className="text-xs text-gray-400 mb-2">So'nggi forma</div>
                <div className="flex gap-1.5">
                  {finishedMatches.slice(0, 5).map((m: any, i: number) => {
                    const isHome = m.homeTeam?.id === player.currentTeam?.id;
                    const my = isHome
                      ? m.score?.fullTime?.home
                      : m.score?.fullTime?.away;
                    const opp = isHome
                      ? m.score?.fullTime?.away
                      : m.score?.fullTime?.home;
                    const won = my != null && opp != null && my > opp;
                    const draw = my != null && opp != null && my === opp;
                    return (
                      <div
                        key={i}
                        title={`${my ?? "—"}–${opp ?? "—"}`}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white ${
                          won
                            ? "bg-green-500"
                            : draw
                              ? "bg-gray-400"
                              : "bg-red-500"
                        }`}
                      >
                        {won ? "G" : draw ? "D" : "M"}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── So'nggi matchlar ── */}
      {finishedMatches.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              🏟 So'nggi Matchlar
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {finishedMatches.slice(0, 8).map((match: any, i: number) => {
              const isHome = match.homeTeam?.id === player.currentTeam?.id;
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
                      width={24}
                      height={24}
                      className="object-contain shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-700 truncate">
                      {isHome ? "Uy" : "Mehmon"} · vs{" "}
                      {oppTeam?.shortName || oppTeam?.name || "—"}
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

      {finishedMatches.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="text-4xl mb-3">📭</div>
          <div className="text-gray-500 text-sm">
            Match ma'lumotlari topilmadi
          </div>
          <div className="text-gray-400 text-xs mt-1">
            Bu o'yinchi hozirda kuzatilayotgan ligalarda qatnashmagan bo'lishi
            mumkin
          </div>
        </div>
      )}
    </div>
  );
}
