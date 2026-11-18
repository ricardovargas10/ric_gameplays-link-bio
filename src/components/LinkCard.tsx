import type { CSSProperties, ReactNode } from "react";
import { IconChevronRight } from "@tabler/icons-react";
import { NO_COLORS, type Animation, type ButtonColors, type ButtonStyle, type IconRef } from "@/lib/content-types";
import { externalLinkProps } from "@/lib/links";
import { BrandIcon } from "./BrandIcon";

/** Cores de cada estilo: fundo, texto, apoio (subtítulo), ícone e fundo do chip do ícone. */
const STYLES: Record<ButtonStyle, { body: string; sub: string; icon: string; chip: string; ring: string; shine: string }> = {
  white: { body: "bg-white text-raisin", sub: "text-admin-muted", icon: "text-sunset", chip: "bg-[rgba(196,26,59,0.10)]", ring: "border-white", shine: "promo-shine-warm" },
  orange: { body: "bg-sunset text-white", sub: "text-white/85", icon: "text-white", chip: "bg-white/15", ring: "border-sunset", shine: "" },
  blue: { body: "bg-sky text-raisin", sub: "text-raisin/75", icon: "text-raisin", chip: "bg-raisin/10", ring: "border-sky", shine: "" },
  lilac: { body: "bg-lilac text-raisin", sub: "text-raisin/75", icon: "text-raisin", chip: "bg-raisin/10", ring: "border-lilac", shine: "" },
  purple: { body: "bg-raisin text-white", sub: "text-white/80", icon: "text-white", chip: "bg-white/12", ring: "border-raisin", shine: "" },
  featured: { body: "bg-white text-raisin", sub: "text-admin-muted", icon: "text-sunset", chip: "bg-[rgba(196,26,59,0.10)]", ring: "border-white", shine: "promo-shine-warm" },
};

export type LinkCardProps = {
  id?: string;
  label: string;
  subtitle?: string | null;
  badge?: string | null;
  url: string;
  icon: IconRef;
  style: ButtonStyle;
  colors?: ButtonColors;
  animation: Animation;
  /** Meia largura: divide a linha com o vizinho. */
  half?: boolean;
  /** Na pré-visualização do painel o botão não navega. */
  preview?: boolean;
  /** Pré-visualização de uma imagem ainda não salva. */
  iconPreviewSrc?: string | null;
};

export function LinkCard({ id, label, subtitle, badge, url, icon, style, colors = NO_COLORS, animation, half, preview, iconPreviewSrc }: LinkCardProps) {
  const s = STYLES[style] ?? STYLES.white;
  const shine = animation === "shine" || animation === "both";
  const pulse = animation === "pulse" || animation === "both";
  const text = label || "Texto do botão";
  const bodyStyle: CSSProperties = {
    ...(colors.bg ? { backgroundColor: colors.bg } : {}),
    ...(colors.text ? { color: colors.text } : {}),
  };
  const iconColor: CSSProperties | undefined = colors.icon ? { color: colors.icon } : undefined;
  const hasIcon = icon.type !== "none" || !!iconPreviewSrc;

  const badgeEl = badge ? (
    <span className="absolute -top-[11px] right-3.5 z-10 rounded-full border-[1.5px] border-raisin bg-cream px-2.5 py-[3px] text-[11px] leading-none font-bold tracking-[0.06em] text-raisin uppercase">
      {badge}
    </span>
  ) : null;
  const effects = (radius: string) => (
    <>
      {pulse ? <span aria-hidden className={`promo-ring ${s.ring} ${radius}`} style={colors.bg ? { borderColor: colors.bg } : undefined} /> : null}
    </>
  );

  // ---------- Sem link: aviso, não parece clicável ----------
  if (!url && style !== "featured") {
    return (
      <div className="relative flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-[1.5px] border-white/45 px-4 py-3 text-center text-white" style={colors.text ? { color: colors.text } : undefined}>
        {hasIcon ? (
          <span className="flex shrink-0" style={iconColor}>
            <BrandIcon icon={icon} previewSrc={iconPreviewSrc} className="size-[17px]" />
          </span>
        ) : null}
        <span className="text-[14.5px] leading-snug font-semibold">{text}</span>
        {badgeEl}
      </div>
    );
  }

  let inner: ReactNode;
  let cls: string;

  if (style === "featured") {
    // Destaque com thumb, no estilo galeria do Notion.
    const thumb = iconPreviewSrc ?? (icon.type === "custom" ? `/media/${icon.mediaId}` : null);
    cls = `lk lk-featured relative block rounded-[18px] text-left ${s.body}`;
    inner = (
      <>
        {effects("rounded-[18px]")}
        <span className="relative isolate block overflow-hidden rounded-[18px]">
          {shine ? <span aria-hidden className={`promo-shine ${s.shine}`} /> : null}
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="block aspect-video w-full object-cover" />
          ) : (
            <span className="flex aspect-video w-full items-center justify-center bg-raisin/10 text-[13px] text-admin-muted">Sem thumb ainda</span>
          )}
          <span className="flex items-center gap-3 px-4 pt-3.5 pb-4">
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[17px] leading-[1.25] font-semibold break-words">{text}</span>
              {subtitle ? <span className={`mt-[3px] text-[13.5px] leading-[1.35] break-words ${colors.text ? "opacity-75" : s.sub}`}>{subtitle}</span> : null}
            </span>
            {url ? <IconChevronRight aria-hidden className="size-5 shrink-0 text-sunset" stroke={2.25} /> : null}
          </span>
        </span>
        {badgeEl}
      </>
    );
  } else if (half) {
    cls = `lk lk-half lk-plain relative flex min-h-[52px] items-center gap-2.5 rounded-[14px] px-3 text-left ${s.body}`;
    inner = (
      <>
        {effects("rounded-[14px]")}
        {shine ? (
          <span aria-hidden className="pointer-events-none absolute inset-0 isolate overflow-hidden rounded-[14px]">
            <span className={`promo-shine ${s.shine}`} />
          </span>
        ) : null}
        {hasIcon ? (
          <span className={`relative flex shrink-0 ${colors.icon ? "" : s.icon}`} style={iconColor}>
            <BrandIcon icon={icon} previewSrc={iconPreviewSrc} className="size-[18px]" />
          </span>
        ) : null}
        <span className="relative min-w-0 truncate text-[14.5px] font-semibold">{text}</span>
        {badgeEl}
      </>
    );
  } else {
    cls = `lk lk-plain relative flex items-center gap-3 rounded-2xl pr-3 pl-2.5 text-left ${subtitle ? "min-h-[66px]" : "min-h-[58px]"} ${s.body}`;
    inner = (
      <>
        {effects("rounded-2xl")}
        {shine ? (
          <span aria-hidden className="pointer-events-none absolute inset-0 isolate overflow-hidden rounded-2xl">
            <span className={`promo-shine ${s.shine}`} />
          </span>
        ) : null}
        {hasIcon ? (
          <span className={`lk-chip relative flex size-[38px] shrink-0 items-center justify-center rounded-xl transition-colors ${s.chip} ${colors.icon ? "" : s.icon}`} style={iconColor}>
            <BrandIcon icon={icon} previewSrc={iconPreviewSrc} className="size-5" />
          </span>
        ) : null}
        <span className={`relative flex min-w-0 flex-1 flex-col py-2.5 ${hasIcon ? "" : "pl-1.5"}`}>
          <span className="text-[16px] leading-snug font-semibold break-words">{text}</span>
          {subtitle ? <span className={`mt-0.5 text-[13px] leading-[1.3] break-words ${colors.text ? "opacity-75" : s.sub}`}>{subtitle}</span> : null}
        </span>
        <IconChevronRight aria-hidden className="lk-arrow relative size-[18px] shrink-0 text-raisin/35 transition-colors" stroke={2.25} />
        {badgeEl}
      </>
    );
  }

  if (preview || !url) {
    return (
      <div className={cls} style={bodyStyle}>
        {inner}
      </div>
    );
  }
  return (
    <a href={url} {...externalLinkProps(url)} data-track={id} className={cls} style={bodyStyle}>
      {inner}
    </a>
  );
}
