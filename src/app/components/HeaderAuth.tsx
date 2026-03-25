"use client";

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function HeaderAuth() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <UserButton />;
  }

  return (
    <>
      <SignInButton mode="modal">
        <Button variant="outline">Sign in</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button>Sign up</Button>
      </SignUpButton>
    </>
  );
}
