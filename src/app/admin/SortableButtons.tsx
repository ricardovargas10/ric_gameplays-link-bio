"use client";

import { GripVertical } from "lucide-react";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { reorderButtonsAction } from "./actions";

type Item = { id: string; node: ReactNode };
type Group = { label: string; items: Item[] };

/**
 * Lista do painel em blocos. Arraste pela alça (mouse ou dedo) para mudar a ordem dentro do bloco.
 * A tela muda na hora; o salvamento acontece por trás.
 */
export function SortableButtons({ groups: initial }: { groups: Group[] }) {
  const [groups, setGroups] = useState(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const refs = useRef(new Map<string, HTMLLIElement>());
  const latest = useRef(groups);
  latest.current = groups;

  function save(next: Group[]) {
    const ids = next.flatMap((g) => g.items.map((i) => i.id));
    startTransition(() => reorderButtonsAction(ids));
  }

  function onPointerDown(e: React.PointerEvent, gi: number, id: string) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(id);
    const before = latest.current;

    const move = (ev: PointerEvent) => {
      const list = latest.current[gi].items;
      const from = list.findIndex((x) => x.id === id);
      // Nova posição = quantos outros cartões têm o meio acima do dedo/mouse.
      const to = list.filter((x) => {
        if (x.id === id) return false;
        const r = refs.current.get(x.id)?.getBoundingClientRect();
        return !!r && r.top + r.height / 2 < ev.clientY;
      }).length;
      if (to === from) return;
      const items = [...list];
      const [it] = items.splice(from, 1);
      items.splice(to, 0, it);
      setGroups((g) => g.map((x, k) => (k === gi ? { ...x, items } : x)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      setDragging(null);
      const now = latest.current;
      const changed = now[gi].items.map((x) => x.id).join() !== before[gi].items.map((x) => x.id).join();
      if (changed) save(now);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }

  return (
    <div className="mt-8 flex flex-col gap-12">
      {groups.map((g, gi) =>
        g.items.length === 0 ? null : (
          <section key={g.label}>
            <h2 className="text-[13px] font-semibold tracking-wide text-raisin/60 uppercase">{g.label}</h2>
            <ol className="mt-3 flex flex-col gap-4">
              {g.items.map((it) => (
                <li
                  key={it.id}
                  ref={(el) => {
                    if (el) refs.current.set(it.id, el);
                    else refs.current.delete(it.id);
                  }}
                  className={`relative rounded-3xl border-2 bg-white p-4 transition-shadow ${
                    dragging === it.id ? "z-10 border-raisin shadow-xl" : "border-raisin/10"
                  }`}
                >
                  <button
                    type="button"
                    aria-label="Arrastar para mudar a ordem"
                    title="Arrastar para mudar a ordem"
                    onPointerDown={(e) => onPointerDown(e, gi, it.id)}
                    className="absolute top-3 right-3 flex size-11 cursor-grab touch-none items-center justify-center rounded-2xl border-2 border-raisin/20 bg-white active:cursor-grabbing"
                  >
                    <GripVertical className="size-5" aria-hidden />
                  </button>
                  {it.node}
                </li>
              ))}
            </ol>
          </section>
        ),
      )}
    </div>
  );
}
