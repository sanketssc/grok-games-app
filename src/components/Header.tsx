"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-blue-600 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Games App
        </Link>
        <div className="space-x-4">
          <Link
            href="/games"
            className={`hover:text-blue-200 ${
              pathname === "/games" ? "underline" : ""
            }`}
          >
            Games
          </Link>
          <Link
            href="/games/breakout"
            className={`hover:text-blue-200 ${
              pathname === "/games/breakout" ? "underline" : ""
            }`}
          >
            Breakout
          </Link>
          <Link
            href="/games/classic1942"
            className={`hover:text-blue-200 ${
              pathname === "/games/classic1942" ? "underline" : ""
            }`}
          >
            Classic 1942
          </Link>
          <Link
            href="/games/pacman"
            className={`hover:text-blue-200 ${
              pathname === "/games/pacman" ? "underline" : ""
            }`}
          >
            Pac-Man
          </Link>
        </div>
      </nav>
    </header>
  );
}
