"use client";

import { IconAlertTriangle } from "@tabler/icons-react";

/** Quando os links não carregam. */
export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-sunset px-5">
      <div role="alert" className="w-full max-w-[340px] rounded-[18px] bg-cream px-5 py-6 text-center text-raisin">
        <IconAlertTriangle aria-hidden className="mx-auto size-6 text-danger" stroke={2} />
        <p className="mt-2 text-[15px] font-semibold">Os links não carregaram</p>
        <p className="mt-1 text-[13.5px] leading-[1.4] text-admin-muted">Pode ser a conexão. Tente de novo em instantes.</p>
        <button type="button" onClick={reset} className="mt-4 min-h-11 w-full rounded-[14px] bg-raisin px-4 text-[15px] font-semibold text-white">
          Tentar de novo
        </button>
      </div>
    </main>
  );
}
