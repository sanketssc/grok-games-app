// app/about/page.tsx
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">About Us</h1>
        <p className="text-lg mb-4">
          Welcome to Invok3r Games, your ultimate destination for classic arcade
          games! We’re passionate about preserving the nostalgia and excitement
          of timeless games like Pac-Man, Breakout, and Classic 1942, bringing
          them to life in your browser with a modern twist.
        </p>
        <p className="text-lg mb-4">
          Our mission is to provide an immersive gaming experience that evokes
          the golden era of arcades while offering a seamless, accessible
          platform for players of all ages. Whether you’re reliving childhood
          memories or discovering these classics for the first time, Invok3r
          Games is here to entertain and inspire.
        </p>
        <h2 className="text-2xl font-semibold mb-4 mt-8">Our Story</h2>
        <p className="text-lg mb-4">
          Invok3r Games was founded by a passionate gamer who grew up playing
          arcade games in dimly lit arcades. Inspired by the simplicity and joy
          of those experiences, I set out to create a digital hub where anyone
          can enjoy these iconic games anytime, anywhere. Launched in 2023,
          we’ve been expanding our library and enhancing gameplay to keep the
          retro spirit alive.
        </p>
        <h2 className="text-2xl font-semibold mb-4 mt-8">Our Team</h2>
        <p className="text-lg mb-4">
          I’m the sole developer behind Invok3r Games, dedicated to creating and
          maintaining this nostalgic gaming platform. Meet the creator:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li className="text-lg">
            <strong>Sanket Choudhari</strong> - Developer
            <br />
            <Link
              href="https://github.com/sanketssc"
              className="text-blue-400 hover:underline"
              target="_blank"
            >
              GitHub
            </Link>{" "}
            |
            <Link
              href="https://x.com/sanketssc"
              className="text-blue-400 hover:underline"
              target="_blank"
            >
              X
            </Link>
          </li>
        </ul>
        <h2 className="text-2xl font-semibold mb-4 mt-8">Get Involved</h2>
        <p className="text-lg mb-4">
          Love Invok3r Games? We’d love to hear from you! Whether you have
          suggestions for new games, want to contribute, or just want to share
          your high scores, feel free to reach out via our{" "}
          <Link href="/contact" className="text-blue-400 hover:underline">
            contact page
          </Link>{" "}
          (coming soon!) or follow us on social media.
        </p>
        <p className="text-lg mb-4">
          Thank you for joining us on this nostalgic journey—let’s keep the
          arcade spirit alive together!
        </p>
      </div>
    </div>
  );
}
