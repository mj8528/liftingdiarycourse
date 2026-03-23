# Data Fetching

## CRITICAL: Server Components Only

**ALL data fetching MUST be done exclusively via Server Components.**

Do NOT fetch data via:
- Route handlers (`src/app/api/`)
- Client components (`"use client"`)
- `useEffect` + `fetch`
- SWR, React Query, or any client-side data fetching library
- Any other mechanism

There are no exceptions. If a component needs data, it must be a Server Component (or delegate to one).

## Database Queries via `/data` Helper Functions

All database queries must go through helper functions in the `/data` directory. These functions use Drizzle ORM exclusively.

**Do NOT write raw SQL.** Always use Drizzle's query builder.

### Example structure

```
src/
  data/
    workouts.ts
    exercises.ts
    sets.ts
```

### Example helper function

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getWorkouts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

### Example Server Component consuming a helper

```ts
// src/app/dashboard/page.tsx
import { getWorkouts } from "@/data/workouts";

export default async function DashboardPage() {
  const workouts = await getWorkouts();
  return <div>{/* render workouts */}</div>;
}
```

## CRITICAL: User Data Isolation

Every helper function that queries the database **MUST** scope its query to the currently authenticated user.

Rules:
1. Call `auth()` from `@clerk/nextjs/server` at the top of every helper.
2. If `userId` is null, throw an `Error("Unauthorized")` immediately — never proceed.
3. Always filter by `userId` in every query — never return data that belongs to another user.
4. Never accept a `userId` as a parameter from the caller — always derive it from `auth()` inside the helper. This prevents callers from spoofing another user's ID.

Violating these rules is a security vulnerability. A logged-in user must only ever be able to read or modify their own data.
