/**
 * Tipos e regras do conteúdo editável pelo painel (botões, redes, página).
 * Pode ser usado no navegador e no servidor (sem segredos aqui).
 */
import { z } from "zod";
import { ICON_NAMES } from "./icon-names";

// ---------- Links ----------

/** Aceita "wa.me/..." e "www..." sem https e completa o endereço. */
export function normalizeUrl(raw: string): string {
  const v = raw.trim();
  if (/^(www\.)?wa\.me\//i.test(v)) return `https://${v}`;
  if (/^www\./i.test(v)) return `https://${v}`;
  return v;
}

/** Só https:// (inclui wa.me), mailto: e tel: são aceitos. */
export function isAllowedUrl(value: string): boolean {
  let u: URL;
  try {
    u = new URL(value);
  } catch {
    return false;
  }
  if (u.protocol === "https:") return u.hostname.includes(".") && !u.username && !u.password;
  if (u.protocol === "mailto:") {
    try {
      return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(decodeURIComponent(u.pathname));
    } catch {
      return false;
    }
  }
  if (u.protocol === "tel:") return /^\+?[0-9 ()-]{6,20}$/.test(decodeURIComponent(u.pathname));
  return false;
}

const urlField = z
  .string()
  .trim()
  .min(1, { error: "Coloque o link." })
  .max(2000, { error: "Link muito longo." })
  .transform(normalizeUrl)
  .refine(isAllowedUrl, { error: "Link inválido. Use https://, wa.me/, mailto: ou tel:" });

const isoDate = z.string().refine((v) => !Number.isNaN(Date.parse(v)));
const idField = z.string().regex(/^[a-z0-9-]{1,64}$/);

/** Link opcional: vazio vira botão sem link. */
const optionalUrlField = z
  .string()
  .trim()
  .max(2000, { error: "Link muito longo." })
  .transform((v) => (v === "" ? "" : normalizeUrl(v)))
  .refine((v) => v === "" || isAllowedUrl(v), { error: "Link inválido. Use https://, wa.me/, mailto: ou tel:" });

// ---------- Ícones ----------

export const iconSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("none") }),
  z.object({ type: z.literal("lib"), name: z.enum(ICON_NAMES) }),
  z.object({ type: z.literal("custom"), mediaId: idField }),
]);
export type IconRef = z.infer<typeof iconSchema>;

// ---------- Botões ----------

export const BUTTON_STYLES = ["white", "orange", "blue", "lilac", "purple", "featured"] as const;
export type ButtonStyle = (typeof BUTTON_STYLES)[number];
export const STYLE_LABELS: Record<ButtonStyle, string> = {
  white: "Branco",
  orange: "Vermelho",
  blue: "Azul",
  lilac: "Lilás",
  purple: "Grafite",
  featured: "Destaque com thumb",
};

export const ANIMATIONS = ["none", "shine", "pulse", "both"] as const;
export type Animation = (typeof ANIMATIONS)[number];
export const ANIMATION_LABELS: Record<Animation, string> = {
  none: "Sem animação",
  shine: "Brilho",
  pulse: "Pulso",
  both: "Brilho + pulso",
};

export const LIMITS = { label: 60, subtitle: 80, badge: 16, headline: 140, highlight: 60, aboutTitle: 60, aboutText: 600, footer: 80, socialLabel: 40, groupTitle: 24 } as const;

const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i);
export const colorsSchema = z.object({
  bg: hexColor.nullable().default(null),
  text: hexColor.nullable().default(null),
  icon: hexColor.nullable().default(null),
});
export type ButtonColors = z.infer<typeof colorsSchema>;
export const NO_COLORS: ButtonColors = { bg: null, text: null, icon: null };

export const buttonSchema = z.object({
  id: idField,
  label: z.string().min(1).max(LIMITS.label),
  subtitle: z.string().max(LIMITS.subtitle).nullable(),
  url: z.string().max(2000).refine((v) => v === "" || isAllowedUrl(v)),
  icon: iconSchema,
  style: z.enum(BUTTON_STYLES),
  colors: colorsSchema.default(NO_COLORS),
  /** Começa um novo bloco: espaço maior acima deste botão. */
  gapBefore: z.boolean().default(false),
  /** Título do grupo que começa neste botão. Só é usado quando gapBefore = true. */
  groupTitle: z.string().max(24).nullable().default(null),
  /** Ocupa metade da largura e divide a linha com o próximo botão também em meia largura. */
  half: z.boolean().default(false),
  animation: z.enum(ANIMATIONS),
  badge: z.string().max(LIMITS.badge).nullable(),
  visible: z.boolean(),
  startsAt: isoDate.nullable(),
  endsAt: isoDate.nullable(),
  createdAt: isoDate,
  updatedAt: isoDate,
});
export type LinkButtonData = z.infer<typeof buttonSchema>;

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, { error: `${label} pode ter no máximo ${max} caracteres.` })
    .transform((v) => (v === "" ? null : v));

/** O que chega do formulário do botão (datas já em ISO, ícone já resolvido). */
export const buttonInputSchema = z
  .object({
    label: z
      .string()
      .trim()
      .min(1, { error: "Escreva o texto do botão." })
      .max(LIMITS.label, { error: `O texto pode ter no máximo ${LIMITS.label} caracteres.` }),
    subtitle: optionalText(LIMITS.subtitle, "O subtítulo"),
    url: optionalUrlField,
    style: z.enum(BUTTON_STYLES, { error: "Escolha um estilo." }),
    colors: colorsSchema,
    gapBefore: z.boolean(),
    groupTitle: optionalText(24, "O título do grupo").default(null),
    half: z.boolean().default(false),
    animation: z.enum(ANIMATIONS, { error: "Escolha a animação." }),
    badge: optionalText(LIMITS.badge, "O selo"),
    visible: z.boolean(),
    startsAt: isoDate.nullable(),
    endsAt: isoDate.nullable(),
    position: z.number().int().min(1).max(1000),
  })
  .refine((v) => !v.startsAt || !v.endsAt || Date.parse(v.endsAt) > Date.parse(v.startsAt), {
    error: "A data de fim precisa ser depois da data de início.",
    path: ["endsAt"],
  });

export type ButtonStatus = "no-ar" | "agendado" | "encerrado" | "oculto";

export function buttonStatus(b: Pick<LinkButtonData, "visible" | "startsAt" | "endsAt">, now: number): ButtonStatus {
  if (!b.visible) return "oculto";
  if (b.endsAt && Date.parse(b.endsAt) <= now) return "encerrado";
  if (b.startsAt && Date.parse(b.startsAt) > now) return "agendado";
  return "no-ar";
}

// ---------- Redes (linha de ícones) ----------

export const socialSchema = z.object({
  id: idField,
  icon: iconSchema,
  label: z.string().min(1).max(LIMITS.socialLabel),
  url: z.string().max(2000).refine(isAllowedUrl),
  visible: z.boolean(),
});
export type SocialData = z.infer<typeof socialSchema>;

export const socialInputSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, { error: "Escreva o nome da rede (ex.: Instagram)." })
    .max(LIMITS.socialLabel, { error: `O nome pode ter no máximo ${LIMITS.socialLabel} caracteres.` }),
  url: urlField,
  visible: z.boolean(),
});

// ---------- Página ----------

export const pageSchema = z.object({
  logoMediaId: idField.nullable(),
  headline: z.string().max(LIMITS.headline),
  highlight: z.string().max(LIMITS.highlight),
  aboutTitle: z.string().max(LIMITS.aboutTitle),
  aboutText: z.string().max(LIMITS.aboutText),
  footer: z.string().max(LIMITS.footer),
});
export type PageData = z.infer<typeof pageSchema>;

export const pageInputSchema = z.object({
  headline: z
    .string()
    .trim()
    .max(LIMITS.headline, { error: `O texto de cima pode ter no máximo ${LIMITS.headline} caracteres.` }),
  highlight: z
    .string()
    .trim()
    .max(LIMITS.highlight, { error: `O destaque pode ter no máximo ${LIMITS.highlight} caracteres.` }),
  aboutTitle: z
    .string()
    .trim()
    .max(LIMITS.aboutTitle, { error: `O título pode ter no máximo ${LIMITS.aboutTitle} caracteres.` }),
  aboutText: z
    .string()
    .trim()
    .max(LIMITS.aboutText, { error: `O texto pode ter no máximo ${LIMITS.aboutText} caracteres.` }),
  footer: z
    .string()
    .trim()
    .max(LIMITS.footer, { error: `O rodapé pode ter no máximo ${LIMITS.footer} caracteres.` }),
});

/** Divide o texto de cima em antes / destaque / depois (destaque na caixa azul). */
export function splitHeadline(headline: string, highlight: string): [string, string, string] {
  const h = highlight.trim();
  const i = h ? headline.indexOf(h) : -1;
  if (i < 0) return [headline, "", ""];
  return [headline.slice(0, i), h, headline.slice(i + h.length)];
}

/** Rodapé: {ano} vira o ano atual. */
export function renderFooter(footer: string, year: number): string {
  return footer.replaceAll("{ano}", String(year));
}

// ---------- Valores iniciais ----------

const T0 = "2026-11-11T00:00:00.000Z";

export const DEFAULT_PAGE: PageData = {
  logoMediaId: null,
  headline: "Bem-vindo ao Ric Gameplays",
  highlight: "Ric Gameplays",
  aboutTitle: "Sobre o Ric",
  aboutText:
    "Gameplays, lives e muita resenha. Escreva aqui um texto sobre o canal.",
  footer: "@ric_gameplays · {ano}",
};

const base = { subtitle: null, style: "white", colors: NO_COLORS, gapBefore: false, groupTitle: null, half: false, animation: "none", badge: null, visible: true, startsAt: null, endsAt: null, createdAt: T0, updatedAt: T0 } as const;

export function defaultButtons(_formUrl?: string): LinkButtonData[] {
  void _formUrl;
  const b = (id: string, label: string, url: string, icon: IconRef, extra: Partial<LinkButtonData> = {}): LinkButtonData => ({ ...base, id, label, url, icon, ...extra });
  const yt = { type: "lib", name: "youtube" } as const;
  return [
    b("padrao-video", "Assista meu último vídeo", "https://www.youtube.com/@ric_gameplays", { type: "none" }, { style: "featured", subtitle: "Bah City · no canal de vlogs", badge: "Novo" }),
    b("padrao-twitch", "Twitch", "https://www.twitch.tv/ric_gameplays", { type: "lib", name: "twitch" }, { subtitle: "A live acontece aqui", gapBefore: true, groupTitle: "Ao vivo" }),
    b("padrao-lives", "Canal de Lives", "https://www.youtube.com/@ric_gameplays", yt, { subtitle: "As lives completas, depois que acabam" }),
    b("padrao-gameplays", "Canal de Gameplays", "https://www.youtube.com/@ric_gameplays", yt, { subtitle: "Séries de jogos, episódio por episódio", gapBefore: true, groupTitle: "Vídeos" }),
    b("padrao-vlogs", "Canal de Vlogs", "https://www.youtube.com/@ric_gameplays", yt, { subtitle: "Vida, trabalho, rotina e bastidor" }),
    b("padrao-discord", "Discord", "https://discord.com", { type: "lib", name: "discord" }, { half: true, gapBefore: true, groupTitle: "Comunidade" }),
    b("padrao-playlist", "Playlist", "https://open.spotify.com", { type: "lib", name: "spotify" }, { half: true }),
    b("padrao-aviso", "Live todo dia às 19h", "", { type: "lib", name: "calendario" }, { gapBefore: true }),
  ];
}

export const DEFAULT_SOCIALS: SocialData[] = [
  { id: "rede-instagram", icon: { type: "lib", name: "instagram" }, label: "Instagram", url: "https://www.instagram.com/ric_gameplays/", visible: true },
];

/** O que a página pública recebe (mesmo formato no servidor e no navegador). */
export type PublicContentShape = {
  page: PageData;
  buttons: LinkButtonData[];
  socials: SocialData[];
};

/** Quebra a lista em grupos só onde "Começa um grupo aqui" está ligado, mantendo a ordem do painel. */
export function groupButtons<T extends Pick<LinkButtonData, "gapBefore" | "groupTitle">>(
  list: T[],
): { title: string | null; items: T[] }[] {
  const out: { title: string | null; items: T[] }[] = [];
  for (const b of list) {
    if (out.length === 0 || b.gapBefore) out.push({ title: b.gapBefore ? (b.groupTitle ?? null) : null, items: [b] });
    else out[out.length - 1].items.push(b);
  }
  return out;
}
