# Routing Standards

## Route Structure

All application routes live under `/dashboard`. There are no top-level feature routes outside of `/dashboard`.

```
/dashboard                        ← main dashboard page
/dashboard/log                    ← log a workout (legacy)
/dashboard/workout/new            ← create a new workout
/dashboard/workout/[workoutId]    ← edit an existing workout
```

## Protected Routes

All `/dashboard` routes — and any sub-routes beneath them — are **protected**. They must only be accessible by authenticated users.

### How protection is implemented

Route protection is handled exclusively via **Next.js middleware** (`src/middleware.ts`). Do NOT implement auth guards inside page components, layouts, or server actions as a substitute for middleware protection.

Use Clerk's `clerkMiddleware` with `auth().protect()` to enforce authentication:

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

Unauthenticated users hitting any `/dashboard` route will be redirected to the Clerk sign-in page automatically.

## Rules

| Rule | Detail |
|---|---|
| All features live under `/dashboard` | No feature pages at the root level |
| Middleware handles auth | Do not use `if (!userId) redirect("/sign-in")` in pages |
| Clerk is the auth provider | Use `auth()` from `@clerk/nextjs/server` inside server components and data helpers |
| Dynamic segments use numeric IDs | e.g. `/dashboard/workout/[workoutId]` where `workoutId` is a database integer |
