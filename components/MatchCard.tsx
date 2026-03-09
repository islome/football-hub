"use client";

import Image from "next/image";
import Link from "next/link";
import { Match } from "@/lib/football-api";
import {
  formatMatchDate,
  formatTimeOnly,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";

interface MatchCardProps {
  match: Match;
  showCompetition?: boolean;
}

export default function MatchCard({
  match,
  showCompetition = false,
}: MatchCardProps) {
  const isLive = match.status === "IN_PLAY" || match.status === "LIVE";
  const isFinished = match.status === "FINISHED";

  return (
    <Link
      href={`/matches/${match.id}`}
      className={`block bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all ${
        isLive
          ? "border-red-200 ring-1 ring-red-100"
          : "border-gray-100 hover:border-green-200"
      }`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {showCompetition && match.competition?.emblem && (
            <Image
              src={match.competition.emblem}
              alt={match.competition.name}
              width={16}
              height={16}
              className="object-contain"
            />
          )}
          <span className="text-xs text-gray-400">
            {showCompetition
              ? match.competition?.name
              : `${match.matchday ?? ""}-hafta`}
          </span>
        </div>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(match.status)}`}
        >
          {isLive && (
            <span className="inline-block w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse" />
          )}
          {getStatusLabel(match.status)}
        </span>
      </div>

      {/* Teams + Score */}
      <div className="flex items-center justify-between gap-3">
        {/* Home */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {match.homeTeam.crest ? (
            <Image
              src={match.homeTeam.crest}
              alt={match.homeTeam.name}
              width={44}
              height={44}
              className="object-contain"
            />
          ) : (
            <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center text-xs font-black text-gray-500">
              {match.homeTeam.tla}
            </div>
          )}
          <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
            {match.homeTeam.shortName || match.homeTeam.name}
          </span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center shrink-0">
          {isFinished || isLive ? (
            <div className="text-3xl font-black text-gray-900 tabular-nums">
              {match.score.fullTime.home ?? 0}
              <span className="text-gray-300 mx-1">-</span>
              {match.score.fullTime.away ?? 0}
            </div>
          ) : (
            <div className="text-center">
              <div className="text-xl font-black text-gray-400">VS</div>
              <div className="text-xs text-gray-500 mt-1">
                {formatTimeOnly(match.utcDate)}
              </div>
            </div>
          )}
          {isLive && (
            <span className="text-xs text-red-500 font-semibold mt-1 animate-pulse">
              ● Jonli
            </span>
          )}
          {isFinished && match.score.halfTime.home !== null && (
            <span className="text-xs text-gray-400 mt-1">
              ({match.score.halfTime.home}—{match.score.halfTime.away})
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {match.awayTeam.crest ? (
            <Image
              src={match.awayTeam.crest}
              alt={match.awayTeam.name}
              width={44}
              height={44}
              className="object-contain"
            />
          ) : (
            <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center text-xs font-black text-gray-500">
              {match.awayTeam.tla}
            </div>
          )}
          <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
            {match.awayTeam.shortName || match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Date + click hint */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {formatMatchDate(match.utcDate)}
        </span>
        <span className="text-xs text-green-500 font-medium opacity-0 group-hover:opacity-100">
          Batafsil →
        </span>
      </div>
    </Link>
  );
}
