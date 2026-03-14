import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getStandings,
  getUpcomingMatches,
  getMatches,
  LEAGUES,
  LeagueCode,
} from "@/lib/football-api";
import StandingsTable from "@/components/StandingsTable";
import MatchCard from "@/components/MatchCard";
import { ErrorMessage } from "@/components/ui";

export const revalidate = 1800;

// Ligalar — build vaqtida statik generate
export async function generateStaticParams() {
  return ["PL", "CL", "PD"].map((code) => ({ code }));
}

interface Props {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase() as LeagueCode;
  const league = LEAGUES[code];
  if (!league) return { title: "Liga topilmadi" };
  return { title: `${league.name} — FootballHub` };
}

export default async function LeaguePage({ params, searchParams }: Props) {
  const { code: rawCode } = await params;
  const { tab: rawTab } = await searchParams;
  const code = rawCode.toUpperCase() as LeagueCode;
  const tab = rawTab || "table";

  const league = LEAGUES[code];
  if (!league) notFound();

  let standings = null;
  let matches: any[] = [];
  let error = null;

  try {
    if (tab === "table") {
      standings = await getStandings(code);
    } else if (tab === "upcoming") {
      matches = await getUpcomingMatches(code);
    } else if (tab === "results") {
      matches = (await getMatches(code, "FINISHED")).slice(-20).reverse();
    }
  } catch (e: any) {
    error = e.message;
  }

  const tabs = [
    { key: "table", label: "📊 Jadval" },
    { key: "upcoming", label: "📅 Kelayotgan" },
    { key: "results", label: "✅ Natijalar" },
  ];

  const leagueColors: Record<string, string> = {
    PL: "from-purple-700 to-purple-900",
    CL: "from-blue-700 to-blue-900",
    PD: "from-red-700 to-red-900",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div
        className={`bg-gradient-to-br ${leagueColors[code] || "from-gray-700 to-gray-900"} rounded-2xl text-white p-8`}
      >
        <div className="flex items-center gap-5">
          {standings?.competition?.emblem && (
            <Image
              src={standings.competition.emblem}
              alt={league.name}
              width={92}
              height={92}
              className="object-contain drop-shadow-lg"
            />
          )}
          <div>
            <div className="text-white/60 text-sm mb-1">
              {league.flag} {league.country}
            </div>
            <h1 className="text-3xl font-black">{league.name}</h1>
            <div className="flex gap-3 mt-3">
              <Link
                href={`/clubs?league=${code}`}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                Clublarni ko'rish
              </Link>
              <Link
                href={`/leagues/${code}?tab=upcoming`}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                Matchlar jadvali
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/leagues/${code}?tab=${t.key}`}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-white text-gray-900 shadow-sm font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Content */}
      {error ? (
        <ErrorMessage message={error} />
      ) : tab === "table" && standings ? (
        <StandingsTable table={standings.table} leagueCode={code} />
      ) : tab === "upcoming" || tab === "results" ? (
        matches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">⚽</div>
            <div className="text-gray-500 font-medium">
              {tab === "upcoming"
                ? "Yaqin orada match rejalashtirilmagan"
                : "Hali natija yo'q"}
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
 