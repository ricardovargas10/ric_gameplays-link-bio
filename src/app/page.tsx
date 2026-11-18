import Image from "next/image";
import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { LinkCard } from "@/components/LinkCard";
import { LiveCard } from "@/components/LiveCard";
import { getLatestVideo, getLiveStream, type LatestVideo, type LiveStream } from "@/lib/feeds";
import { SocialRow } from "@/components/SocialRow";
import { ClickTracker } from "@/components/ClickTracker";
import { BrandBackground } from "@/components/BrandBackground";
import { getPublicContent } from "@/lib/content";
import {
  renderFooter,
  groupButtons,
  type PublicContentShape,
} from "@/lib/content-types";
import { spYear } from "@/lib/time";
import logo from "../../public/brand/logo.png";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return spYear(new Date());
}

/** A página inteira, com os textos, botões e redes salvos no painel. */
async function Content() {
  const [content, year] = await Promise.all([getPublicContent(), currentYear()]);
  const live = content.page.autoLive ? await getLiveStream() : null;
  // Durante a live (no cartão), o último vídeo fica escondido para não confundir; volta quando o cartão some.
  const video = !live && content.page.autoVideo ? await getLatestVideo() : null;
  return <PageView content={content} year={year} live={live} video={video} />;
}

type Btn = PublicContentShape["buttons"][number];

/** Junta botões seguidos em meia largura na mesma linha (2 por linha). */
function rows(items: Btn[]): Btn[][] {
  const out: Btn[][] = [];
  for (const b of items) {
    const last = out[out.length - 1];
    if (b.half && last && last.length === 1 && last[0].half) last.push(b);
    else out.push([b]);
  }
  return out;
}

function Card({ b }: { b: Btn }) {
  return (
    <LinkCard
      id={b.id}
      label={b.label}
      subtitle={b.subtitle}
      badge={b.badge}
      url={b.url}
      icon={b.icon}
      style={b.style}
      colors={b.colors}
      animation={b.animation}
      half={b.half}
    />
  );
}

function PageView({ content, year, live, video }: { content: PublicContentShape; year: number; live: LiveStream | null; video: LatestVideo | null }) {
  const { page, buttons, socials } = content;
  const groups = groupButtons(buttons);

  return (
    <>
      <div className="flex justify-center">
        {page.logoMediaId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/media/${page.logoMediaId}`} alt="Ric Gameplays" className="size-28 rounded-[28px] object-contain" fetchPriority="high" />
        ) : (
          <Image src={logo} alt="Ric Gameplays" priority sizes="112px" className="size-28 rounded-[28px] object-contain" />
        )}
      </div>

      {page.headline ? (
        <p className="mx-auto mt-[18px] max-w-[300px] text-[25px] leading-[1.18] font-bold tracking-[0.01em] text-balance text-white">{page.headline}</p>
      ) : null}

      <div className="mt-[30px] text-left">
        {live || video ? (
          <div className={`flex flex-col gap-4 ${groups.length ? "mb-[26px]" : ""}`}>
            {live ? <LiveCard live={live} /> : null}
            {video ? (
              <LinkCard label="Assista meu último vídeo" subtitle={video.title} url={video.url} icon={{ type: "none" }} iconPreviewSrc={video.thumb} style="featured" animation="none" />
            ) : null}
          </div>
        ) : null}
        {groups.map((g, gi) => (
          <nav key={gi} aria-label={g.title ?? "Links"} className={gi === 0 ? "" : "mt-[26px]"}>
            {g.title ? <p className="mb-2 text-[12px] font-bold tracking-[0.08em] text-white/75 uppercase">{g.title}</p> : null}
            <div className="flex flex-col gap-2.5">
              {rows(g.items).map((r) =>
                r.length === 2 ? (
                  <div key={r[0].id} className="grid grid-cols-2 gap-2.5">
                    <Card b={r[0]} />
                    <Card b={r[1]} />
                  </div>
                ) : (
                  <Card key={r[0].id} b={r[0]} />
                ),
              )}
            </div>
          </nav>
        ))}
      </div>

      <div className="mt-7">
        <SocialRow socials={socials} />
      </div>

      {page.aboutTitle || page.aboutText ? (
        <section aria-labelledby={page.aboutTitle ? "sobre" : undefined} className="mx-auto mt-7 max-w-[320px]">
          {page.aboutTitle ? (
            <h2 id="sobre" className="text-[15px] font-semibold text-white">
              {page.aboutTitle}
            </h2>
          ) : null}
          {page.aboutText ? (
            <p className="mt-1 text-[13.5px] leading-[1.5] whitespace-pre-line text-pretty text-white/[0.88]">{page.aboutText}</p>
          ) : null}
        </section>
      ) : null}

      <footer className="mt-[18px] text-center text-[12px] font-medium text-white/[0.78]">
        {page.footer ? <p>{renderFooter(page.footer, year)}</p> : null}
      </footer>
    </>
  );
}

/** Esqueleto no formato final, enquanto o conteúdo não chega. */
function Skeleton() {
  return (
    <div aria-hidden className="animate-pulse motion-reduce:animate-none">
      <div className="mx-auto size-28 rounded-[28px] bg-white/25" />
      <div className="mx-auto mt-[18px] h-[60px] max-w-[300px] rounded-xl bg-white/20" />
      <div className="mt-[30px] h-[110px] rounded-[18px] bg-white/[0.28]" />
      <div className="mt-[26px] h-[58px] rounded-2xl bg-white/[0.22]" />
      <div className="mt-2.5 h-[58px] rounded-2xl bg-white/[0.16]" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <BrandBackground />
      <main className="mx-auto w-full max-w-[480px] px-5 pt-10 pb-7 text-center">
        <h1 className="sr-only">Ric Gameplays | Gameplays e lives</h1>
        <Suspense fallback={<Skeleton />}>
          <Content />
        </Suspense>
      </main>
      <ClickTracker />
    </>
  );
}
