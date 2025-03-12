import { Suspense } from "react";
import GamePageClient from "./GamePageClient";

interface PageProps {
  params: {
    gameId: string;
  };
}

export default async function GamePage({ params }: PageProps) {
  // Await params so that Next.js is satisfied with using them synchronously.
  const { gameId } = await Promise.resolve(params);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GamePageClient gameId={gameId} />
    </Suspense>
  );
}