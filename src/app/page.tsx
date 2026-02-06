import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center p-4">
      <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Habit Tracker & Life OS</h1>
      <p className="text-xl text-muted-foreground max-w-[600px]">
        Master your life, one habit at a time. Track your habits, finance, and fitness in one place.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/dashboard">Enter Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
