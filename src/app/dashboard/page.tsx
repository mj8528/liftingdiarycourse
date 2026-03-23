import { Dumbbell, Plus } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "./date-picker";
import { getWorkoutsForDate } from "@/data/workouts";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ? new Date(dateParam) : new Date();

  const workouts = await getWorkoutsForDate(date);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workout Diary</h1>
          <p className="text-sm text-zinc-400 mt-1">View your logged workouts by date.</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <DatePicker selected={date} />
          <Button
            render={<Link href={`/dashboard/log?date=${format(date, "yyyy-MM-dd")}`} />}
            nativeButton={false}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Log Workout
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest">
            Workouts — {format(date, "EEEE")}
          </h2>

          {workouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 py-16 text-zinc-500">
              <Dumbbell className="h-8 w-8 mb-3" />
              <p className="text-sm">No workouts logged for this date.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.map((workout) => (
                <Card key={workout.id} className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-1 pt-4 px-5">
                    <CardTitle className="text-base font-semibold text-zinc-50">
                      {workout.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-4 space-y-3">
                    {workout.exercises.map((exercise) => (
                      <div key={exercise.id}>
                        <div className="flex items-center gap-2 text-sm text-zinc-300 mb-1">
                          <Dumbbell className="h-4 w-4 text-zinc-400" />
                          {exercise.name}
                        </div>
                        <div className="flex flex-wrap gap-2 pl-6">
                          {exercise.sets.map((set) => (
                            <span
                              key={set.id}
                              className="text-xs bg-zinc-800 text-zinc-300 rounded px-2 py-1"
                            >
                              {set.reps != null ? `${set.reps} reps` : "—"}
                              {set.weightKg != null ? ` @ ${set.weightKg} kg` : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
