import Image from "next/image";
import Link from "next/link";
import { Standing } from "@/lib/football-api";
import { getFormColor } from "@/lib/utils";

interface StandingsTableProps {
  table: Standing[];
  leagueCode: string;
}

function getPositionStyle(position: number, leagueCode: string): string {
  if (leagueCode === "CL") {
    if (position <= 8) return "bg-blue-100 text-blue-700";
    if (position <= 16) return "bg-orange-100 text-orange-700";
    if (position <= 24) return "bg-red-100 text-red-600";
    return "text-gray-500";
  }
  // PL, PD
  if (position <= 4) return "bg-blue-100 text-blue-700";
  if (position === 5) return "bg-orange-100 text-orange-700";
  if (position === 6) return "bg-green-100 text-green-700";
  if (position >= 18) return "bg-red-100 text-red-600";
  return "text-gray-500";
}

export default function StandingsTable({
  table,
  leagueCode,
}: StandingsTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 w-10">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                Club
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 hidden sm:table-cell">
                O'ynagan
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
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 hidden md:table-cell">
                Gol
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 hidden md:table-cell">
                +/-
              </th>
              <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">
                Ball
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 hidden lg:table-cell">
                Forma
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {table.map((row) => (
              <tr
                key={row.team.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${getPositionStyle(row.position, leagueCode)}`}
                  >
                    {row.position}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {row.team.crest && (
                      <Image
                        src={row.team.crest}
                        alt={row.team.name}
                        width={24}
                        height={24}
                        className="object-contain flex-shrink-0"
                      />
                    )}
                    <Link
                      href={`/clubs/${row.team.id}`}
                      className="font-medium text-gray-800 hover:text-green-600 transition-colors whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">{row.team.name}</span>
                      <span className="sm:hidden">
                        {row.team.shortName || row.team.tla}
                      </span>
                    </Link>
                  </div>
                </td>
                <td className="px-3 py-3 text-center text-gray-600 hidden sm:table-cell">
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
                <td className="px-3 py-3 text-center text-gray-600 hidden md:table-cell">
                  {row.goalsFor}:{row.goalsAgainst}
                </td>
                <td
                  className={`px-3 py-3 text-center font-medium hidden md:table-cell ${row.goalDifference > 0 ? "text-green-600" : row.goalDifference < 0 ? "text-red-500" : "text-gray-500"}`}
                >
                  {row.goalDifference > 0
                    ? `+${row.goalDifference}`
                    : row.goalDifference}
                </td>
                <td className="px-3 py-3 text-center font-black text-gray-900">
                  {row.points}
                </td>
                <td className="px-3 py-3 hidden lg:table-cell">
                  {row.form && (
                    <div className="flex gap-1 justify-center">
                      {row.form
                        .split(",")
                        .slice(-5)
                        .map((f, i) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${getFormColor(f)}`}
                          >
                            {f}
                          </span>
                        ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
        {leagueCode !== "CL" ? (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-100" /> Champions
              League
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-100" /> Europa
              League
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-100" /> Conference
              League
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-100" /> Tushish
              zonasi
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-100" /> Playoff
              bosqichi
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-100" /> Playoff
              raundi
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-100" /> Chiqib ketish
            </span>
          </>
        )}
      </div>
    </div>
  );
}
