"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Navbar({ nome }: { nome?: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-rose-light/60 bg-bg/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="font-display text-lg tracking-tight text-ink">
          14 dias<span className="text-rose-dark">.</span>
        </Link>
        <div className="flex items-center gap-4">
          {nome && (
            <span className="hidden font-body text-sm text-muted sm:inline">
              Olá, {nome.split(" ")[0]}
            </span>
          )}
          <button
            onClick={sair}
            className="rounded-full border border-ink/10 px-4 py-1.5 font-body text-sm text-ink transition hover:border-rose-dark hover:text-rose-dark"
          >
            Sair
          </button>
        </div>
      </nav>
    </header>
  );
}
