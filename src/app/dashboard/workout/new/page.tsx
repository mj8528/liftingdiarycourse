export const dynamic = "force-dynamic";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { NewWorkoutForm } from "./new-workout-form";
import { formatDate } from "@/lib/format-date";

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ? new Date(dateParam) : new Date();
  const dateStr = format(date, "yyyy-MM-dd");

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard?date=${dateStr}`}
            className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New Workout</h1>
            <p className="text-sm text-muted-foreground mt-1">{formatDate(date)}</p>
          </div>
        </div>

        <NewWorkoutForm date={dateStr} />
      </div>
    </div>
  );
}
