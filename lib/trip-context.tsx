"use client";

import { createContext, useContext } from "react";
import type { Role, Trip } from "@/lib/types";

export interface TripContextValue {
  tripId: string;
  role: Role;
  trip: Trip;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({
  value,
  children,
}: {
  value: TripContextValue;
  children: React.ReactNode;
}) {
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used within TripProvider");
  return ctx;
}
