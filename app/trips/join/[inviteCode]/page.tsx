import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { joinTrip } from "./actions";

export default async function JoinTripPage(props: PageProps<"/trips/join/[inviteCode]">) {
  const { inviteCode } = await props.params;
  const searchParams = await props.searchParams;
  const error = typeof searchParams.error === "string" ? searchParams.error : undefined;

  const supabase = await createClient();
  const { data: previews } = await supabase.rpc("get_trip_preview", {
    p_invite_code: inviteCode,
  });
  const trip = previews?.[0];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 p-8 text-center dark:border-zinc-800">
        {!trip ? (
          <>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              유효하지 않은 초대 링크입니다.
            </p>
            <Link href="/trips" className="mt-4 inline-block text-sm text-zinc-500 underline">
              내 여행방으로 이동
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-orange-600">여행방 초대</p>
            <h1 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {trip.title}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {trip.destination_city ?? "목적지 미정"}
              {trip.start_date && trip.end_date
                ? ` · ${trip.start_date} ~ ${trip.end_date}`
                : ""}
            </p>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
              </p>
            )}

            {user ? (
              <form action={joinTrip} className="mt-6">
                <input type="hidden" name="invite_code" value={inviteCode} />
                <button
                  type="submit"
                  className="w-full rounded-full bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
                >
                  참여하기
                </button>
              </form>
            ) : (
              <Link
                href={`/login?redirect=${encodeURIComponent(`/trips/join/${inviteCode}`)}`}
                className="mt-6 block w-full rounded-full bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
              >
                로그인하고 참여하기
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
