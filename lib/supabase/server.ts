import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database, Role, Trip } from "@/lib/types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출된 경우 무시 (proxy가 세션 갱신을 처리)
          }
        },
      },
    }
  );
}

/**
 * 같은 요청(request) 안에서 여러 컴포넌트가 각각 auth.getUser()를 호출해도
 * 실제 네트워크 요청은 한 번만 나가도록 React.cache로 메모이즈한다.
 * (layout.tsx의 멤버십 체크 + 각 page.tsx가 중복 호출하던 것을 통합)
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * trip + 현재 사용자의 role을 병렬로 조회하고, 요청 단위로 캐시한다.
 * page.tsx들이 필요로 하는 trip 컬럼은 모두 select("*")로 커버되므로
 * 각 페이지에서 trips 테이블을 다시 조회할 필요가 없다.
 */
export const getTripMembership = cache(async (tripId: string) => {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { trip: null as Trip | null, role: null as Role | null };

  const [{ data: trip }, { data: member }] = await Promise.all([
    supabase.from("trips").select("*").eq("id", tripId).maybeSingle(),
    supabase
      .from("trip_members")
      .select("role")
      .eq("trip_id", tripId)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return { trip: trip as Trip | null, role: (member?.role as Role | undefined) ?? null };
});
