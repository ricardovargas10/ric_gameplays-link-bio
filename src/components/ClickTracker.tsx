"use client";

import { useEffect } from "react";

/** Conta visitas à página e cliques nos botões e redes (links com data-track), sem atrasar nada. */
export function ClickTracker() {
  useEffect(() => {
    // Visita: um código aleatório guardado neste navegador conta a pessoa uma vez só;
    // a visita conta uma vez por aba aberta (recarregar não soma de novo).
    try {
      let v = localStorage.getItem("ric_v");
      if (!v || !/^[a-z0-9]{16,40}$/.test(v)) {
        v = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 24);
        localStorage.setItem("ric_v", v);
      }
      const s = !sessionStorage.getItem("ric_s");
      sessionStorage.setItem("ric_s", "1");
      const body = new Blob([JSON.stringify({ v, s })], { type: "application/json" });
      if (!navigator.sendBeacon?.("/api/visita", body)) void fetch("/api/visita", { method: "POST", body, keepalive: true });
    } catch {
      /* sem armazenamento (aba anônima bloqueada): não conta, segue a página */
    }

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[data-track]");
      const id = a?.getAttribute("data-track");
      if (!id) return;
      try {
        const body = new Blob([JSON.stringify({ id })], { type: "application/json" });
        if (!navigator.sendBeacon?.("/api/clique", body)) {
          void fetch("/api/clique", { method: "POST", body, keepalive: true });
        }
      } catch {
        /* o clique segue normalmente */
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
