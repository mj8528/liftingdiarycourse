export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getWorkoutById, getExercises } from "@/data/workouts";
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

  const [workout, exerciseOptions] = await Promise.all([
    getWorkoutById(id),
    getExercises(),
  ]);

  if (!workout) notFound();

  const dateStr = format(workout.startedAt, "yyyy-MM-dd");

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
            <h1 className="text-2xl font-semibold tracking-tight">Log Workout</h1>
            <p className="text-sm text-muted-foreground mt-1">{formatDate(workout.startedAt)}</p>
          </div>
        </div>

        <EditWorkoutForm workout={workout} date={dateStr} exerciseOptions={exerciseOptions.map((e) => e.name)} />
      </div>
    </div>
  );
}
