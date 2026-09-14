import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-surface-sunken px-6 text-center dark:bg-black">
      <p className="mb-3 text-caption text-ink-muted">구글맵 기반</p>
      <h1 className="max-w-xl text-page-title text-ink dark:text-zinc-50">
        중국 여행, 같이 계획하고
        <br />
        실시간으로 공유하세요
      </h1>
      <p className="mt-4 max-w-md text-body-role text-ink-muted dark:text-zinc-400">
        여행방을 만들고 일행을 초대해서 장소를 저장·투표하고, 날짜별 일정과
        쇼핑리스트까지 새로고침 없이 함께 관리하세요.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/login"
          className="rounded-full bg-primary px-6 py-3 text-body-strong text-on-primary transition-colors hover:bg-primary-hover dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          시작하기
        </Link>
      </div>
    </div>
  );
}
