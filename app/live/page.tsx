"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Match } from "@/lib/football-api";
import { getStatusColor, getStatusLabel, formatMatchDate } from "@/lib/utils";

export default function LivePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(60);

  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      const data = await res.json();
      setMatches(data.matches || []);
      setLastUpdated(new Date());
      setCountdown(60);
    } catch (e) {
      console.error("Live fetch error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh har 60 soniyada
  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 60000);
    return () => clearInterval(interval);
  }, [fetchLive]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 60));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // Ligalar bo'yicha guruhlash
  const grouped = matches.reduce(
    (acc, match) => {
      const key = match.competition?.name || "Boshqa";
      if (!acc[key])
        acc[key] = { matches: [], emblem: match.competition?.emblem };
      acc[key].matches.push(match);
      return acc;
    },
    {} as Record<string, { matches: Match[]; emblem?: string }>,
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <h1 className="text-3xl font-black text-gray-900">
              Jonli Natijalar
            </h1>
          </div>
          {lastUpdated && (
            <p className="text-sm text-gray-400 mt-1">
              Yangilandi: {lastUpdated.toLocaleTimeString("uz-UZ")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-green-500 animate-spin" />
            <span className="text-sm text-gray-500 font-medium">
              {countdown}s
            </span>
          </div>
          <button
            onClick={fetchLive}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            ↻ Yangilash
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <p className="text-gray-400">Jonli natijalar yuklanmoqda...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-16 text-center">
          <div className="text-6xl mb-4">😴</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            Hozir jonli match yo'q
          </h2>
          <p className="text-gray-400 text-sm">
            Barcha matchlar tugagan yoki hali boshlanmagan
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              href="/leagues/PL?tab=upcoming"
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              Kelayotgan matchlar
            </Link>
            <Link
              href="/leagues/PL?tab=results"
              className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              So'nggi natijalar
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Match count */}
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full">
              🔴 {matches.length} ta match jonli
            </span>
          </div>

          {/* Grouped by competition */}
          {Object.entries(grouped).map(
            ([compName, { matches: compMatches, emblem }]) => (
              <div key={compName}>
                {/* Competition header */}
                <div className="flex items-center gap-3 mb-4">
                  {emblem && (
                    <Image
                      src={emblem}
                      alt={compName}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  )}
                  <h2 className="font-bold text-gray-800">{compName}</h2>
                  <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                    {compMatches.length} ta jonli
                  </span>
                </div>

                <div className="space-y-3">
                  {compMatches.map((match) => (
                    <div
                      key={match.id}
                      className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 ring-1 ring-red-50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        {/* Home */}
                        <Link
                          href={`/clubs/${match.homeTeam.id}`}
                          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                        >
                          {match.homeTeam.crest && (
                            <Image
                              src={match.homeTeam.crest}
                              alt={match.homeTeam.name}
                              width={40}
                              height={40}
                              className="object-contain flex-shrink-0"
                            />
                          )}
                          <span className="font-bold text-gray-900 truncate">
                            {match.homeTeam.name}
                          </span>
                        </Link>

                        {/* Score */}
                        <div className="flex flex-col items-center flex-shrink-0 px-4">
                          <div className="text-3xl font-black text-gray-900 tabular-nums">
                            {match.score.fullTime.home ?? 0}
                            <span className="text-gray-300 mx-2">—</span>
                            {match.score.fullTime.away ?? 0}
                          </div>
                          <span
                            className={`text-xs font-bold px-3 py-0.5 rounded-full mt-1 ${getStatusColor(match.status)}`}
                          >
                            <span className="inline-block w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse" />
                            {getStatusLabel(match.status)}
                          </span>
                          {match.score.halfTime.home !== null && (
                            <span className="text-xs text-gray-400 mt-1">
                              Yarim vaqt: {match.score.halfTime.home}—
                              {match.score.halfTime.away}
                            </span>
                          )}
                        </div>

                        {/* Away */}
                        <Link
                          href={`/clubs/${match.awayTeam.id}`}
                          className="flex items-center gap-3 flex-1 min-w-0 justify-end hover:opacity-80 transition-opacity"
                        >
                          <span className="font-bold text-gray-900 truncate text-right">
                            {match.awayTeam.name}
                          </span>
                          {match.awayTeam.crest && (
                            <Image
                              src={match.awayTeam.crest}
                              alt={match.awayTeam.name}
                              width={40}
                              height={40}
                              className="object-contain flex-shrink-0"
                            />
                          )}
                        </Link>
                      </div>

                      <div className="mt-3 text-xs text-gray-400 text-center">
                        {formatMatchDate(match.utcDate)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
