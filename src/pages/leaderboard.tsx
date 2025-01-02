import { Card } from "@/components/ui/card";
import Header from "@/components/Header";

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Leaderboard</h1>
        <Card className="p-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              Leaderboard is coming soon! Stay tuned for updates.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Track your progress and compete with other players.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}