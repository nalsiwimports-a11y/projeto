"use client";

/**
 * Elemento de assinatura visual do produto: um ciclo de 14 luas representando
 * os 14 dias do programa — metade de um ciclo lunar, evocando o ritmo natural
 * de repouso e renovação do puerpério. Cada lua marca um dia; luas cheias
 * (preenchidas) indicam dias concluídos, e a lua atual pulsa suavemente.
 */
export default function MoonProgress({
  diaAtual,
  diasConcluidos,
  size = 260,
}: {
  diaAtual: number;
  diasConcluidos: number[];
  size?: number;
}) {
  const total = 14;
  const radius = size / 2 - 22;
  const center = size / 2;

  const posicoes = Array.from({ length: total }, (_, i) => {
    // arco de 200° (não fecha o círculo — sugere um caminho, não uma jaula)
    const angulo = (-100 + (200 / (total - 1)) * i) * (Math.PI / 180);
    const x = center + radius * Math.cos(angulo);
    const y = center + radius * Math.sin(angulo) * 0.86 + 6;
    return { x, y, dia: i + 1 };
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size * 0.72}`}
      width="100%"
      height="auto"
      role="img"
      aria-label={`Progresso: ${diasConcluidos.length} de 14 dias concluídos`}
    >
      <defs>
        <radialGradient id="luaCheia" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#F6E9CE" />
          <stop offset="100%" stopColor="#D4A857" />
        </radialGradient>
        <radialGradient id="luaAtual" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FBE7E4" />
          <stop offset="100%" stopColor="#E3A6A1" />
        </radialGradient>
      </defs>

      {posicoes.map(({ x, y }, i) =>
        i < posicoes.length - 1 ? (
          <line
            key={`linha-${i}`}
            x1={x}
            y1={y}
            x2={posicoes[i + 1].x}
            y2={posicoes[i + 1].y}
            stroke="#DDE6D8"
            strokeWidth={2}
            strokeDasharray="1 8"
            strokeLinecap="round"
          />
        ) : null
      )}

      {posicoes.map(({ x, y, dia }) => {
        const concluido = diasConcluidos.includes(dia);
        const atual = dia === diaAtual && !concluido;
        const raio = atual ? 12 : 9;

        return (
          <g key={dia}>
            {atual && (
              <circle cx={x} cy={y} r={raio + 6} fill="#E3A6A1" opacity={0.18}>
                <animate
                  attributeName="r"
                  values={`${raio + 4};${raio + 9};${raio + 4}`}
                  dur="2.6s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <circle
              cx={x}
              cy={y}
              r={raio}
              fill={concluido ? "url(#luaCheia)" : atual ? "url(#luaAtual)" : "#FFFFFF"}
              stroke={concluido ? "#D4A857" : atual ? "#C97A75" : "#E7DCD5"}
              strokeWidth={1.5}
            />
            <text
              x={x}
              y={y + raio + 13}
              textAnchor="middle"
              fontSize="9"
              fontFamily="var(--font-karla)"
              fill={atual ? "#3B2E2A" : "#8B7873"}
              fontWeight={atual ? 700 : 400}
            >
              {dia}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
