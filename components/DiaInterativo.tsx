"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DailyChecklist from "@/components/DailyChecklist";
import MoodSelector from "@/components/MoodSelector";
import type { DailyContent, DailyProgress, Humor } from "@/lib/types";

const CODIGOS_CONQUISTA: Record<string, (ctx: { dia: number; sequencia: number; totalConcluidos: number }) => boolean> = {
  primeiro_dia: ({ totalConcluidos }) => totalConcluidos >= 1,
  primeira_semana: ({ totalConcluidos }) => totalConcluidos >= 7,
  sete_consecutivos: ({ sequencia }) => sequencia >= 7,
  programa_completo: ({ totalConcluidos }) => totalConcluidos >= 14,
};

export default function DiaInterativo({
  conteudo,
  progressoInicial,
  userId,
}: {
  conteudo: DailyContent;
  progressoInicial: DailyProgress | null;
  userId: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [marcados, setMarcados] = useState<string[]>(progressoInicial?.checklist_marcado ?? []);
  const [concluido, setConcluido] = useState(progressoInicial?.concluido ?? false);
  const [humor, setHumor] = useState<Humor | null>(null);
  const [observacao, setObservacao] = useState("");
  const [anotacao, setAnotacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const totalItens = conteudo.checklist.length;
  const percentual = totalItens > 0 ? Math.round((marcados.length / totalItens) * 100) : 0;

  async function toggleItem(item: string) {
    const novosMarcados = marcados.includes(item)
      ? marcados.filter((i) => i !== item)
      : [...marcados, item];
    setMarcados(novosMarcados);

    const novoPercentual = totalItens > 0 ? Math.round((novosMarcados.length / totalItens) * 100) : 0;
    const novoConcluido = novoPercentual === 100;
    setConcluido(novoConcluido);

    await supabase.from("daily_progress").upsert(
      {
        user_id: userId,
        dia_programa: conteudo.dia_programa,
        checklist_marcado: novosMarcados,
        percentual_conclusao: novoPercentual,
        concluido: novoConcluido,
        data_conclusao: novoConcluido ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,dia_programa" }
    );

    if (novoConcluido) {
      await atualizarProgressoEConquistas();
    }
  }

  async function atualizarProgressoEConquistas() {
    await supabase.rpc("recalcular_progresso", { p_user_id: userId });

    const { data: perfilAtualizado } = await supabase
      .from("profiles")
      .select("sequencia_atual")
      .eq("id", userId)
      .single();

    const { data: concluidosData } = await supabase
      .from("daily_progress")
      .select("dia_programa")
      .eq("user_id", userId)
      .eq("concluido", true);

    const totalConcluidos = concluidosData?.length ?? 0;
    const sequencia = perfilAtualizado?.sequencia_atual ?? 0;

    const { data: conquistas } = await supabase.from("achievements").select("*");
    const { data: jaDesbloqueadas } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId);

    const idsJaDesbloqueadas = new Set((jaDesbloqueadas ?? []).map((c) => c.achievement_id));

    for (const conquista of conquistas ?? []) {
      const verificador = CODIGOS_CONQUISTA[conquista.codigo];
      if (verificador && !idsJaDesbloqueadas.has(conquista.id)) {
        if (verificador({ dia: conteudo.dia_programa, sequencia, totalConcluidos })) {
          await supabase
            .from("user_achievements")
            .insert({ user_id: userId, achievement_id: conquista.id })
            .select()
            .maybeSingle();
        }
      }
    }

    startTransition(() => router.refresh());
  }

  async function salvarHumorEAnotacao() {
    setSalvando(true);
    setMensagem(null);

    if (humor) {
      await supabase.from("mood_entries").insert({
        user_id: userId,
        dia_programa: conteudo.dia_programa,
        humor,
        observacao: observacao || null,
      });
    }

    if (anotacao.trim()) {
      await supabase.from("personal_notes").insert({
        user_id: userId,
        dia_programa: conteudo.dia_programa,
        anotacao: anotacao.trim(),
      });
    }

    setSalvando(false);
    setMensagem("Registrado com carinho. 🌿");
    setAnotacao("");
    setObservacao("");
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-soft border border-ink/5 bg-white/70 p-7 shadow-soft">
        <p className="font-body text-sm text-muted">
          Dia {conteudo.dia_programa} de 14 {concluido && "· concluído 🌸"}
        </p>
        <h1 className="mt-1 font-display text-3xl italic text-ink">{conteudo.titulo}</h1>
        <p className="mt-4 font-body text-base leading-relaxed text-ink">{conteudo.mensagem_acolhedora}</p>
        <p className="mt-5 font-display italic text-rose-dark">&ldquo;{conteudo.frase_motivacional}&rdquo;</p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <InfoCard titulo="Alimentação" texto={conteudo.dica_alimentacao} cor="bg-sage-light/60" />
        <InfoCard titulo="Movimento" texto={conteudo.atividade_fisica} cor="bg-rose-light/60" />
        <InfoCard titulo="Autocuidado" texto={conteudo.dica_autocuidado} cor="bg-gold-light/60" />
        <InfoCard titulo="Exercício emocional" texto={conteudo.exercicio_emocional} cor="bg-bg" />
      </div>

      <section className="rounded-soft border border-ink/5 bg-white/70 p-7">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-body text-sm text-muted">Checklist de hoje</p>
          <p className="font-body text-sm font-semibold text-sage-dark">{percentual}%</p>
        </div>
        <DailyChecklist itens={conteudo.checklist} marcados={marcados} onToggle={toggleItem} />
      </section>

      <section className="rounded-soft border border-ink/5 bg-white/70 p-7">
        <p className="mb-3 font-body text-sm text-muted">Como você está se sentindo?</p>
        <MoodSelector valor={humor} onSelecionar={setHumor} />

        <textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Quer contar um pouco mais sobre como está se sentindo? (opcional)"
          rows={2}
          className="mt-4 w-full resize-none rounded-2xl border border-ink/15 bg-white px-4 py-3 font-body text-sm text-ink outline-none transition focus:border-sage"
        />

        <p className="mb-2 mt-6 font-body text-sm text-muted">Anotação pessoal do dia</p>
        <textarea
          value={anotacao}
          onChange={(e) => setAnotacao(e.target.value)}
          placeholder="Escreva livremente aqui, sem pressa nem julgamento..."
          rows={3}
          className="w-full resize-none rounded-2xl border border-ink/15 bg-white px-4 py-3 font-body text-sm text-ink outline-none transition focus:border-sage"
        />

        {mensagem && <p className="mt-3 font-body text-sm text-sage-dark">{mensagem}</p>}

        <button
          onClick={salvarHumorEAnotacao}
          disabled={salvando || (!humor && !anotacao.trim())}
          className="mt-5 rounded-full bg-ink px-6 py-3 font-body text-sm font-semibold text-bg transition hover:bg-rose-dark disabled:opacity-50"
        >
          {salvando ? "Salvando..." : "Salvar registro do dia"}
        </button>
      </section>
    </div>
  );
}

function InfoCard({ titulo, texto, cor }: { titulo: string; texto: string; cor: string }) {
  return (
    <div className={`rounded-soft border border-ink/5 p-6 ${cor}`}>
      <p className="mb-2 font-body text-xs font-semibold uppercase tracking-wider text-muted">
        {titulo}
      </p>
      <p className="font-body text-sm leading-relaxed text-ink">{texto}</p>
    </div>
  );
}
