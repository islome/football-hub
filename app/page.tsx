import Link from "next/link";
import Image from "next/image";
import {
  getStandings,
  getUpcomingMatches,
  getLiveMatches,
} from "@/lib/football-api";
import {
  formatMatchDate,
  formatTimeOnly,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";

export const revalidate = 300; // 5 daqiqada bir yangilanadi

async function getData() {
  try {
    const [plStandings, clStandings, liveMatches, upcomingPL] =
      await Promise.allSettled([
        getStandings("PL"),
        getStandings("CL"),
        getLiveMatches(),
        getUpcomingMatches("PL"),
      ]);

    return {
      plStandings:
        plStandings.status === "fulfilled" ? plStandings.value : null,
      clStandings:
        clStandings.status === "fulfilled" ? clStandings.value : null,
      liveMatches: liveMatches.status === "fulfilled" ? liveMatches.value : [],
      upcomingPL:
        upcomingPL.status === "fulfilled" ? upcomingPL.value.slice(0, 6) : [],
    };
  } catch {
    return {
      plStandings: null,
      clStandings: null,
      liveMatches: [],
      upcomingPL: [],
    };
  }
}

export default async function HomePage() {
  const { plStandings, clStandings, liveMatches, upcomingPL } = await getData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <section className="relative bg-linear-to-br from-green-700 to-green-900 rounded-2xl overflow-hidden text-white px-8 py-14">
        <div className="absolute inset-0 right-1.5">
          <Image
            src="/Messi.png"
            alt="Messi"
            fill
            className="object-contain object-bottom-right opacity-30 scale-110"
            priority
          />
        </div>

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            Futbolning
            <br />
            <span className="text-green-300">Barcha Yangiliklari</span>
          </h1>
          <p className="text-green-100 text-lg mb-8">
            Premier League, Champions League va La Liga — jonli natijalar,
            jadvallar va statistika bir joyda.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/live"
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-sm"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Live Matches
            </Link>
            <Link
              href="/clubs"
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-sm backdrop-blur"
            >
              Clublarni Ko'rish
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ligalar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              code: "PL",
              name: "Premier League",
              flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
              color: "from-purple-600 to-purple-800",
              teams: 20,
            },
            {
              code: "CL",
              name: "Champions League",
              flag: "🇪🇺",
              color: "from-blue-600 to-blue-900",
              teams: 32,
            },
            {
              code: "PD",
              name: "La Liga",
              flag: "🇪🇸",
              color: "from-red-600 to-red-800",
              teams: 20,
            },
          ].map((league) => (
            <Link
              key={league.code}
              href={`/leagues/${league.code}`}
              className={`bg-linear-to-br ${league.color} text-white rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer`}
            >
              <div className="text-4xl mb-2">{league.flag}</div>
              <div className="font-bold text-lg">{league.name}</div>
              <div className="text-white/70 text-sm mt-1">
                {league.teams} ta club
              </div>
              <div className="mt-4 text-xs bg-white/20 inline-block px-3 py-1 rounded-full">
                Jadvalni ko'rish →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {liveMatches.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <h2 className="text-xl font-bold text-gray-900">
              Hozir O'ynalyapti
            </h2>
            <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
              {liveMatches.length} ta match
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMatches.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-500">
                    {match.competition.name}
                  </span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    JONLI
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    {match.homeTeam.crest && (
                      <Image
                        src={match.homeTeam.crest}
                        alt={match.homeTeam.name}
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    )}
                    <span className="text-xs font-semibold text-center text-gray-700">
                      {match.homeTeam.shortName}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-gray-900">
                      {match.score.fullTime.home ?? 0} —{" "}
                      {match.score.fullTime.away ?? 0}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    {match.awayTeam.crest && (
                      <Image
                        src={match.awayTeam.crest}
                        alt={match.awayTeam.name}
                        width={36}
                        height={36}
                        className="object-contain"
                      />
                    )}
                    <span className="text-xs font-semibold text-center text-gray-700">
                      {match.awayTeam.shortName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League Jadvali
            </h2>
            <Link
              href="/leagues/PL"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              To'liq jadval →
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {plStandings ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 w-8">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                      Club
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">
                      O
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">
                      G
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">
                      D
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">
                      M
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">
                      B
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {plStandings.table.slice(0, 8).map((row, i) => (
                    <tr
                      key={row.team.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                            i < 4
                              ? "bg-blue-100 text-blue-700"
                              : i === 4
                                ? "bg-orange-100 text-orange-700"
                                : i >= 17
                                  ? "bg-red-100 text-red-700"
                                  : "text-gray-500"
                          }`}
                        >
                          {row.position}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {row.team.crest && (
                            <Image
                              src={row.team.crest}
                              alt={row.team.name}
                              width={20}
                              height={20}
                              className="object-contain shrink-0"
                            />
                          )}
                          <Link
                            href={`/clubs/${row.team.id}`}
                            className="font-medium text-gray-800 hover:text-green-600 transition-colors"
                          >
                            {row.team.shortName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">
                        {row.playedGames}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">
                        {row.won}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">
                        {row.draw}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">
                        {row.lost}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-gray-900">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-400">
                Ma'lumot yuklanmadi
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Matches */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Yaqin Matchlar</h2>
            <Link
              href="/leagues/PL"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Hammasi →
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingPL.length > 0 ? (
              upcomingPL.map((match) => (
                <div
                  key={match.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="text-xs text-gray-400 mb-2">
                    {formatMatchDate(match.utcDate)}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      {match.homeTeam.crest && (
                        <Image
                          src={match.homeTeam.crest}
                          alt={match.homeTeam.name}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      )}
                      <span className="text-xs font-semibold text-gray-700 truncate">
                        {match.homeTeam.shortName}
                      </span>
                    </div>
                    <div className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-lg shrink-0">
                      {match.status === "FINISHED"
                        ? `${match.score.fullTime.home} - ${match.score.fullTime.away}`
                        : formatTimeOnly(match.utcDate)}
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-xs font-semibold text-gray-700 truncate text-right">
                        {match.awayTeam.shortName}
                      </span>
                      {match.awayTeam.crest && (
                        <Image
                          src={match.awayTeam.crest}
                          alt={match.awayTeam.name}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
                Yaqin orada match yo'q
              </div>
            )}
          </div>
        </div>
      </div>

      {clStandings && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              🇪🇺 Champions League Jadvali
            </h2>
            <Link
              href="/leagues/CL"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              To'liq jadval →
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 w-8">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Club
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">
                    O
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">
                    G
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">
                    D
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500">
                    M
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">
                    B
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clStandings.table.slice(0, 8).map((row, i) => (
                  <tr
                    key={row.team.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                          i < 8
                            ? "bg-blue-100 text-blue-700"
                            : i < 16
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {row.position}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {row.team.crest && (
                          <Image
                            src={row.team.crest}
                            alt={row.team.name}
                            width={20}
                            height={20}
                            className="object-contain shrink-0"
                          />
                        )}
                        <Link
                          href={`/clubs/${row.team.id}`}
                          className="font-medium text-gray-800 hover:text-green-600 transition-colors"
                        >
                          {row.team.shortName}
                        </Link>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {row.playedGames}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {row.won}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {row.draw}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {row.lost}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-gray-900">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
