export type Humor =
  | "feliz"
  | "cansada"
  | "motivada"
  | "ansiosa"
  | "tranquila"
  | "sobrecarregada";

export interface Profile {
  id: string;
  nome: string;
  email: string;
  foto_url: string | null;
  data_cadastro: string;
  dia_atual: number;
  progresso_geral: number;
  sequencia_atual: number;
  maior_sequencia: number;
  programa_concluido: boolean;
  updated_at: string;
}

export interface DailyContent {
  id: string;
  dia_programa: number;
  titulo: string;
  mensagem_acolhedora: string;
  dica_alimentacao: string;
  atividade_fisica: string;
  dica_autocuidado: string;
  exercicio_emocional: string;
  frase_motivacional: string;
  checklist: string[];
}

export interface DailyProgress {
  id: string;
  user_id: string;
  dia_programa: number;
  concluido: boolean;
  data_conclusao: string | null;
  percentual_conclusao: number;
  checklist_marcado: string[];
}

export interface MoodEntry {
  id: string;
  user_id: string;
  dia_programa: number;
  humor: Humor;
  observacao: string | null;
  data_registro: string;
}

export interface Achievement {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  requisito: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  data_desbloqueio: string;
  achievements?: Achievement;
}

export interface PersonalNote {
  id: string;
  user_id: string;
  dia_programa: number | null;
  anotacao: string;
  data_criacao: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data_envio: string;
}

export const HUMOR_LABELS: Record<Humor, { label: string; emoji: string }> = {
  feliz: { label: "Feliz", emoji: "😊" },
  cansada: { label: "Cansada", emoji: "🥱" },
  motivada: { label: "Motivada", emoji: "💪" },
  ansiosa: { label: "Ansiosa", emoji: "😰" },
  tranquila: { label: "Tranquila", emoji: "🌿" },
  sobrecarregada: { label: "Sobrecarregada", emoji: "🌊" },
};
