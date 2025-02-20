import BreakoutGame from "@/components/games/BreakoutGame";

export default function BreakoutPage() {
  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Breakout</h1>
        <BreakoutGame />
      </div>
    </div>
  );
}
