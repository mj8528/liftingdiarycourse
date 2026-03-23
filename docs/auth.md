# Auth Coding Standards

## Provider

This app uses **Clerk** for all authentication. Do NOT introduce any other auth library or custom auth logic.

## Setup

`ClerkProvider` wraps the entire app in `src/app/layout.tsx`. All Clerk components and hooks are available anywhere within this tree.

## Accessing Auth State

### Server Components

Use `auth()` from `@clerk/nextjs/server` to get the current user's session:

```ts
import { auth } from "@clerk/nextjs/server";

export default async function SomePage() {
  const { userId } = await auth();

  if (!userId) {
    // user is not signed in
  }
}
```

Use `currentUser()` when you need the full user object (name, email, etc.):

```ts
import { currentUser } from "@clerk/nextjs/server";

const user = await currentUser();
```

### Client Components

Use the `useAuth` hook for auth state in client components:

```ts
"use client";

import { useAuth } from "@clerk/nextjs";

export default function MyComponent() {
  const { isSignedIn, userId } = useAuth();
}
```

Use `useUser` when you need the full user object on the client:

```ts
"use client";

import { useUser } from "@clerk/nextjs";

const { user } = useUser();
```

## UI Components

Use Clerk's pre-built components for all sign-in/sign-up UI. Do NOT build custom auth forms.

```ts
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
```

- `<SignInButton mode="modal">` — triggers sign-in modal
- `<SignUpButton mode="modal">` — triggers sign-up modal
- `<UserButton />` — shows avatar + account menu for signed-in users

See `src/app/components/HeaderAuth.tsx` for the canonical usage pattern.

## Route Protection

### Middleware (preferred for protecting routes)

Use Clerk middleware in `middleware.ts` at the project root to protect routes:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

### In-component guards

For ad-hoc checks inside a Server Component, call `auth().protect()` which redirects unauthenticated users to the sign-in page automatically:

```ts
import { auth } from "@clerk/nextjs/server";

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");
  // ...
}
```

## Database: Linking Clerk Users to Data

Store `userId` (the Clerk user ID string) on all user-owned records. Never store passwords or session tokens yourself — Clerk owns that.

```ts
// Example: scoping a DB query to the signed-in user
const { userId } = await auth();
const workouts = await db.query.workouts.findMany({
  where: eq(workoutsTable.userId, userId),
});
```

## Environment Variables

Clerk requires these variables in `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Never commit these values. They are excluded via `.gitignore`.
