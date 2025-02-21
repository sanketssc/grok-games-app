import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Games App</h1>
      <p className="text-xl mb-8">Enjoy our collection of fun browser games!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <Link
          href="/games/breakout"
          className="bg-blue-500 text-white p-6 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <h2 className="text-2xl font-semibold">Breakout</h2>
          <p>Classic brick-breaking action</p>
        </Link>
        <Link
          href="/games/classic1942"
          className="bg-blue-500 text-white p-6 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <h2 className="text-2xl font-semibold">Classic 1942</h2>
          <p>Endless airplane shooter</p>
        </Link>
      </div>
      <Link
        href="/games"
        className="mt-8 inline-block text-blue-600 hover:underline"
      >
        View All Games →
      </Link>
    </div>
  );
}
