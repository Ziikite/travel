"use client";

import { useState } from "react";
import { signIn, signUp } from "./actions";

export function LoginForm({
  initialMode,
  redirectTo,
  error,
  notice,
}: {
  initialMode: "signin" | "signup";
  redirectTo: string;
  error?: string;
  notice?: string;
}) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-6 flex rounded-full bg-zinc-100 p-1 text-sm font-medium dark:bg-zinc-800">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-full py-2 transition-colors ${
            mode === "signin"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
              : "text-zinc-500"
          }`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-full py-2 transition-colors ${
            mode === "signup"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
              : "text-zinc-500"
          }`}
        >
          회원가입
        </button>
      </div>

      {notice && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {notice}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {mode === "signin" ? (
        <form action={signIn} className="flex flex-col gap-3">
          <input type="hidden" name="redirect" value={redirectTo} />
          <input
            type="email"
            name="email"
            placeholder="이메일"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <button
            type="submit"
            className="mt-2 rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
          >
            로그인
          </button>
        </form>
      ) : (
        <form action={signUp} className="flex flex-col gap-3">
          <input type="hidden" name="redirect" value={redirectTo} />
          <input
            type="text"
            name="nickname"
            placeholder="닉네임"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <input
            type="email"
            name="email"
            placeholder="이메일"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호 (6자 이상)"
            required
            minLength={6}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />
          <button
            type="submit"
            className="mt-2 rounded-lg bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
          >
            회원가입
          </button>
        </form>
      )}
    </div>
  );
}
