"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
}

export default function Error({ error }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-6">
      <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h2>
      <p className="mb-4 text-sm opacity-80">{error.message}</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Refresh Page
      </Button>
    </div>
  );
}
