import Link from "next/link";

const PILARES = [
  {
    titulo: "Corpo",
    texto: "Movimento leve e nutrição gentil, no seu ritmo, sem cobrança.",
    cor: "bg-sage-light text-sage-dark",
  },
  {
    titulo: "Mente",
    texto: "Exercícios emocionais curtos para nomear e acolher o que você sente.",
    cor: "bg-rose-light text-rose-dark",
  },
  {
    titulo: "Rotina",
    texto: "Um checklist diário simples, pensado para caber numa rotina com bebê.",
    cor: "bg-gold-light text-ink",
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col px-6 pb-24">
      <header className="flex items-center justify-between py-8">
        <span className="font-display text-lg text-ink">14 dias<span className="text-rose-dark">.</span></span>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="font-body text-sm text-ink transition hover:text-rose-dark"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-full bg-ink px-5 py-2 font-body text-sm text-bg transition hover:bg-rose-dark"
          >
            Começar agora
          </Link>
        </nav>
      </header>

      <section className="grid flex-1 items-center gap-14 py-10 md:grid-cols-2 md:py-20">
        <div>
          <p className="mb-5 inline-block rounded-full bg-rose-light px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-widest text-rose-dark">
            Um ciclo, catorze dias, um novo ritmo
          </p>
          <h1 className="font-display text-4xl italic leading-[1.15] text-ink sm:text-5xl">
            Seu corpo fez algo extraordinário.
            <br />
            <span className="not-italic font-medium">Agora é hora de cuidar dele de volta.</span>
          </h1>
          <p className="mt-6 max-w-md font-body text-base leading-relaxed text-muted">
            14 Dias de Autocuidado Pós-Parto é uma jornada curta e gentil — como as fases da lua —
            para reencontrar sua autoestima, seu bem-estar e sua conexão com o próprio corpo,
            um dia de cada vez.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/cadastro"
              className="rounded-full bg-sage px-7 py-3.5 font-body text-sm font-semibold text-white shadow-soft transition hover:bg-sage-dark"
            >
              Iniciar minha jornada
            </Link>
            <Link
              href="/login"
              className="font-body text-sm text-ink underline decoration-rose/50 underline-offset-4 transition hover:decoration-rose-dark"
            >
              Já tenho uma conta
            </Link>
          </div>
        </div>

        <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center">
          <div className="absolute inset-0 rounded-blob bg-gradient-to-br from-rose-light via-bg to-sage-light opacity-80" />
          <svg viewBox="0 0 200 200" className="relative z-10 w-3/4" aria-hidden>
            {Array.from({ length: 14 }, (_, i) => {
              const angulo = (-100 + (200 / 13) * i) * (Math.PI / 180);
              const r = 78;
              const x = 100 + r * Math.cos(angulo);
              const y = 100 + r * Math.sin(angulo) * 0.86 + 4;
              const cheia = i < 5;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={i === 5 ? 8 : 5.5}
                  fill={cheia ? "#D4A857" : i === 5 ? "#E3A6A1" : "#FFFFFF"}
                  stroke={cheia ? "#C9954A" : "#E7DCD5"}
                  strokeWidth={1.2}
                />
              );
            })}
          </svg>
        </div>
      </section>

      <section className="grid gap-5 border-t border-ink/10 py-14 sm:grid-cols-3">
        {PILARES.map((p) => (
          <div key={p.titulo} className="rounded-soft border border-ink/5 bg-white/70 p-6">
            <span className={`mb-4 inline-block rounded-full px-3 py-1 font-body text-xs font-semibold ${p.cor}`}>
              {p.titulo}
            </span>
            <p className="font-body text-sm leading-relaxed text-muted">{p.texto}</p>
          </div>
        ))}
      </section>

      <section className="rounded-soft bg-ink px-8 py-12 text-center text-bg">
        <h2 className="font-display text-2xl italic sm:text-3xl">
          &ldquo;Você não precisa se recuperar rápido. Você só precisa se recuperar de verdade.&rdquo;
        </h2>
        <Link
          href="/cadastro"
          className="mt-7 inline-block rounded-full bg-rose px-7 py-3 font-body text-sm font-semibold text-ink transition hover:bg-rose-dark hover:text-white"
        >
          Começar meus 14 dias
        </Link>
      </section>
    </main>
  );
}
