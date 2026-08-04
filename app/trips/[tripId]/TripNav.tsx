"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTrip } from "@/lib/trip-context";

const TABS = [
  { href: "", label: "장소" },
  { href: "/itinerary", label: "일정" },
  { href: "/shopping", label: "쇼핑리스트" },
  { href: "/bucket", label: "버킷리스트" },
  { href: "/notes", label: "기타 정보" },
  { href: "/settings", label: "설정" },
];

export function TripNav() {
  const { tripId, trip } = useTrip();
  const pathname = usePathname();
  const base = `/trips/${tripId}`;

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-5xl px-6 pt-6">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{trip.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {trip.destination_city ?? "목적지 미정"}
          {trip.start_date && trip.end_date ? ` · ${trip.start_date} ~ ${trip.end_date}` : ""}
        </p>
        <nav className="mt-4 -mb-px flex gap-5 overflow-x-auto text-sm font-medium">
          {TABS.map((tab) => {
            const href = `${base}${tab.href}`;
            const active =
              tab.href === "" ? pathname === base : pathname.startsWith(href);
            return (
              <Link
                key={tab.href}
                href={href}
                className={`shrink-0 whitespace-nowrap border-b-2 pb-3 ${
                  active
                    ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
