import Link from "next/link";

export default function GamesPage() {
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">All Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/games/breakout"
          className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-700 transition-shadow transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Breakout</h2>
          <p className="text-gray-300">Classic brick-breaking game</p>
        </Link>
        <Link
          href="/games/classic1942"
          className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-700 transition-shadow transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Classic 1942</h2>
          <p className="text-gray-300">Endless airplane shooter</p>
        </Link>
        <Link
          href="/games/pacman"
          className="bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-700 transition-shadow transition-colors"
        >
          <h2 className="text-xl font-semibold mb-2">Pac-Man</h2>
          <p className="text-gray-300">Classic maze chase game</p>
        </Link>
      </div>
    </div>
  );
}
