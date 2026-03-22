"use client";

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

export default function HeaderAuth() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <UserButton />;
  }

  return (
    <>
      <SignInButton mode="modal">
        <button className="px-4 py-2 text-sm font-medium text-zinc-900 bg-white hover:bg-zinc-100 rounded-lg transition-colors">
          Sign in
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
          Sign up
        </button>
      </SignUpButton>
    </>
  );
}
