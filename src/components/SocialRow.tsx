import type { SocialData } from "@/lib/content-types";
import { externalLinkProps } from "@/lib/links";
import { BrandIcon } from "./BrandIcon";

/** Linha de ícones das redes, embaixo dos botões. */
export function SocialRow({ socials }: { socials: SocialData[] }) {
  if (socials.length === 0) return null;
  return (
    <nav aria-label="Redes sociais">
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        {socials.map((s) => (
          <li key={s.id}>
            <a
              href={s.url}
              {...externalLinkProps(s.url)}
              data-track={s.id}
              aria-label={s.label}
              title={s.label}
              className="flex size-11 items-center justify-center rounded-xl text-white transition-opacity duration-150 hover:opacity-75"
            >
              <BrandIcon icon={s.icon} className="size-[23px]" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
