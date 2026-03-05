"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Itt később beköthetünk Sentry-t vagy más hiba naplózót
    console.error("Admin products oldal hiba elkapva:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-4 text-center">
      <AlertCircle className="w-12 h-12 text-destructive mb-4" />
      <h2 className="text-xl font-bold mb-2">Váratlan hiba történt</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        A rendszer nem tudta hibátlanul betölteni a kért felületet. Kérjük, próbáld újra az oldalt.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()} variant="outline">
          Oldal újratöltése
        </Button>
        <Button onClick={() => reset()}>Újrapróbálkozás</Button>
      </div>
    </div>
  );
}
