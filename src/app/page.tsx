import Image from "next/image";
import { cacheLife } from "next/cache";
import { LinkCard } from "@/components/LinkCard";
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
  return <PageView content={content} year={year} />;
}

function PageView({ content, year }: { content: PublicContentShape; year: number }) {
  const { page, buttons, socials } = content;

  return (
    <>
      <div className="flex justify-center">
        {page.logoMediaId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/media/${page.logoMediaId}`}
            alt="Ric Gameplays"
            className="h-auto max-h-24 w-[130px] rounded-[28px] object-contain sm:w-[190px]"
            fetchPriority="high"
          />
        ) : (
          <Image src={logo} alt="Ric Gameplays" priority sizes="190px" className="h-auto w-[130px] rounded-[28px] sm:w-[190px]" />
        )}
      </div>

      {page.headline ? (
        <p className="text-[22px] leading-[1.2] font-bold tracking-[0.05em] text-balance text-white sm:text-[30px]">
          {page.headline}
        </p>
      ) : null}

      <div className="flex flex-col gap-10">
        {groupButtons(buttons).map((group, gi) => (
          <nav key={gi} aria-label="Links" className="flex flex-col gap-3 text-left">
            {group.map((b) => (
              <LinkCard
                key={b.id}
                id={b.id}
                label={b.label}
                subtitle={b.subtitle}
                badge={b.badge}
                url={b.url}
                icon={b.icon}
                style={b.style}
                colors={b.colors}
                animation={b.animation}
              />
            ))}
          </nav>
        ))}
        <SocialRow socials={socials} />
      </div>

      {page.aboutTitle || page.aboutText ? (
        <section aria-labelledby={page.aboutTitle ? "sobre" : undefined}>
          {page.aboutTitle ? (
            <h2 id="sobre" className="text-[16px] font-semibold text-white sm:text-[19px]">
              {page.aboutTitle}
            </h2>
          ) : null}
          {page.aboutText ? (
            <p className="mx-auto mt-1.5 max-w-[400px] text-[13.5px] leading-relaxed whitespace-pre-line text-pretty text-white/90 sm:text-[15px]">
              {page.aboutText}
            </p>
          ) : null}
        </section>
      ) : null}

      <footer className="text-center text-[12px] font-medium text-white/85 sm:text-[13px]">
        {page.footer ? <p>{renderFooter(page.footer, year)}</p> : null}
      </footer>
    </>
  );
}

export default function Home() {
  return (
    <>
      <BrandBackground />
      {/* Blocos espalhados na altura da tela; com muitos botões, a página rola. */}
      <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-stretch justify-between gap-6 px-5 pt-16 pb-12 text-center sm:gap-8 sm:pt-20 sm:pb-14">
        <h1 className="sr-only">Ric Gameplays | Gameplays e lives</h1>
        {/* Conteúdo em cache: entra pronto no HTML, sem versão provisória. */}
        <Content />
      </main>
      <ClickTracker />
    </>
  );
}
