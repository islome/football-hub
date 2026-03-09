"use client";

import { useState } from "react";

interface PlayerAvatarProps {
  playerId: number;
  name: string;
  avatarBg: string;
  shirtNumber?: number;
}

export default function PlayerAvatar({
  playerId,
  name,
  avatarBg,
  shirtNumber,
}: PlayerAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Transfermarkt CDN — ba'zi o'yinchilar uchun ishlashi mumkin
  const imgUrl = `https://img.a.transfermarkt.technology/portrait/header/${playerId}.jpg`;

  return (
    <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex-shrink-0">
      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-2xl shadow-lg"
        />
      ) : (
        /* Fallback — chiroyli SVG silhouette + shirt number */
        <div
          className={`w-full h-full rounded-2xl bg-gradient-to-br ${avatarBg} shadow-lg flex flex-col items-center justify-center relative overflow-hidden`}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-2 w-16 h-16 rounded-full border-2 border-white" />
            <div className="absolute bottom-2 left-2 w-10 h-10 rounded-full border-2 border-white" />
          </div>

          {/* Shirt number */}
          {shirtNumber && (
            <div className="absolute top-2 right-3 text-white/40 font-black text-4xl leading-none select-none">
              {shirtNumber}
            </div>
          )}

          {/* SVG Player Silhouette */}
          <svg
            viewBox="0 0 100 100"
            className="w-24 h-24 text-white/80"
            fill="currentColor"
          >
            {/* Head */}
            <circle cx="50" cy="28" r="14" />
            {/* Body / Jersey */}
            <path d="M28 55 C28 45 35 40 50 40 C65 40 72 45 72 55 L72 78 C72 80 70 82 68 82 L32 82 C30 82 28 80 28 78 Z" />
            {/* Left arm */}
            <path d="M28 55 C22 52 18 56 18 62 L20 72 C20 74 22 74 24 72 L28 62 Z" />
            {/* Right arm */}
            <path d="M72 55 C78 52 82 56 82 62 L80 72 C80 74 78 74 76 72 L72 62 Z" />
            {/* Legs */}
            <path d="M38 82 L35 100 L45 100 L50 88 L55 100 L65 100 L62 82 Z" />
          </svg>

          {/* Name initials at bottom */}
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <span className="text-white/60 text-xs font-bold tracking-widest uppercase">
              {name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
