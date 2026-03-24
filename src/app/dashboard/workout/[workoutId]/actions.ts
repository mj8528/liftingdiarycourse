"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";

const SetSchema = z.object({
  setNumber: z.number().int().positive(),
  reps: z.number().int().positive().nullable(),
  weightKg: z.string().nullable(),
});

const ExerciseSchema = z.object({
  name: z.string().min(1),
  order: z.number().int().min(0),
  sets: z.array(SetSchema),
});

const EditWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  exercises: z.array(ExerciseSchema),
});

export async function editWorkout(input: z.infer<typeof EditWorkoutSchema>) {
  const parsed = EditWorkoutSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  const { workoutId, name, date, exercises } = parsed.data;

  await updateWorkout({
    workoutId,
    name,
    startedAt: new Date(date + "T00:00:00"),
    exercises,
  });

  return { date };
}
