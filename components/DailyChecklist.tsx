"use client";

export default function DailyChecklist({
  itens,
  marcados,
  onToggle,
}: {
  itens: string[];
  marcados: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <ul className="flex flex-col gap-2.5">
      {itens.map((item) => {
        const marcado = marcados.includes(item);
        return (
          <li key={item}>
            <button
              type="button"
              onClick={() => onToggle(item)}
              aria-pressed={marcado}
              className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left font-body text-sm transition ${
                marcado
                  ? "border-sage bg-sage-light/70 text-sage-dark"
                  : "border-ink/10 bg-white text-ink hover:border-sage/50"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                  marcado ? "border-sage bg-sage text-white" : "border-ink/20 bg-white"
                }`}
              >
                {marcado ? "✓" : ""}
              </span>
              <span className={marcado ? "line-through decoration-sage/50" : ""}>{item}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
