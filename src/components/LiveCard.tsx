import { IconChevronRight } from "@tabler/icons-react";
import type { LiveStream } from "@/lib/feeds";
import { externalLinkProps } from "@/lib/links";

/** Cartão "Ao vivo agora": thumb da live com uma luz girando em volta do cartão (no lugar da sombra). */
export function LiveCard({ live }: { live: LiveStream }) {
  return (
    <a href={live.url} {...externalLinkProps(live.url)} className="live-card group relative block rounded-[20px] p-[3px] text-left">
      <span aria-hidden className="live-glow" />
      <span className="relative block overflow-hidden rounded-[18px] bg-white text-raisin">
        <span className="relative block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={live.thumb} alt="" className="block aspect-video w-full object-cover" />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[#e91916] px-2.5 py-1 text-[11px] leading-none font-bold tracking-[0.08em] text-white uppercase">
            <span aria-hidden className="live-dot size-1.5 rounded-full bg-white" />
            Ao vivo
          </span>
          {live.viewers > 0 ? (
            <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11.5px] leading-none font-semibold text-white">
              {live.viewers.toLocaleString("pt-BR")} assistindo
            </span>
          ) : null}
        </span>
        <span className="flex items-center gap-3 px-4 pt-3.5 pb-4">
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[17px] leading-[1.25] font-semibold">Estou ao vivo agora na Twitch</span>
            <span className="mt-[3px] line-clamp-2 text-[13.5px] leading-[1.35] text-admin-muted">
              {live.game ? `${live.game} · ` : ""}
              {live.title}
            </span>
          </span>
          <IconChevronRight aria-hidden className="size-5 shrink-0 text-sunset" stroke={2.25} />
        </span>
      </span>
    </a>
  );
}
