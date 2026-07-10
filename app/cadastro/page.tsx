"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const supabase = createClient();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      setCarregando(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErro(
        error.message.includes("already registered")
          ? "Este e-mail já está cadastrado. Tente entrar."
          : "Não foi possível criar sua conta. Tente novamente."
      );
      setCarregando(false);
      return;
    }

    setSucesso(true);
    setCarregando(false);
  }

  if (sucesso) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-16 text-center">
        <span className="mb-4 text-4xl" aria-hidden>🌸</span>
        <h1 className="mb-2 font-display text-2xl text-ink">Quase lá!</h1>
        <p className="font-body text-sm text-muted">
          Enviamos um link de confirmação para <strong>{email}</strong>. Abra seu e-mail para
          ativar sua conta e começar sua jornada.
        </p>
        <Link href="/login" className="mt-8 font-body text-sm text-sage-dark hover:underline">
          Voltar para o login
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-lg text-ink">
        14 dias<span className="text-rose-dark">.</span>
      </Link>
      <h1 className="mb-1 font-display text-2xl text-ink">Comece sua jornada</h1>
      <p className="mb-8 font-body text-sm text-muted">14 dias, no seu tempo, para você.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="nome" className="mb-1.5 block font-body text-sm text-ink">
            Nome
          </label>
          <input
            id="nome"
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 font-body text-sm text-ink outline-none transition focus:border-sage"
            placeholder="Como podemos te chamar?"
          />
        </div>

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
          <label htmlFor="senha" className="mb-1.5 block font-body text-sm text-ink">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 font-body text-sm text-ink outline-none transition focus:border-sage"
            placeholder="Mínimo de 6 caracteres"
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
          {carregando ? "Criando conta..." : "Criar minha conta"}
        </button>
      </form>

      <p className="mt-8 text-center font-body text-sm text-muted">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-semibold text-sage-dark hover:underline">
          Entrar
        </Link>
      </p>
    </main>
  );
}
