import Link from "next/link";
import { Copy, Eye, EyeOff, MousePointerClick, Pencil, Plus } from "lucide-react";
import { LinkCard } from "@/components/LinkCard";
import { requireAdminPage } from "@/lib/session";
import { readButtons, readClicks } from "@/lib/content";
import { ANIMATION_LABELS, buttonStatus, type ButtonStatus, type LinkButtonData } from "@/lib/content-types";
import { formatSp } from "@/lib/time";
import { deleteButtonAction, duplicateButtonAction, toggleButtonAction } from "./actions";
import { ConfirmDelete, SubmitButton } from "./ui";
import { Alert } from "./fields";
import { btnGhost, btnPrimary, btnSecondary } from "./styles";
import { SortableButtons } from "./SortableButtons";

export const instant = false;

const STATUS: Record<ButtonStatus, { label: string; chip: string; dot: string }> = {
  "no-ar": { label: "No ar", chip: "bg-success-bg text-success-text", dot: "bg-success" },
  agendado: { label: "Agendado", chip: "bg-warning-bg text-warning-text", dot: "bg-warning" },
  encerrado: { label: "Encerrado", chip: "bg-[#f2edee] text-[#4a3f4a]", dot: "bg-[#9a8f9a]" },
  oculto: { label: "Oculto", chip: "bg-white border-[1.5px] border-admin-border text-[#4a3f4a]", dot: "" },
};

function period(b: LinkButtonData): string | null {
  if (b.startsAt && b.endsAt) return `de ${formatSp(b.startsAt)} até ${formatSp(b.endsAt)}`;
  if (b.startsAt) return `entra ${formatSp(b.startsAt)}`;
  if (b.endsAt) return `some em ${formatSp(b.endsAt)}`;
  return null;
}

async function load() {
  const [buttons, clicks] = await Promise.all([readButtons(), readClicks()]);
  const now = Date.now();
  return { buttons: buttons.map((b) => ({ ...b, status: buttonStatus(b, now) })), clicks };
}

type Row = Awaited<ReturnType<typeof load>>["buttons"][number];

const chip = "inline-flex h-8 items-center gap-1.5 rounded-full border border-[#e9e2e4] bg-white px-3 text-[13.5px]";

export default async function ButtonsPage() {
  const base = await requireAdminPage();

  let data: Awaited<ReturnType<typeof load>> | null = null;
  try {
    data = await load();
  } catch {
    data = null;
  }

  const count = (s: ButtonStatus) => data?.buttons.filter((b) => b.status === s).length ?? 0;
  const totalClicks = data ? Object.values(data.clicks).reduce((a, n) => a + n, 0) : 0;

  function header(b: Row, i: number) {
    const s = STATUS[b.status];
    const clicks = data?.clicks[b.id] ?? 0;
    return (
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold ${s.chip}`}>
          {s.dot ? <span aria-hidden className={`size-1.5 rounded-full ${s.dot}`} /> : null}
          {s.label}
        </span>
        <span className="inline-flex items-center gap-1 text-[13.5px] text-admin-muted" title="Cliques desde que o botão foi criado">
          <MousePointerClick className="size-4" aria-hidden /> {clicks.toLocaleString("pt-BR")} {clicks === 1 ? "clique" : "cliques"}
        </span>
        <span className="ml-auto text-[12.5px] text-admin-faint tabular-nums">{i + 1}º</span>
      </div>
    );
  }

  function body(b: Row) {
    const when = period(b);
    const extra = [
      b.url ? b.url.replace(/^https?:\/\/(www\.)?/, "") : "sem link (aviso)",
      when,
      b.badge ? `selo "${b.badge}"` : null,
      b.animation !== "none" ? ANIMATION_LABELS[b.animation].toLowerCase() : null,
    ]
      .filter(Boolean)
      .join(" · ");
    return (
      <>
        <div className={`mt-3 rounded-[14px] bg-sunset p-3 ${b.visible ? "" : "opacity-50"}`}>
          <LinkCard preview label={b.label} subtitle={b.subtitle} badge={b.badge} url={b.url} icon={b.icon} style={b.style} colors={b.colors} animation={b.animation} half={b.half} />
        </div>
        <p className="mt-2.5 truncate text-[13px] text-admin-muted">{extra}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-0.5 gap-y-1">
          <Link href={`${base}/botao/${b.id}`} className={btnSecondary}>
            <Pencil className="size-4" aria-hidden /> Editar
          </Link>
          <form action={toggleButtonAction.bind(null, b.id)}>
            <SubmitButton className={btnGhost} aria-label={b.visible ? `Ocultar "${b.label}"` : `Mostrar "${b.label}"`}>
              {b.visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              {b.visible ? "Ocultar" : "Mostrar"}
            </SubmitButton>
          </form>
          <form action={duplicateButtonAction.bind(null, b.id)}>
            <SubmitButton className={btnGhost}>
              <Copy className="size-4" aria-hidden /> Duplicar
            </SubmitButton>
          </form>
          <ConfirmDelete compact action={deleteButtonAction.bind(null, b.id)} name={b.label} detail="Os cliques registrados vão junto." />
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1 basis-60">
          <h1 className="text-[24px] leading-tight font-bold">Botões</h1>
          <p className="mt-1 text-[14px] leading-snug text-admin-muted">Arraste pela alça para mudar a ordem. Ocultos e fora das datas não aparecem na página.</p>
        </div>
        <Link href={`${base}/botao/novo`} className={`${btnPrimary} min-h-[46px]`}>
          <Plus className="size-5" aria-hidden /> Novo botão
        </Link>
      </div>

      {data && data.buttons.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={chip}>
            <span aria-hidden className="size-1.5 rounded-full bg-success" /> {count("no-ar")} no ar
          </span>
          {count("agendado") ? (
            <span className={chip}>
              <span aria-hidden className="size-1.5 rounded-full bg-warning" /> {count("agendado")} {count("agendado") > 1 ? "agendados" : "agendado"}
            </span>
          ) : null}
          {count("oculto") ? (
            <span className={chip}>
              <span aria-hidden className="size-1.5 rounded-full bg-[#9a8f9a]" /> {count("oculto")} {count("oculto") > 1 ? "ocultos" : "oculto"}
            </span>
          ) : null}
          <span className={chip}>{totalClicks.toLocaleString("pt-BR")} cliques</span>
        </div>
      ) : null}

      {!data ? (
        <div className="mt-6">
          <Alert kind="error">Não consegui carregar os botões agora. Atualize a página em instantes.</Alert>
        </div>
      ) : data.buttons.length === 0 ? (
        <div className="mt-6 rounded-[18px] border-2 border-dashed border-[#c9bec1] px-6 py-10 text-center">
          <p className="text-[17px] font-semibold">Nenhum botão ainda</p>
          <p className="mt-1 text-[14px] text-admin-muted">Os botões que você criar aparecem aqui e na página, nesta ordem.</p>
          <Link href={`${base}/botao/novo`} className={`${btnPrimary} mt-4`}>
            <Plus className="size-5" aria-hidden /> Criar o primeiro botão
          </Link>
        </div>
      ) : (
        <SortableButtons
          key={data.buttons.map((b) => `${b.id}:${b.updatedAt}:${b.status}`).join()}
          items={data.buttons.map((b, i) => ({
            id: b.id,
            label: b.label,
            separator: i > 0 && b.gapBefore ? (b.groupTitle ?? "") : null,
            header: header(b, i),
            body: body(b),
          }))}
        />
      )}
    </div>
  );
}
