import PacManGame from "@/components/games/PacManGame";

export default function PacManPage() {
  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Pac-Man</h1>
        <PacManGame />
      </div>
    </div>
  );
}
