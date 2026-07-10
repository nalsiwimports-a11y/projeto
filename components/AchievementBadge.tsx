export default function AchievementBadge({
  icone,
  nome,
  desbloqueada,
}: {
  icone: string;
  nome: string;
  desbloqueada: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl border px-4 py-4 text-center transition ${
        desbloqueada
          ? "border-gold/50 bg-gold-light/50"
          : "border-ink/10 bg-white opacity-50 grayscale"
      }`}
      title={nome}
    >
      <span className="text-2xl" aria-hidden>
        {icone}
      </span>
      <span className="font-body text-xs leading-tight text-ink">{nome}</span>
    </div>
  );
}
