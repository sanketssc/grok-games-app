// components/Header.tsx or app/layout.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode and persist in localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedMode);
    document.documentElement.classList.toggle("dark", savedMode);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    document.documentElement.classList.toggle("dark", newMode);
  };

  return (
    <header className="header bg-gray-200 dark:bg-gray-800 text-black dark:text-white p-4 flex justify-between items-center">
      <nav>
        <Link href="/" className="mr-4 hover:underline">
          Home
        </Link>
        <Link href="/about" className="mr-4 hover:underline">
          About
        </Link>
        {/* Removed individual game links */}
      </nav>
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
      >
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </button>
    </header>
  );
}
