# Data Mutations

## Overview

All data mutations follow a strict two-layer pattern:

1. **`src/data/` helper functions** — thin wrappers around Drizzle ORM calls, one file per domain.
2. **`actions.ts` server actions** — colocated with the route, validate input with Zod, then delegate to `src/data/` helpers.

Never write Drizzle calls directly inside a server action. Never bypass this two-layer pattern.

---

## Layer 1: `/data` Helper Functions

All database writes (insert, update, delete) must be implemented as exported async functions in `src/data/`. These functions:

- Use Drizzle ORM exclusively — no raw SQL.
- Always call `auth()` from `@clerk/nextjs/server` and throw `Error("Unauthorized")` if `userId` is null.
- Never accept `userId` as a parameter — always derive it from `auth()` internally.
- Are the only place in the codebase that imports `db` for write operations.

### Example

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts, exercises, workoutExercises, sets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export type LogWorkoutInput = {
  name: string;
  startedAt: Date;
  exercises: {
    name: string;
    order: number;
    sets: { setNumber: number; reps: number | null; weightKg: string | null }[];
  }[];
};

export async function createWorkout(input: LogWorkoutInput) {
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
```

---

## Layer 2: Server Actions (`actions.ts`)

### File location

Server actions must live in a file named `actions.ts` colocated with the route that uses them:

```
src/app/dashboard/log/actions.ts   ← colocated with the log route
src/app/dashboard/actions.ts       ← colocated with the dashboard route
```

Never place server actions in `src/data/` or in shared utility files.

### Rules

1. **`"use server"` directive** — every `actions.ts` file must begin with `"use server"`.
2. **Typed params — no `FormData`** — server action parameters must be typed TypeScript objects. Never use `FormData` as a parameter type.
3. **Zod validation** — every server action must validate its arguments with Zod before doing anything else. Throw or return an error if validation fails.
4. **Delegate to `/data` helpers** — after validation, call the appropriate `src/data/` helper. Do not write Drizzle calls directly in the action.
5. **Auth lives in `/data`** — the `src/data/` helper is responsible for auth checks. Actions do not need to repeat them, but may do so as an additional guard if needed.

### Example

```ts
// src/app/dashboard/log/actions.ts
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createWorkout } from "@/data/workouts";

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

const LogWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  exercises: z.array(ExerciseSchema),
});

export async function logWorkout(input: z.infer<typeof LogWorkoutSchema>) {
  const parsed = LogWorkoutSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid input");

  const { name, date, exercises } = parsed.data;

  await createWorkout({
    name,
    startedAt: new Date(date + "T00:00:00"),
    exercises,
  });

  redirect(`/dashboard?date=${date}`);
}
```

---

## Redirects

**Never call `redirect()` inside a server action.** Redirects must be handled client-side after the server action resolves.

In the client component, call the server action and then use the Next.js router to navigate:

```ts
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logWorkout } from "./actions";

const router = useRouter();
const [isPending, startTransition] = useTransition();

function handleSubmit(input) {
  startTransition(async () => {
    await logWorkout(input);
    router.push(`/dashboard?date=${input.date}`);
  });
}
```

---

## What NOT to do

| Pattern | Why it's wrong |
|---|---|
| `FormData` parameter on a server action | Untyped — use a typed object instead |
| Drizzle calls directly in `actions.ts` | Bypasses the `/data` layer |
| Zod skipped or validation after DB call | Input must be validated before any side effect |
| Server action in a file other than `actions.ts` | Breaks colocation convention |
| `userId` passed as a parameter to `/data` helpers | Security risk — derive from `auth()` internally |
| Raw SQL instead of Drizzle ORM | Inconsistent and unsafe |
| `redirect()` called inside a server action | Redirects must be done client-side after the action resolves |

---

## Summary Flow

```
Client / Server Component
        ↓
  actions.ts  (Zod validation → delegate)
        ↓
  src/data/   (auth check → Drizzle ORM → DB)
        ↓
    Neon DB
```
