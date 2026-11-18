import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminNav } from "./AdminNav";
import { ListSkeleton } from "./Skeleton";
import { logoutAction } from "./actions";

// O painel sempre depende da sessão; não precisa de navegação instantânea.
export const instant = false;

export const metadata: Metadata = {
  title: "Painel",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  referrer: "same-origin",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh bg-admin-bg text-raisin">
      <Suspense fallback={null}>
        <AdminNav logout={logoutAction} />
      </Suspense>
      <div className="mx-auto w-full max-w-xl px-4 pt-6 pb-16">
        <Suspense fallback={<ListSkeleton />}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}
