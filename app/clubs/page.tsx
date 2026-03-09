import { getTeams, LEAGUES, LeagueCode } from "@/lib/football-api";
import ClubCard from "@/components/ClubCard";
import Link from "next/link";
import { ErrorMessage } from "@/components/ui";

export const revalidate = 21600;

export const metadata = {
  title: "Barcha Clublar — FootballHub",
};

interface Props {
  searchParams: Promise<{ league?: string }>;
}

export default async function ClubsPage({ searchParams }: Props) {
  const { league: rawLeague } = await searchParams;
  const league = (rawLeague?.toUpperCase() || "PL") as LeagueCode;
  const validLeague = Object.keys(LEAGUES).includes(league) ? league : "PL";

  let teams: any[] = [];
  let error = null;

  try {
    teams = await getTeams(validLeague as LeagueCode);
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Barcha Clublar</h1>
        <p className="text-gray-500 mt-1">Liga bo'yicha clublarni ko'ring</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(
          Object.entries(LEAGUES) as [
            LeagueCode,
            (typeof LEAGUES)[LeagueCode],
          ][]
        ).map(([code, info]) => (
          <Link
            key={code}
            href={`/clubs?league=${code}`}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              validLeague === code
                ? "bg-green-600 text-white border-green-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-600"
            }`}
          >
            {info.flag} {info.name}
          </Link>
        ))}
      </div>

      {!error && (
        <div className="text-sm text-gray-500">
          {LEAGUES[validLeague as LeagueCode].flag}{" "}
          {LEAGUES[validLeague as LeagueCode].name} —{" "}
          <span className="font-semibold text-gray-700">
            {teams.length} ta club
          </span>
        </div>
      )}

      {error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {teams.map((team) => (
            <ClubCard key={team.id} team={team} leagueCode={validLeague} />
          ))}
        </div>
      )}
    </div>
  );
}
