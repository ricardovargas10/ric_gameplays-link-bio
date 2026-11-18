import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, EyeOff, MousePointerClick, Pencil, Plus } from "lucide-react";
import { BrandIcon } from "@/components/BrandIcon";
import { requireAdminPage } from "@/lib/session";
import { readClicks, readSocials } from "@/lib/content";
import { deleteSocialAction, moveSocialAction, toggleSocialAction } from "../actions";
import { ConfirmDelete, SubmitButton } from "../ui";
import { Alert } from "../fields";
import { btnGhost, btnPrimary, btnSecondary, card, iconBtn } from "../styles";

export const instant = false;

export default async function SocialsPage() {
  const base = await requireAdminPage();

  let data: { socials: Awaited<ReturnType<typeof readSocials>>; clicks: Record<string, number> } | null = null;
  try {
    const [socials, clicks] = await Promise.all([readSocials(), readClicks()]);
    data = { socials, clicks };
  } catch {
    data = null;
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1 basis-60">
          <h1 className="text-[24px] leading-tight font-bold">Redes</h1>
          <p className="mt-1 text-[14px] leading-snug text-admin-muted">Ícones lado a lado, embaixo dos botões, na ordem desta lista.</p>
        </div>
        <Link href={`${base}/rede/nova`} className={`${btnPrimary} min-h-[46px]`}>
          <Plus className="size-5" aria-hidden /> Nova rede
        </Link>
      </div>

      {!data ? (
        <div className="mt-6">
          <Alert kind="error">Não consegui carregar as redes agora. Atualize a página em instantes.</Alert>
        </div>
      ) : data.socials.length === 0 ? (
        <div className="mt-6 rounded-[18px] border-2 border-dashed border-[#c9bec1] px-6 py-10 text-center">
          <p className="text-[17px] font-semibold">Nenhuma rede ainda</p>
          <p className="mt-1 text-[14px] text-admin-muted">Adicione Instagram, TikTok, X e as outras.</p>
        </div>
      ) : (
        <ol className="mt-6 flex flex-col gap-3">
          {data.socials.map((s, i, all) => {
            const clicks = data.clicks[s.id] ?? 0;
            return (
              <li key={s.id} className={`${card} p-3.5 has-[[data-confirm=true]]:border-[#f0d4d2]`}>
                <div className="flex items-center gap-3">
                  <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-sunset text-white ${s.visible ? "" : "opacity-40"}`}>
                    <BrandIcon icon={s.icon} className="size-[23px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15.5px] font-semibold">
                      {s.label} {s.visible ? null : <span className="text-[13px] font-medium text-admin-muted">(oculta)</span>}
                    </p>
                    <p className="truncate text-[13px] text-admin-muted">{s.url.replace(/^https?:\/\/(www\.)?/, "")}</p>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[13px] text-admin-muted">
                      <MousePointerClick className="size-4" aria-hidden /> {clicks.toLocaleString("pt-BR")} {clicks === 1 ? "clique" : "cliques"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <form action={moveSocialAction.bind(null, s.id, "up")}>
                      <SubmitButton className={iconBtn} disabled={i === 0} aria-label={`Mover "${s.label}" para a esquerda`}>
                        <ArrowUp className="size-5" aria-hidden />
                      </SubmitButton>
                    </form>
                    <form action={moveSocialAction.bind(null, s.id, "down")}>
                      <SubmitButton className={iconBtn} disabled={i === all.length - 1} aria-label={`Mover "${s.label}" para a direita`}>
                        <ArrowDown className="size-5" aria-hidden />
                      </SubmitButton>
                    </form>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Link href={`${base}/rede/${s.id}`} className={btnSecondary}>
                    <Pencil className="size-4" aria-hidden /> Editar
                  </Link>
                  <form action={toggleSocialAction.bind(null, s.id)}>
                    <SubmitButton className={btnGhost}>
                      {s.visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                      {s.visible ? "Ocultar" : "Mostrar"}
                    </SubmitButton>
                  </form>
                  <ConfirmDelete compact action={deleteSocialAction.bind(null, s.id)} name={s.label} detail="O ícone sai da página." />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
