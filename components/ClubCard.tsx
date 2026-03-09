import Image from "next/image";
import Link from "next/link";
import { Team } from "@/lib/football-api";

interface ClubCardProps {
  team: Team;
  leagueCode?: string;
}

export default function ClubCard({ team, leagueCode }: ClubCardProps) {
  return (
    <Link
      href={`/clubs/${team.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center gap-3 hover:shadow-md hover:border-green-200 hover:-translate-y-1 transition-all group"
    >
      <div className="w-20 h-20 flex items-center justify-center">
        {team.crest ? (
          <Image
            src={team.crest}
            alt={team.name}
            width={80}
            height={80}
            className="object-contain group-hover:scale-110 transition-transform"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-black text-gray-400">
            {team.tla || team.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="font-bold text-gray-900 text-sm group-hover:text-green-600 transition-colors">
          {team.name}
        </div>
        {team.tla && (
          <div className="text-xs text-gray-400 mt-0.5 font-mono">
            {team.tla}
          </div>
        )}
      </div>
      {team.venue && (
        <div className="text-xs text-gray-400 text-center truncate w-full px-2">
          🏟 {team.venue}
        </div>
      )}
      {team.founded && (
        <div className="text-xs text-gray-400">est. {team.founded}</div>
      )}
    </Link>
  );
}
