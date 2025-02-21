import Classic1942 from "@/components/games/Classic1942";

export default function Classic1942Page() {
  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Classic 1942</h1>
        <Classic1942 />
      </div>
    </div>
  );
}
