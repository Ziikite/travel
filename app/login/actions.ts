"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
// Supabase Auth는 이메일 형식의 식별자를 요구한다. 실제 이메일 없이
// 아이디/비밀번호만으로 로그인하기 위해 아이디를 가짜 이메일로 변환해서 사용한다.
const FAKE_EMAIL_DOMAIN = "users.china-trip-planner.local";

function usernameToEmail(username: string): string {
  return `${username.toLowerCase()}@${FAKE_EMAIL_DOMAIN}`;
}

function safeRedirectPath(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/trips";
  return path;
}

export async function signIn(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectPath(formData.get("redirect") as string | null);

  if (!USERNAME_PATTERN.test(username)) {
    redirect(
      `/login?error=${encodeURIComponent("아이디를 확인해주세요.")}&redirect=${encodeURIComponent(redirectTo)}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent("아이디 또는 비밀번호가 올바르지 않습니다.")}&redirect=${encodeURIComponent(redirectTo)}`
    );
  }

  redirect(redirectTo);
}

export async function signUp(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectPath(formData.get("redirect") as string | null);

  if (!USERNAME_PATTERN.test(username)) {
    redirect(
      `/login?error=${encodeURIComponent("아이디는 영문/숫자/밑줄 3~20자로 입력해주세요.")}&mode=signup&redirect=${encodeURIComponent(redirectTo)}`
    );
  }
  if (password.length < 6) {
    redirect(
      `/login?error=${encodeURIComponent("비밀번호는 6자 이상으로 입력해주세요.")}&mode=signup&redirect=${encodeURIComponent(redirectTo)}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: usernameToEmail(username),
    password,
    options: { data: { nickname: username } },
  });

  if (error) {
    const message = error.message.includes("already registered")
      ? "이미 사용 중인 아이디입니다."
      : error.message;
    redirect(
      `/login?error=${encodeURIComponent(message)}&mode=signup&redirect=${encodeURIComponent(redirectTo)}`
    );
  }

  redirect(redirectTo);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
