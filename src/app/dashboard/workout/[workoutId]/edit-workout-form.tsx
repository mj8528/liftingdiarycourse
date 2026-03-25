"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { editWorkout } from "./actions";
import type { WorkoutDetail } from "@/data/workouts";

type SetEntry = { reps: string; weight: string };
type ExerciseEntry = { name: string; sets: SetEntry[] };

function toFormExercises(workout: WorkoutDetail): ExerciseEntry[] {
  return workout.exercises.map((ex) => ({
    name: ex.name,
    sets: ex.sets.map((s) => ({
      reps: s.reps != null ? String(s.reps) : "",
      weight: s.weightKg ?? "",
    })),
  }));
}

export function EditWorkoutForm({
  workout,
  date,
  exerciseOptions,
}: {
  workout: WorkoutDetail;
  date: string;
  exerciseOptions: string[];
}) {
  const router = useRouter();
  const [exercises, setExercises] = useState<ExerciseEntry[]>(() => toFormExercises(workout));
  const [isPending, startTransition] = useTransition();

  function addExercise() {
    setExercises((prev) => [...prev, { name: "", sets: [{ reps: "", weight: "" }] }]);
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
      const result = await editWorkout({
        workoutId: workout.id,
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
        <Label htmlFor="name" className="text-foreground">
          Workout Name
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={workout.name}
          placeholder="e.g. Push Day, Leg Day…"
          required
          className="bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Exercises</h2>

        {exercises.map((ex, ei) => {
          const isOther = ex.name !== "" && !exerciseOptions.includes(ex.name);
          const selectValue = isOther ? "other" : ex.name;

          return (
            <div key={ei} className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-2">
                  <Select
                    value={selectValue || undefined}
                    onValueChange={(val) => {
                      if (!val) return;
                      if (val === "other") {
                        updateExerciseName(ei, "other");
                      } else {
                        updateExerciseName(ei, val);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-muted border-border text-foreground focus:ring-ring font-medium">
                      <SelectValue placeholder="Select exercise…" />
                    </SelectTrigger>
                    <SelectContent>
                      {exerciseOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  {(selectValue === "other" || isOther) && (
                    <Input
                      value={ex.name === "other" ? "" : ex.name}
                      onChange={(e) => updateExerciseName(ei, e.target.value)}
                      placeholder="Enter exercise name…"
                      required
                      autoFocus
                      className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                    />
                  )}
                </div>

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

              <div className="space-y-2">
                <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 text-xs text-muted-foreground px-1">
                  <span>#</span>
                  <span>Reps</span>
                  <span>Weight (kg)</span>
                  <span />
                </div>

                {ex.sets.map((set, si) => {
                  const isLogged = set.reps !== "" && set.weight !== "";
                  return (
                    <div
                      key={si}
                      className={`grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 items-center rounded-lg px-1 py-0.5 transition-colors ${
                        isLogged ? "bg-green-950/30 border-l-2 border-green-500" : ""
                      }`}
                    >
                      <span className="text-xs text-muted-foreground font-mono text-center">{si + 1}</span>
                      <Input
                        value={set.reps}
                        onChange={(e) => updateSet(ei, si, "reps", e.target.value)}
                        type="number"
                        min="0"
                        placeholder="—"
                        className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-8 text-sm"
                      />
                      <Input
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
                  );
                })}

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
          );
        })}

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
