import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isAuthenticated } from "@/lib/session";
import { getAdminPath } from "@/lib/session-token";
import { LoginForm } from "./LoginForm";

export const instant = false;

export default async function LoginPage() {
  // Lê o endereço secreto na hora do acesso, nunca no build.
  await connection();
  const base = getAdminPath();
  if (!base) redirect("/");
  if (await isAuthenticated()) redirect(base);

  return (
    <div className="mx-auto max-w-sm pt-10">
      <div className="rounded-[18px] border border-admin-line bg-white p-5 shadow-[0_1px_2px_rgba(41,29,41,0.05)] sm:p-6">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/icon.png" alt="" className="size-8 rounded-lg" />
          <h1 className="text-[19px] leading-tight font-bold">Painel do link na bio</h1>
        </div>
        <p className="mt-2 text-[14px] text-admin-muted">Use o usuário e a senha que você recebeu.</p>
        <LoginForm />
      </div>
    </div>
  );
}
