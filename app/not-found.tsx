import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 text-4xl" aria-hidden>
        🌙
      </span>
      <h1 className="font-display text-2xl text-ink">Página não encontrada</h1>
      <p className="mt-2 font-body text-sm text-muted">
        Esse dia ainda não faz parte da sua jornada.
      </p>
      <Link href="/dashboard" className="mt-6 font-body text-sm text-sage-dark hover:underline">
        Voltar para o painel
      </Link>
    </main>
  );
}
