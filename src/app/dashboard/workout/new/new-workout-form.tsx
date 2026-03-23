"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { newWorkout } from "./actions";

type SetEntry = { reps: string; weight: string };
type ExerciseEntry = { name: string; sets: SetEntry[] };

function emptyExercise(): ExerciseEntry {
  return { name: "", sets: [{ reps: "", weight: "" }] };
}

export function NewWorkoutForm({ date }: { date: string }) {
  const router = useRouter();
  const [exercises, setExercises] = useState<ExerciseEntry[]>([emptyExercise()]);
  const [isPending, startTransition] = useTransition();

  function addExercise() {
    setExercises((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(ei: number) {
    setExercises((prev) => prev.filter((_, i) => i !== ei));
  }

  function updateExerciseName(ei: number, name: string) {
    setExercises((prev) => prev.map((ex, i) => (i === ei ? { ...ex, name } : ex)));
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
          ? { ...ex, sets: ex.sets.map((s, j) => (j === si ? { ...s, [field]: value } : s)) }
          : ex
      )
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;

    startTransition(async () => {
      const result = await newWorkout({
        name,
        date,
        exercises: exercises.map((ex, ei) => ({
          name: ex.name,
          order: ei,
          sets: ex.sets.map((s, si) => ({
            setNumber: si + 1,
            reps: s.reps ? parseInt(s.reps) : null,
            weightKg: s.weight || null,
          })),
        })),
      });
      router.push(`/dashboard?date=${result.date}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-zinc-300">
          Workout Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Push Day, Leg Day…"
          required
          className="bg-zinc-900 border-zinc-700 text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-zinc-500"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Exercises</h2>

        {exercises.map((ex, ei) => (
          <div key={ei} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Input
                value={ex.name}
                onChange={(e) => updateExerciseName(ei, e.target.value)}
                placeholder="Exercise name"
                required
                className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-zinc-500"
              />
              {exercises.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExercise(ei)}
                  className="shrink-0 text-zinc-500 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2 pl-1">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs text-zinc-500 px-1">
                <span>Reps</span>
                <span>Weight (kg)</span>
                <span />
              </div>

              {ex.sets.map((set, si) => (
                <div key={si} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <Input
                    value={set.reps}
                    onChange={(e) => updateSet(ei, si, "reps", e.target.value)}
                    type="number"
                    min="0"
                    placeholder="—"
                    className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-500 h-8 text-sm"
                  />
                  <Input
                    value={set.weight}
                    onChange={(e) => updateSet(ei, si, "weight", e.target.value)}
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="—"
                    className="bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-zinc-500 h-8 text-sm"
                  />
                  {ex.sets.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSet(ei, si)}
                      className="h-8 w-8 text-zinc-600 hover:text-red-400"
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
                className="h-7 text-xs text-zinc-500 hover:text-zinc-300 gap-1.5 px-1"
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
          className="w-full border-dashed border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 gap-2"
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
