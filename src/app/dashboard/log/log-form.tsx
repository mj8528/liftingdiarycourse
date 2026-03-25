"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logWorkout } from "./actions";

type SetEntry = { reps: string; weight: string };
type ExerciseEntry = { name: string; sets: SetEntry[] };

function emptyExercise(): ExerciseEntry {
  return { name: "", sets: [{ reps: "", weight: "" }] };
}

export function LogForm({ date }: { date: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [exercises, setExercises] = useState<ExerciseEntry[]>([emptyExercise()]);

  function addExercise() {
    setExercises((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(ei: number) {
    setExercises((prev) => prev.filter((_, i) => i !== ei));
  }

  function updateExerciseName(ei: number, name: string) {
    setExercises((prev) =>
      prev.map((ex, i) => (i === ei ? { ...ex, name } : ex))
    );
  }

  function addSet(ei: number) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === ei ? { ...ex, sets: [...ex.sets, { reps: "", weight: "" }] } : ex
      )
    );
  }

  function removeSet(ei: number, si: number) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === ei ? { ...ex, sets: ex.sets.filter((_, j) => j !== si) } : ex
      )
    );
  }

  function updateSet(ei: number, si: number, field: keyof SetEntry, value: string) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === ei
          ? {
              ...ex,
              sets: ex.sets.map((s, j) =>
                j === si ? { ...s, [field]: value } : s
              ),
            }
          : ex
      )
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await logWorkout(formData);
      router.push(`/dashboard?date=${result.date}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="date" value={date} />

      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-foreground">
          Workout Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Push Day, Leg Day…"
          required
          className="bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          Exercises
        </h2>

        {exercises.map((ex, ei) => (
          <div key={ei} className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Input
                name="exerciseName"
                value={ex.name}
                onChange={(e) => updateExerciseName(ei, e.target.value)}
                placeholder="Exercise name"
                required
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
              />
              {exercises.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExercise(ei)}
                  className="shrink-0 text-muted-foreground hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2 pl-1">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs text-muted-foreground px-1">
                <span>Reps</span>
                <span>Weight (kg)</span>
                <span />
              </div>

              {ex.sets.map((set, si) => (
                <div key={si} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <Input
                    name={`reps_${ei}`}
                    value={set.reps}
                    onChange={(e) => updateSet(ei, si, "reps", e.target.value)}
                    type="number"
                    min="0"
                    placeholder="—"
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-8 text-sm"
                  />
                  <Input
                    name={`weight_${ei}`}
                    value={set.weight}
                    onChange={(e) => updateSet(ei, si, "weight", e.target.value)}
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="—"
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-8 text-sm"
                  />
                  {ex.sets.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSet(ei, si)}
                      className="h-8 w-8 text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <div className="h-8 w-8" />
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addSet(ei)}
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5 px-1"
              >
                <Plus className="h-3 w-3" />
                Add set
              </Button>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addExercise}
          className="w-full border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-muted gap-2"
        >
          <Plus className="h-4 w-4" />
          Add exercise
        </Button>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving…" : "Save Workout"}
      </Button>
    </form>
  );
}
