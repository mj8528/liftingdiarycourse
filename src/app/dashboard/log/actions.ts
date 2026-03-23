"use server";

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts, exercises, workoutExercises, sets } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function logWorkout(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const dateStr = formData.get("date") as string;

  if (!name || !dateStr) throw new Error("Missing required fields");

  const startedAt = new Date(dateStr + "T00:00:00");

  // Parse exercises and sets from formData
  // exerciseNames[] and sets[][reps], sets[][weight] arrays
  const exerciseNames = formData.getAll("exerciseName") as string[];

  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt })
    .returning({ id: workouts.id });

  for (let i = 0; i < exerciseNames.length; i++) {
    const exerciseName = exerciseNames[i].trim();
    if (!exerciseName) continue;

    // Get or create exercise
    let exercise = await db
      .select()
      .from(exercises)
      .where(eq(exercises.name, exerciseName))
      .then((rows) => rows[0]);

    if (!exercise) {
      [exercise] = await db
        .insert(exercises)
        .values({ name: exerciseName })
        .returning();
    }

    const [workoutExercise] = await db
      .insert(workoutExercises)
      .values({ workoutId: workout.id, exerciseId: exercise.id, order: i })
      .returning({ id: workoutExercises.id });

    const repsArr = formData.getAll(`reps_${i}`) as string[];
    const weightsArr = formData.getAll(`weight_${i}`) as string[];

    for (let j = 0; j < repsArr.length; j++) {
      const reps = repsArr[j] ? parseInt(repsArr[j]) : null;
      const weightKg = weightsArr[j] ? weightsArr[j] : null;

      await db.insert(sets).values({
        workoutExerciseId: workoutExercise.id,
        setNumber: j + 1,
        reps,
        weightKg,
      });
    }
  }

  redirect(`/dashboard?date=${dateStr}`);
}
