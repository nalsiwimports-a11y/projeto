"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarSenhaPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/redefinir-senha`,
    });

    if (error) {
      setErro("Não foi possível enviar o link. Verifique o e-mail informado.");
      setCarregando(false);
      return;
    }

    setEnviado(true);
    setCarregando(false);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-lg text-ink">
        14 dias<span className="text-rose-dark">.</span>
      </Link>

      {enviado ? (
        <div className="text-center">
          <span className="mb-4 block text-4xl" aria-hidden>💌</span>
          <h1 className="mb-2 font-display text-2xl text-ink">Link enviado</h1>
          <p className="font-body text-sm text-muted">
            Se <strong>{email}</strong> estiver cadastrado, você receberá um e-mail com
            instruções para redefinir sua senha.
          </p>
        </div>
      ) : (
        <>
          <h1 className="mb-1 font-display text-2xl text-ink">Recuperar senha</h1>
          <p className="mb-8 font-body text-sm text-muted">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
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
              {carregando ? "Enviando..." : "Enviar link de recuperação"}
            </button>
          </form>
        </>
      )}

      <Link href="/login" className="mt-8 text-center font-body text-sm text-sage-dark hover:underline">
        Voltar para o login
      </Link>
    </main>
  );
}
