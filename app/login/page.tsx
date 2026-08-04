import { LoginForm } from "./LoginForm";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const mode = searchParams.mode === "signup" ? "signup" : "signin";
  const redirectTo =
    typeof searchParams.redirect === "string" ? searchParams.redirect : "/trips";
  const error = typeof searchParams.error === "string" ? searchParams.error : undefined;

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <h1 className="mb-8 text-xl font-bold text-zinc-900 dark:text-zinc-50">
        중국 여행 공동 플래너
      </h1>
      <LoginForm initialMode={mode} redirectTo={redirectTo} error={error} />
    </div>
  );
}
