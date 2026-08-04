import Link from "next/link";
import { signOut } from "@/app/login/actions";

export function AppHeader({ nickname }: { nickname: string | null }) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
      <Link href="/trips" className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
        중국 여행 공동 플래너
      </Link>
      {nickname && (
        <form action={signOut} className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{nickname}</span>
          <button type="submit" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            로그아웃
          </button>
        </form>
      )}
    </header>
  );
}
