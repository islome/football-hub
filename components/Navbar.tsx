"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Bosh sahifa", href: "/" },
  {
    label: "Ligalar",
    href: "#",
    children: [
      { label: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League", href: "/leagues/PL" },
      { label: "🇪🇺 Champions League", href: "/leagues/CL" },
      { label: "🇪🇸 La Liga", href: "/leagues/PD" },
    ],
  },
  { label: "Clublar", href: "/clubs" },
  { label: "🔴 Jonli", href: "/live" },
];

const POPULAR_CLUBS = [
  {
    id: 57,
    name: "Arsenal",
    tla: "ARS",
    crest: "https://crests.football-data.org/57.png",
  },
  {
    id: 61,
    name: "Chelsea",
    tla: "CHE",
    crest: "https://crests.football-data.org/61.png",
  },
  {
    id: 64,
    name: "Liverpool",
    tla: "LIV",
    crest: "https://crests.football-data.org/64.png",
  },
  {
    id: 65,
    name: "Manchester City",
    tla: "MCI",
    crest: "https://crests.football-data.org/65.png",
  },
  {
    id: 66,
    name: "Manchester Utd",
    tla: "MUN",
    crest: "https://crests.football-data.org/66.png",
  },
  {
    id: 73,
    name: "Tottenham",
    tla: "TOT",
    crest: "https://crests.football-data.org/73.png",
  },
  {
    id: 86,
    name: "Real Madrid",
    tla: "RMA",
    crest: "https://crests.football-data.org/86.png",
  },
  {
    id: 81,
    name: "Barcelona",
    tla: "BAR",
    crest: "https://crests.football-data.org/81.png",
  },
  {
    id: 78,
    name: "Atletico Madrid",
    tla: "ATM",
    crest: "https://crests.football-data.org/78.png",
  },
  {
    id: 5,
    name: "Bayern Munich",
    tla: "BAY",
    crest: "https://crests.football-data.org/5.png",
  },
  {
    id: 109,
    name: "Juventus",
    tla: "JUV",
    crest: "https://crests.football-data.org/109.png",
  },
  {
    id: 98,
    name: "AC Milan",
    tla: "MIL",
    crest: "https://crests.football-data.org/98.png",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    if (searchOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [searchOpen]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSearchOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const filtered =
    searchQuery.trim().length > 0
      ? POPULAR_CLUBS.filter(
          (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.tla.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : POPULAR_CLUBS;

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-gray-900 flex-shrink-0"
            >
              <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-black tracking-tight">
                FOOTBALL
              </span>
              <span className="text-green-600">Hub</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <div key={link.label} className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      {link.label}
                      <svg
                        className={cn(
                          "w-4 h-4 transition-transform",
                          dropdownOpen && "rotate-180",
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {dropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-green-50 text-green-700 font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                      link.href === "/live" &&
                        "text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold",
                    )}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>

            {/* Right: Search + Mobile toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-600 transition-all text-sm bg-gray-50 hover:bg-green-50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="hidden sm:inline text-xs">Qidirish...</span>
                <span className="hidden sm:inline text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                  ⌘K
                </span>
              </button>

              <button
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
              <Link
                href="/"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                Bosh sahifa
              </Link>
              <div className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Ligalar
              </div>
              <Link
                href="/leagues/PL"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg pl-6"
                onClick={() => setMobileOpen(false)}
              >
                🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League
              </Link>
              <Link
                href="/leagues/CL"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg pl-6"
                onClick={() => setMobileOpen(false)}
              >
                🇪🇺 Champions League
              </Link>
              <Link
                href="/leagues/PD"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg pl-6"
                onClick={() => setMobileOpen(false)}
              >
                🇪🇸 La Liga
              </Link>
              <Link
                href="/clubs"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                Clublar
              </Link>
              <Link
                href="/live"
                className="block px-4 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                🔴 Jonli
              </Link>

              {/* Mobile Search */}
              <div className="px-3 pt-2">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setSearchOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-400 bg-gray-50 text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Club qidirish...
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Club Flags Strip (Navbar osti) ── */}
        <div className="border-t border-gray-100 bg-gray-50 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 py-1.5">
              {POPULAR_CLUBS.map((club) => (
                <Link
                  key={club.id}
                  href={`/clubs/${club.id}`}
                  title={club.name}
                  className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all group"
                >
                  <Image
                    src={club.crest}
                    alt={club.name}
                    width={24}
                    height={24}
                    className="object-contain group-hover:scale-125 transition-transform"
                  />
                  <span
                    className="text-gray-400 group-hover:text-green-600 transition-colors font-mono"
                    style={{ fontSize: "9px" }}
                  >
                    {club.tla}
                  </span>
                </Link>
              ))}
              <Link
                href="/clubs"
                className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white hover:shadow-sm transition-all group ml-1 border-l border-gray-200 pl-4"
              >
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <span
                  className="text-gray-400 group-hover:text-green-600 transition-colors"
                  style={{ fontSize: "9px" }}
                >
                  Barchasi
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Search Modal ── */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-start justify-center pt-20 px-4">
          <div
            ref={searchRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Club nomi yoki qisqartma (ARS, MCI...)"
                className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
              <kbd className="hidden sm:block text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded font-mono">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {filtered.length > 0 ? (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                    {searchQuery
                      ? `"${searchQuery}" natijalari`
                      : "Mashhur Clublar"}
                  </div>
                  {filtered.map((club) => (
                    <Link
                      key={club.id}
                      href={`/clubs/${club.id}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-green-50 transition-colors group border-b border-gray-50 last:border-0"
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl flex-shrink-0">
                        <Image
                          src={club.crest}
                          alt={club.name}
                          width={32}
                          height={32}
                          className="object-contain group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
                          {club.name}
                        </div>
                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                          {club.tla}
                        </div>
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  ))}
                </>
              ) : (
                <div className="px-4 py-12 text-center text-gray-400">
                  <div className="text-4xl mb-3">🔍</div>
                  <div className="text-sm font-medium">
                    "{searchQuery}" topilmadi
                  </div>
                  <div className="text-xs mt-1">
                    Boshqa nom yoki qisqartma bilan urinib ko'ring
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Barcha clublarni ko'rish uchun
              </span>
              <Link
                href="/clubs"
                onClick={() => setSearchOpen(false)}
                className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
              >
                Clublar sahifasi →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
