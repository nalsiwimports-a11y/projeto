import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import MoonProgress from "@/components/MoonProgress";
import AchievementBadge from "@/components/AchievementBadge";
import { HUMOR_LABELS, type Achievement, type Humor } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: perfil }, { data: progresso }, { data: conquistasDesbloqueadas }, { data: todasConquistas }, { data: humores }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("daily_progress")
        .select("dia_programa, concluido")
        .eq("user_id", user.id)
        .eq("concluido", true),
      supabase
        .from("user_achievements")
        .select("achievement_id, data_desbloqueio, achievements(*)")
        .eq("user_id", user.id),
      supabase.from("achievements").select("*").order("created_at"),
      supabase
        .from("mood_entries")
        .select("humor, data_registro")
        .eq("user_id", user.id)
        .order("data_registro", { ascending: false })
        .limit(1),
    ]);

  const diasConcluidos = (progresso ?? []).map((p) => p.dia_programa);
  const idsDesbloqueadas = new Set((conquistasDesbloqueadas ?? []).map((c) => c.achievement_id));
  const humorRecente = humores?.[0]?.humor as Humor | undefined;
  const diaAtual = perfil?.dia_atual ?? 1;

  return (
    <div className="min-h-dvh">
      <Navbar nome={perfil?.nome} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <section className="rounded-soft border border-ink/5 bg-white/70 p-7 shadow-soft">
            <p className="font-body text-sm text-muted">Seu ciclo de cuidado</p>
            <h1 className="mt-1 font-display text-2xl italic text-ink">
              {perfil?.programa_concluido
                ? "Você completou sua jornada 🌸"
                : `Dia ${diaAtual} de 14`}
            </h1>

            <div className="mt-6">
              <MoonProgress diaAtual={diaAtual} diasConcluidos={diasConcluidos} />
            </div>

            <div className="mt-2 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-sage-light/60 py-3">
                <p className="font-display text-xl text-sage-dark">{diasConcluidos.length}</p>
                <p className="font-body text-xs text-muted">dias concluídos</p>
              </div>
              <div className="rounded-2xl bg-rose-light/60 py-3">
                <p className="font-display text-xl text-rose-dark">{perfil?.sequencia_atual ?? 0}</p>
                <p className="font-body text-xs text-muted">sequência atual</p>
              </div>
              <div className="rounded-2xl bg-gold-light/60 py-3">
                <p className="font-display text-xl text-ink">{perfil?.progresso_geral ?? 0}%</p>
                <p className="font-body text-xs text-muted">progresso geral</p>
              </div>
            </div>

            <Link
              href={`/dia/${Math.min(diaAtual, 14)}`}
              className="mt-7 inline-block w-full rounded-full bg-sage py-3.5 text-center font-body text-sm font-semibold text-white transition hover:bg-sage-dark"
            >
              {perfil?.programa_concluido ? "Revisitar o dia 14" : `Ir para o dia ${diaAtual}`}
            </Link>
          </section>

          <div className="flex flex-col gap-6">
            <section className="rounded-soft border border-ink/5 bg-white/70 p-6">
              <p className="mb-3 font-body text-sm text-muted">Como você está hoje</p>
              {humorRecente ? (
                <div className="flex items-center gap-3 rounded-2xl bg-bg px-4 py-3">
                  <span className="text-2xl" aria-hidden>
                    {HUMOR_LABELS[humorRecente].emoji}
                  </span>
                  <span className="font-body text-sm text-ink">
                    Último registro: {HUMOR_LABELS[humorRecente].label}
                  </span>
                </div>
              ) : (
                <p className="font-body text-sm text-muted">
                  Você ainda não registrou seu humor. Isso pode ser feito na página do dia.
                </p>
              )}
            </section>

            <section className="rounded-soft border border-ink/5 bg-white/70 p-6">
              <p className="mb-4 font-body text-sm text-muted">Conquistas</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {(todasConquistas ?? []).map((c: Achievement) => (
                  <AchievementBadge
                    key={c.id}
                    icone={c.icone}
                    nome={c.nome}
                    desbloqueada={idsDesbloqueadas.has(c.id)}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className="rounded-soft border border-ink/5 bg-white/70 p-6">
          <p className="mb-4 font-body text-sm text-muted">Todos os dias</p>
          <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-7 lg:grid-cols-14">
            {Array.from({ length: 14 }, (_, i) => i + 1).map((dia) => {
              const concluido = diasConcluidos.includes(dia);
              const disponivel = dia <= diaAtual;
              return (
                <Link
                  key={dia}
                  href={disponivel ? `/dia/${dia}` : "#"}
                  aria-disabled={!disponivel}
                  className={`flex aspect-square flex-col items-center justify-center rounded-2xl border font-body text-sm transition ${
                    concluido
                      ? "border-gold/50 bg-gold-light text-ink"
                      : disponivel
                        ? "border-sage/40 bg-sage-light/40 text-sage-dark hover:border-sage"
                        : "cursor-not-allowed border-ink/5 bg-bg text-muted/50"
                  }`}
                >
                  {dia}
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
