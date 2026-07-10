"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RedefinirSenhaPage() {
  const supabase = createClient();
  const router = useRouter();

  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });

    if (error) {
      setErro("Não foi possível redefinir sua senha. Solicite um novo link.");
      setCarregando(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 font-display text-lg text-ink">
        14 dias<span className="text-rose-dark">.</span>
      </Link>
      <h1 className="mb-1 font-display text-2xl text-ink">Defina uma nova senha</h1>
      <p className="mb-8 font-body text-sm text-muted">Escolha uma senha nova e segura.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="senha" className="mb-1.5 block font-body text-sm text-ink">
            Nova senha
          </label>
          <input
            id="senha"
            type="password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 font-body text-sm text-ink outline-none transition focus:border-sage"
          />
        </div>
        <div>
          <label htmlFor="confirmar" className="mb-1.5 block font-body text-sm text-ink">
            Confirmar nova senha
          </label>
          <input
            id="confirmar"
            type="password"
            required
            minLength={6}
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 font-body text-sm text-ink outline-none transition focus:border-sage"
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
          {carregando ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </main>
  );
}
