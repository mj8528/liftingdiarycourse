import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getExercises() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.select({ id: exercises.id, name: exercises.name }).from(exercises).orderBy(exercises.name);
}

export async function getWorkoutsForDate(date: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      startedAt: workouts.startedAt,
      workoutExerciseId: workoutExercises.id,
      exerciseName: exercises.name,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weightKg: sets.weightKg,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, startOfDay),
        lt(workouts.startedAt, endOfDay)
      )
    )
    .orderBy(workouts.startedAt, workoutExercises.order, sets.setNumber);

  // Group into structured shape
  const workoutMap = new Map<
    number,
    {
      id: number;
      name: string;
      exercises: Map<
        number,
        {
          id: number;
          name: string;
          sets: { id: number; setNumber: number; reps: number | null; weightKg: string | null }[];
        }
      >;
    }
  >();

  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, {
        id: row.workoutId,
        name: row.workoutName,
        exercises: new Map(),
      });
    }
    const workout = workoutMap.get(row.workoutId)!;

    if (row.workoutExerciseId && row.exerciseName) {
      if (!workout.exercises.has(row.workoutExerciseId)) {
        workout.exercises.set(row.workoutExerciseId, {
          id: row.workoutExerciseId,
          name: row.exerciseName,
          sets: [],
        });
      }
      const exercise = workout.exercises.get(row.workoutExerciseId)!;

      if (row.setId) {
        exercise.sets.push({
          id: row.setId,
          setNumber: row.setNumber!,
          reps: row.reps,
          weightKg: row.weightKg,
        });
      }
    }
  }

  return Array.from(workoutMap.values()).map((w) => ({
    ...w,
    exercises: Array.from(w.exercises.values()),
  }));
}

export type WorkoutWithExercises = Awaited<ReturnType<typeof getWorkoutsForDate>>[number];

export async function getWorkoutById(workoutId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      startedAt: workouts.startedAt,
      workoutExerciseId: workoutExercises.id,
      workoutExerciseOrder: workoutExercises.order,
      exerciseName: exercises.name,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weightKg: sets.weightKg,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .orderBy(workoutExercises.order, sets.setNumber);

  if (rows.length === 0) return null;

  const workoutMap = new Map<
    number,
    {
      id: number;
      name: string;
      startedAt: Date;
      exercises: Map<
        number,
        {
          id: number;
          name: string;
          order: number;
          sets: { id: number; setNumber: number; reps: number | null; weightKg: string | null }[];
        }
      >;
    }
  >();

  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, {
        id: row.workoutId,
        name: row.workoutName,
        startedAt: row.startedAt,
        exercises: new Map(),
      });
    }
    const workout = workoutMap.get(row.workoutId)!;

    if (row.workoutExerciseId && row.exerciseName) {
      if (!workout.exercises.has(row.workoutExerciseId)) {
        workout.exercises.set(row.workoutExerciseId, {
          id: row.workoutExerciseId,
          name: row.exerciseName,
          order: row.workoutExerciseOrder!,
          sets: [],
        });
      }
      const exercise = workout.exercises.get(row.workoutExerciseId)!;

      if (row.setId) {
        exercise.sets.push({
          id: row.setId,
          setNumber: row.setNumber!,
          reps: row.reps,
          weightKg: row.weightKg,
        });
      }
    }
  }

  const result = Array.from(workoutMap.values()).map((w) => ({
    ...w,
    exercises: Array.from(w.exercises.values()),
  }))[0];

  return result ?? null;
}

export type WorkoutDetail = NonNullable<Awaited<ReturnType<typeof getWorkoutById>>>;

export type UpdateWorkoutInput = {
  workoutId: number;
  name: string;
  startedAt: Date;
  exercises: {
    name: string;
    order: number;
    sets: { setNumber: number; reps: number | null; weightKg: string | null }[];
  }[];
};

export async function updateWorkout(input: UpdateWorkoutInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const existing = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.id, input.workoutId), eq(workouts.userId, userId)));

  if (existing.length === 0) throw new Error("Not found");

  // Update workout name and startedAt
  await db
    .update(workouts)
    .set({ name: input.name, startedAt: input.startedAt, updatedAt: new Date() })
    .where(eq(workouts.id, input.workoutId));

  // Delete existing workout exercises (cascades to sets)
  await db.delete(workoutExercises).where(eq(workoutExercises.workoutId, input.workoutId));

  // Re-insert exercises and sets
  for (const ex of input.exercises) {
    let exercise = await db
      .select()
      .from(exercises)
      .where(eq(exercises.name, ex.name))
      .then((rows) => rows[0]);

    if (!exercise) {
      [exercise] = await db.insert(exercises).values({ name: ex.name }).returning();
    }

    const [workoutExercise] = await db
      .insert(workoutExercises)
      .values({ workoutId: input.workoutId, exerciseId: exercise.id, order: ex.order })
      .returning({ id: workoutExercises.id });

    for (const set of ex.sets) {
      await db.insert(sets).values({
        workoutExerciseId: workoutExercise.id,
        setNumber: set.setNumber,
        reps: set.reps,
        weightKg: set.weightKg,
      });
    }
  }
}

export type CreateWorkoutInput = {
  name: string;
  startedAt: Date;
  exercises: {
    name: string;
    order: number;
    sets: { setNumber: number; reps: number | null; weightKg: string | null }[];
  }[];
};

export async function createWorkout(input: CreateWorkoutInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [workout] = await db
    .insert(workouts)
    .values({ userId, name: input.name, startedAt: input.startedAt })
    .returning({ id: workouts.id });

  for (const ex of input.exercises) {
    let exercise = await db
      .select()
      .from(exercises)
      .where(eq(exercises.name, ex.name))
      .then((rows) => rows[0]);

    if (!exercise) {
      [exercise] = await db.insert(exercises).values({ name: ex.name }).returning();
    }

    const [workoutExercise] = await db
      .insert(workoutExercises)
      .values({ workoutId: workout.id, exerciseId: exercise.id, order: ex.order })
      .returning({ id: workoutExercises.id });

    for (const set of ex.sets) {
      await db.insert(sets).values({
        workoutExerciseId: workoutExercise.id,
        setNumber: set.setNumber,
        reps: set.reps,
        weightKg: set.weightKg,
      });
    }
  }

  return workout;
}
