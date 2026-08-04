"use client";

import { useEffect, useRef, useState } from "react";
import { setToastListener } from "@/lib/toast";

export function Toaster() {
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setToastListener((message, variant) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ message, variant });
      timerRef.current = setTimeout(() => setToast(null), 3000);
    });
    return () => setToastListener(null);
  }, []);

  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
        toast.variant === "error" ? "bg-red-600" : "bg-zinc-900"
      }`}
    >
      {toast.message}
    </div>
  );
}
