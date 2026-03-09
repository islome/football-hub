import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl mb-6">⚽</div>
      <h1 className="text-4xl font-black text-gray-900 mb-3">404</h1>
      <p className="text-xl font-semibold text-gray-700 mb-2">
        Sahifa topilmadi
      </p>
      <p className="text-gray-400 mb-8 max-w-sm">
        Siz izlagan sahifa mavjud emas yoki o'chirilgan bo'lishi mumkin.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Bosh sahifaga qaytish
        </Link>
        <Link
          href="/live"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Jonli natijalar
        </Link>
      </div>
    </div>
  );
}
