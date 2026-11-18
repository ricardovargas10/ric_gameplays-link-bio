import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/session";
import { readButtons } from "@/lib/content";
import { isoToSpLocal } from "@/lib/time";
import { ButtonForm, type ButtonFormValues } from "../../ButtonForm";

export const instant = false;

export default async function ButtonEditPage({ params }: PageProps<"/admin/botao/[id]">) {
  const base = await requireAdminPage();
  const { id } = await params;
  const list = await readButtons();
  const isNew = id === "novo";
  const index = isNew ? -1 : list.findIndex((b) => b.id === id);
  if (!isNew && index < 0) notFound();
  const b = isNew ? null : list[index];

  const initial: ButtonFormValues = b
    ? {
        id: b.id,
        label: b.label,
        subtitle: b.subtitle ?? "",
        url: b.url,
        icon: b.icon,
        style: b.style,
        colors: b.colors,
        gapBefore: b.gapBefore,
        groupTitle: b.groupTitle ?? "",
        half: b.half,
        animation: b.animation,
        badge: b.badge ?? "",
        visible: b.visible,
        startsAt: isoToSpLocal(b.startsAt),
        endsAt: isoToSpLocal(b.endsAt),
        position: index + 1,
      }
    : {
        label: "",
        subtitle: "",
        url: "",
        icon: { type: "lib", name: "link" },
        style: "white",
        colors: { bg: null, text: null, icon: null },
        gapBefore: false,
        groupTitle: "",
        half: false,
        animation: "none",
        badge: "",
        visible: true,
        startsAt: "",
        endsAt: "",
        position: 1,
      };

  return (
    <ButtonForm base={base} title={b ? "Editar botão" : "Novo botão"} initial={initial} maxPosition={isNew ? list.length + 1 : list.length} />
  );
}
