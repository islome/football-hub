import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xl mb-3">
              <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-black">
                FOOTBALL
              </span>
              <span className="text-green-600">Hub</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Premier League, Champions League va La Liga bo'yicha jonli
              natijalar, jadvallar va statistika.
            </p>
          </div>

          {/* Ligalar */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
              Ligalar
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/leagues/PL"
                  className="text-sm text-gray-500 hover:text-green-600 transition-colors"
                >
                  🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League
                </Link>
              </li>
              <li>
                <Link
                  href="/leagues/CL"
                  className="text-sm text-gray-500 hover:text-green-600 transition-colors"
                >
                  🇪🇺 Champions League
                </Link>
              </li>
              <li>
                <Link
                  href="/leagues/PD"
                  className="text-sm text-gray-500 hover:text-green-600 transition-colors"
                >
                  🇪🇸 La Liga
                </Link>
              </li>
            </ul>
          </div>

          {/* Sahifalar */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
              Sahifalar
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/clubs"
                  className="text-sm text-gray-500 hover:text-green-600 transition-colors"
                >
                  Barcha Clublar
                </Link>
              </li>
              <li>
                <Link
                  href="/live"
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  🔴 Jonli Natijalar
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-400">
            © 2025 FootballHub. Ma'lumotlar: football-data.org
          </p>
          <p className="text-xs text-gray-400">Barcha huquqlar himoyalangan</p>
        </div>
      </div>
    </footer>
  );
}
