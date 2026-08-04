import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { InviteShareButton } from "./InviteShareButton";
import { ActivityFeed } from "./ActivityFeed";
import { updateMemberRole, removeMember } from "./actions";

const ROLE_LABEL: Record<string, string> = {
  owner: "방장",
  editor: "편집자",
  viewer: "조회자",
};

export default async function TripSettingsPage(props: PageProps<"/trips/[tripId]/settings">) {
  const { tripId } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: trip }, { data: members }, { data: activityLogs }] = await Promise.all([
    supabase.from("trips").select("invite_code").eq("id", tripId).single(),
    supabase
      .from("trip_members")
      .select("user_id, role, joined_at, profiles(nickname, profile_image)")
      .eq("trip_id", tripId)
      .order("joined_at", { ascending: true }),
    supabase
      .from("activity_logs")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const inviteUrl = `${protocol}://${host}/trips/join/${trip?.invite_code}`;

  const isOwner = members?.some((m) => m.user_id === user?.id && m.role === "owner");
  const memberNicknames = (members ?? []).map((m) => {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    return { userId: m.user_id, nickname: profile?.nickname ?? "알 수 없음" };
  });

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          초대 링크
        </h2>
        <InviteShareButton url={inviteUrl} />
        <p className="mt-2 text-xs text-zinc-500">
          이 링크를 아는 사람은 누구나 로그인 후 여행방에 참여할 수 있어요(편집자 권한).
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          멤버 ({members?.length ?? 0})
        </h2>
        <ul className="flex flex-col divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {members?.map((member) => {
            const profile = Array.isArray(member.profiles)
              ? member.profiles[0]
              : member.profiles;
            return (
              <li key={member.user_id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {profile?.nickname ?? "알 수 없음"}
                    {member.user_id === user?.id && (
                      <span className="ml-1 text-xs text-zinc-400">(나)</span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500">{ROLE_LABEL[member.role] ?? member.role}</p>
                </div>

                {isOwner && member.role !== "owner" && (
                  <div className="flex items-center gap-2">
                    <form action={updateMemberRole}>
                      <input type="hidden" name="trip_id" value={tripId} />
                      <input type="hidden" name="user_id" value={member.user_id} />
                      <select
                        name="role"
                        defaultValue={member.role}
                        onChange={(e) => e.currentTarget.form?.requestSubmit()}
                        className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                      >
                        <option value="editor">편집자</option>
                        <option value="viewer">조회자</option>
                      </select>
                    </form>
                    <form action={removeMember}>
                      <input type="hidden" name="trip_id" value={tripId} />
                      <input type="hidden" name="user_id" value={member.user_id} />
                      <button type="submit" className="text-xs text-red-500 hover:underline">
                        내보내기
                      </button>
                    </form>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">최근 활동</h2>
        <ActivityFeed tripId={tripId} initialLogs={activityLogs ?? []} memberNicknames={memberNicknames} />
      </section>
    </div>
  );
}
