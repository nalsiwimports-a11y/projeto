import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import DiaInterativo from "@/components/DiaInterativo";

export default async function DiaPage({
  params,
}: {
  params: { numero: string };
}) {
  const { numero } = params;
  const dia = Number(numero);

  if (!Number.isInteger(dia) || dia < 1 || dia > 14) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: conteudo }, { data: progresso }, { data: perfil }] = await Promise.all([
    supabase.from("daily_content").select("*").eq("dia_programa", dia).single(),
    supabase
      .from("daily_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("dia_programa", dia)
      .maybeSingle(),
    supabase.from("profiles").select("nome").eq("id", user.id).single(),
  ]);

  if (!conteudo) notFound();

  const diaAnterior = dia > 1 ? dia - 1 : null;
  const diaProximo = dia < 14 ? dia + 1 : null;

  return (
    <div className="min-h-dvh">
      <Navbar nome={perfil?.nome} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between font-body text-sm">
          <Link href="/dashboard" className="text-muted hover:text-ink">
            ← Painel
          </Link>
          <div className="flex gap-4">
            {diaAnterior && (
              <Link href={`/dia/${diaAnterior}`} className="text-muted hover:text-ink">
                Dia anterior
              </Link>
            )}
            {diaProximo && (
              <Link href={`/dia/${diaProximo}`} className="text-sage-dark hover:underline">
                Próximo dia →
              </Link>
            )}
          </div>
        </div>

        <DiaInterativo conteudo={conteudo} progressoInicial={progresso} userId={user.id} />
      </main>
    </div>
  );
}
