import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreateTripDialog } from "./CreateTripDialog";

export default async function TripsPage(props: PageProps<"/trips">) {
  const searchParams = await props.searchParams;
  const error = typeof searchParams.error === "string" ? searchParams.error : undefined;

  const supabase = await createClient();
  const { data: trips } = await supabase
    .from("trips")
    .select("*")
    .order("start_date", { ascending: true, nullsFirst: false });

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-page-title text-ink dark:text-zinc-50">내 여행방</h1>
        <CreateTripDialog />
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {!trips?.length ? (
        <p className="text-ink-muted">아직 여행방이 없어요. 새 여행방을 만들어보세요.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {trips.map((trip) => (
            <li key={trip.id}>
              <Link
                href={`/trips/${trip.id}`}
                className="block rounded-xl border border-border p-5 transition-colors hover:border-border dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <p className="text-body-strong text-ink dark:text-zinc-50">{trip.title}</p>
                <p className="mt-1 text-sm text-ink-muted">
                  {trip.destination_city ?? "목적지 미정"}
                  {trip.start_date && trip.end_date
                    ? ` · ${trip.start_date} ~ ${trip.end_date}`
                    : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
