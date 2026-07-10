"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setErro("E-mail ou senha incorretos. Tente novamente.");
      setCarregando(false);
      return;
    }

    const redirect = searchParams.get("redirect") || "/dashboard";
    router.push(redirect);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block font-body text-sm text-ink">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 font-body text-sm text-ink outline-none transition focus:border-sage"
          placeholder="voce@email.com"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="senha" className="block font-body text-sm text-ink">
            Senha
          </label>
          <Link href="/recuperar-senha" className="font-body text-xs text-rose-dark hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        <input
          id="senha"
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 font-body text-sm text-ink outline-none transition focus:border-sage"
          placeholder="••••••••"
        />
      </div>

      {erro && (
        <p role="alert" className="rounded-xl bg-rose-light px-4 py-2.5 font-body text-sm text-rose-dark">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="mt-2 rounded-full bg-sage px-6 py-3 font-body text-sm font-semibold text-white transition hover:bg-sage-dark disabled:opacity-60"
      >
        {carregando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-lg text-ink">
        14 dias<span className="text-rose-dark">.</span>
      </Link>
      <h1 className="mb-1 font-display text-2xl text-ink">Bem-vinda de volta</h1>
      <p className="mb-8 font-body text-sm text-muted">Continue sua jornada de autocuidado.</p>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="mt-8 text-center font-body text-sm text-muted">
        Ainda não tem uma conta?{" "}
        <Link href="/cadastro" className="font-semibold text-sage-dark hover:underline">
          Cadastre-se
        </Link>
      </p>
    </main>
  );
}
