export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getWorkoutById } from "@/data/workouts";
import { formatDate } from "@/lib/format-date";
import { EditWorkoutForm } from "./edit-workout-form";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  const id = parseInt(workoutId);

  if (isNaN(id)) notFound();

  const workout = await getWorkoutById(id);

  if (!workout) notFound();

  const dateStr = format(workout.startedAt, "yyyy-MM-dd");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard?date=${dateStr}`}
            className="inline-flex items-center justify-center size-8 rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-muted transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit Workout</h1>
            <p className="text-sm text-zinc-400 mt-1">{formatDate(workout.startedAt)}</p>
          </div>
        </div>

        <EditWorkoutForm workout={workout} date={dateStr} />
      </div>
    </div>
  );
}
