import type { CSSProperties, ReactNode } from "react";
import { NO_COLORS, type Animation, type ButtonColors, type ButtonStyle, type IconRef } from "@/lib/content-types";
import { externalLinkProps } from "@/lib/links";
import { BrandIcon } from "./BrandIcon";

const STYLES: Record<ButtonStyle, { body: string; icon: string; ring: string; shine: string }> = {
  white: {
    body: "bg-white text-raisin border-2 border-raisin/10 group-hover:border-sunset group-active:border-sunset",
    icon: "text-sunset",
    ring: "border-sunset",
    shine: "promo-shine-warm",
  },
  // Fundo vermelho: texto branco.
  orange: { body: "bg-sunset text-white", icon: "text-white", ring: "border-sunset", shine: "" },
  blue: { body: "bg-sky text-raisin", icon: "text-raisin", ring: "border-sky", shine: "" },
  lilac: { body: "bg-lilac text-raisin", icon: "text-raisin", ring: "border-lilac", shine: "" },
  purple: { body: "bg-raisin text-cream", icon: "text-sunset", ring: "border-raisin", shine: "" },
  featured: { body: "bg-white text-raisin", icon: "text-sunset", ring: "border-white", shine: "promo-shine-warm" },
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
  /** Na pré-visualização do painel o botão não navega. */
  preview?: boolean;
  /** Pré-visualização de uma imagem ainda não salva. */
  iconPreviewSrc?: string | null;
};

export function LinkCard({ id, label, subtitle, badge, url, icon, style, colors = NO_COLORS, animation, preview, iconPreviewSrc }: LinkCardProps) {
  const s = STYLES[style] ?? STYLES.white;
  const shine = animation === "shine" || animation === "both";
  const pulse = animation === "pulse" || animation === "both";
  const bodyStyle: CSSProperties = {
    ...(colors.bg ? { backgroundColor: colors.bg, borderColor: colors.bg } : {}),
    ...(colors.text ? { color: colors.text } : {}),
  };
  const iconStyle: CSSProperties = colors.icon ? { color: colors.icon } : {};
  const ring = pulse ? <span aria-hidden className={`promo-ring ${s.ring}`} style={colors.bg ? { borderColor: colors.bg } : undefined} /> : null;
  const badgeEl = badge ? (
    <span className="absolute -top-3 right-5 z-10 rotate-2 rounded-full border-2 border-raisin bg-cream px-3 py-0.5 text-[11px] leading-5 font-semibold tracking-wide text-raisin uppercase sm:text-[12px]">
      {badge}
    </span>
  ) : null;

  let inner: ReactNode;
  if (style === "featured") {
    // Cartão no estilo galeria do Notion: thumb grande em cima, faixa com o título embaixo.
    const thumb = iconPreviewSrc ?? (icon.type === "custom" ? `/media/${icon.mediaId}` : null);
    inner = (
      <>
        {ring}
        <span className={`promo-body items-stretch! overflow-hidden rounded-[14px] text-left shadow-[0_8px_24px_rgba(0,0,0,0.25)] ${s.body}`} style={bodyStyle}>
          {shine ? <span aria-hidden className={`promo-shine ${s.shine}`} /> : null}
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="aspect-video w-full object-cover" />
          ) : (
            <span className="flex aspect-video w-full items-center justify-center bg-raisin/10 text-[13px] opacity-70">
              Envie a thumb no campo &quot;Ícone&quot;
            </span>
          )}
          <span className="flex w-full flex-col px-4 py-3">
            <span className="text-[15px] leading-snug font-semibold break-words sm:text-[16px]">{label || "Texto do botão"}</span>
            {subtitle ? <span className="mt-0.5 text-[13px] leading-snug break-words opacity-75 sm:text-[14px]">{subtitle}</span> : null}
          </span>
        </span>
        {badgeEl}
      </>
    );
  } else {
    const hasIcon = icon.type !== "none" || !!iconPreviewSrc;
    inner = (
      <>
        {ring}
        <span
          className={`promo-body min-h-[50px] rounded-[20px] py-2.5 text-center sm:min-h-14 sm:rounded-[22px] sm:py-3 ${
            hasIcon ? "px-12 sm:px-14" : "px-5 sm:px-6"
          } ${s.body}`}
          style={bodyStyle}
        >
          {shine ? <span aria-hidden className={`promo-shine ${s.shine}`} /> : null}
          {hasIcon ? (
            <span style={iconStyle} className={`absolute top-1/2 left-4 flex -translate-y-1/2 sm:left-5 ${colors.icon ? "" : s.icon}`}>
              <BrandIcon icon={icon} previewSrc={iconPreviewSrc} className="size-5 sm:size-6" />
            </span>
          ) : null}
          <span className="text-[15px] leading-snug font-semibold break-words sm:text-[16px]">{label || "Texto do botão"}</span>
          {subtitle ? <span className="mt-0.5 text-[13px] leading-snug font-medium break-words opacity-85 sm:text-[14px]">{subtitle}</span> : null}
        </span>
        {badgeEl}
      </>
    );
  }

  // Sem link (ou na prévia do painel): só mostra, sem clique.
  if (preview || !url) return <div className="promo group">{inner}</div>;
  return (
    <a href={url} {...externalLinkProps(url)} data-track={id} className="promo group">
      {inner}
    </a>
  );
}
