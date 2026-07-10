"use client";

import { HUMOR_LABELS, type Humor } from "@/lib/types";

export default function MoodSelector({
  valor,
  onSelecionar,
}: {
  valor: Humor | null;
  onSelecionar: (h: Humor) => void;
}) {
  const humores = Object.keys(HUMOR_LABELS) as Humor[];

  return (
    <div className="flex flex-wrap gap-2">
      {humores.map((h) => {
        const ativo = valor === h;
        return (
          <button
            key={h}
            type="button"
            onClick={() => onSelecionar(h)}
            aria-pressed={ativo}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 font-body text-sm transition ${
              ativo
                ? "border-sage bg-sage-light text-sage-dark"
                : "border-ink/10 bg-white text-ink hover:border-sage/60"
            }`}
          >
            <span aria-hidden>{HUMOR_LABELS[h].emoji}</span>
            {HUMOR_LABELS[h].label}
          </button>
        );
      })}
    </div>
  );
}
