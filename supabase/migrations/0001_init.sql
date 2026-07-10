-- ============================================================================
-- 14 Dias de Autocuidado Pós-Parto — Script de inicialização do Supabase
-- ============================================================================
-- Execute este arquivo inteiro no Supabase SQL Editor (Project > SQL Editor > New query).
-- Ele é idempotente: pode ser executado novamente sem duplicar dados fixos.
-- ============================================================================

-- Extensão usada para gerar UUIDs
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. TABELA profiles
-- Um perfil por usuário autenticado (auth.users). Criada automaticamente
-- via trigger quando o usuário se cadastra (ver seção de triggers abaixo).
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  email text not null,
  foto_url text,
  data_cadastro timestamptz not null default now(),
  dia_atual smallint not null default 1 check (dia_atual between 1 and 14),
  progresso_geral numeric(5,2) not null default 0 check (progresso_geral between 0 and 100),
  sequencia_atual smallint not null default 0 check (sequencia_atual >= 0),
  maior_sequencia smallint not null default 0 check (maior_sequencia >= 0),
  programa_concluido boolean not null default false,
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil estendido de cada usuária, 1:1 com auth.users';

create index if not exists idx_profiles_programa_concluido on public.profiles (programa_concluido);

-- ============================================================================
-- 2. TABELA daily_content
-- Conteúdo padrão (público) dos 14 dias do programa. Não depende de usuário.
-- ============================================================================
create table if not exists public.daily_content (
  id uuid primary key default gen_random_uuid(),
  dia_programa smallint not null unique check (dia_programa between 1 and 14),
  titulo text not null,
  mensagem_acolhedora text not null,
  dica_alimentacao text not null,
  atividade_fisica text not null,
  dica_autocuidado text not null,
  exercicio_emocional text not null,
  frase_motivacional text not null,
  checklist jsonb not null default '[]'::jsonb, -- ex: ["Beber 2L de água", "5 min de respiração"]
  created_at timestamptz not null default now()
);

comment on table public.daily_content is 'Conteúdo fixo e público de cada um dos 14 dias do programa';

-- ============================================================================
-- 3. TABELA daily_progress
-- Progresso diário de cada usuária. Um registro por (user, dia).
-- ============================================================================
create table if not exists public.daily_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dia_programa smallint not null check (dia_programa between 1 and 14),
  concluido boolean not null default false,
  data_conclusao timestamptz,
  percentual_conclusao numeric(5,2) not null default 0 check (percentual_conclusao between 0 and 100),
  checklist_marcado jsonb not null default '[]'::jsonb, -- índices/itens do checklist já marcados
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, dia_programa)
);

comment on table public.daily_progress is 'Progresso de cada usuária em cada um dos 14 dias';

create index if not exists idx_daily_progress_user on public.daily_progress (user_id);
create index if not exists idx_daily_progress_user_dia on public.daily_progress (user_id, dia_programa);

-- ============================================================================
-- 4. TABELA mood_entries
-- Registro de humor diário.
-- ============================================================================
create type public.humor_tipo as enum (
  'feliz', 'cansada', 'motivada', 'ansiosa', 'tranquila', 'sobrecarregada'
);

create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dia_programa smallint not null check (dia_programa between 1 and 14),
  humor public.humor_tipo not null,
  observacao text,
  data_registro timestamptz not null default now()
);

comment on table public.mood_entries is 'Humor diário relatado pela usuária';

create index if not exists idx_mood_entries_user on public.mood_entries (user_id);
create index if not exists idx_mood_entries_user_data on public.mood_entries (user_id, data_registro desc);

-- ============================================================================
-- 5. TABELA personal_notes
-- Anotações pessoais livres da usuária.
-- ============================================================================
create table if not exists public.personal_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dia_programa smallint check (dia_programa between 1 and 14),
  anotacao text not null,
  data_criacao timestamptz not null default now()
);

comment on table public.personal_notes is 'Anotações pessoais e livres da usuária';

create index if not exists idx_personal_notes_user on public.personal_notes (user_id);

-- ============================================================================
-- 6. TABELA achievements
-- Catálogo público de conquistas.
-- ============================================================================
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique, -- identificador estável usado pela lógica da aplicação
  nome text not null,
  descricao text not null,
  icone text not null, -- nome/emoji do ícone
  requisito text not null, -- descrição legível do requisito
  created_at timestamptz not null default now()
);

comment on table public.achievements is 'Catálogo público de conquistas do programa';

-- ============================================================================
-- 7. TABELA user_achievements
-- Conquistas desbloqueadas por cada usuária.
-- ============================================================================
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  data_desbloqueio timestamptz not null default now(),
  unique (user_id, achievement_id)
);

comment on table public.user_achievements is 'Relação N:N entre usuárias e conquistas desbloqueadas';

create index if not exists idx_user_achievements_user on public.user_achievements (user_id);

-- ============================================================================
-- 8. TABELA notifications
-- Notificações internas para a usuária.
-- ============================================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  mensagem text not null,
  lida boolean not null default false,
  data_envio timestamptz not null default now()
);

comment on table public.notifications is 'Notificações direcionadas a cada usuária';

create index if not exists idx_notifications_user on public.notifications (user_id);
create index if not exists idx_notifications_user_lida on public.notifications (user_id, lida);

-- ============================================================================
-- TRIGGERS: updated_at automático
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_daily_progress_updated_at on public.daily_progress;
create trigger trg_daily_progress_updated_at
  before update on public.daily_progress
  for each row execute function public.set_updated_at();

-- ============================================================================
-- TRIGGER: criação automática de perfil ao cadastrar usuário
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- FUNÇÃO utilitária: recalcular progresso geral e sequência da usuária
-- Chamada pela aplicação (RPC) sempre que um dia é concluído.
-- ============================================================================
create or replace function public.recalcular_progresso(p_user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_dias_concluidos int;
  v_sequencia int := 0;
  v_maior_sequencia int;
  v_dia record;
  v_esperado int := 1;
begin
  select count(*) into v_dias_concluidos
  from public.daily_progress
  where user_id = p_user_id and concluido = true;

  -- calcula sequência consecutiva a partir do dia 1
  for v_dia in
    select dia_programa, concluido
    from public.daily_progress
    where user_id = p_user_id
    order by dia_programa asc
  loop
    if v_dia.dia_programa = v_esperado and v_dia.concluido then
      v_sequencia := v_sequencia + 1;
      v_esperado := v_esperado + 1;
    else
      exit;
    end if;
  end loop;

  update public.profiles
  set
    progresso_geral = round((v_dias_concluidos::numeric / 14) * 100, 2),
    sequencia_atual = v_sequencia,
    maior_sequencia = greatest(maior_sequencia, v_sequencia),
    programa_concluido = (v_dias_concluidos >= 14),
    dia_atual = least(greatest(v_sequencia + 1, dia_atual), 14)
  where id = p_user_id;

  select maior_sequencia into v_maior_sequencia from public.profiles where id = p_user_id;
end;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
alter table public.profiles            enable row level security;
alter table public.daily_progress      enable row level security;
alter table public.mood_entries        enable row level security;
alter table public.personal_notes      enable row level security;
alter table public.achievements        enable row level security;
alter table public.user_achievements   enable row level security;
alter table public.daily_content       enable row level security;
alter table public.notifications       enable row level security;

-- ---- profiles: usuária só vê/edita o próprio perfil -------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ---- daily_content: leitura pública (qualquer usuário autenticado) ---------
drop policy if exists "daily_content_select_authenticated" on public.daily_content;
create policy "daily_content_select_authenticated"
  on public.daily_content for select
  to authenticated
  using (true);

-- ---- daily_progress: CRUD restrito ao dono ----------------------------------
drop policy if exists "daily_progress_select_own" on public.daily_progress;
create policy "daily_progress_select_own"
  on public.daily_progress for select
  using (auth.uid() = user_id);

drop policy if exists "daily_progress_insert_own" on public.daily_progress;
create policy "daily_progress_insert_own"
  on public.daily_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "daily_progress_update_own" on public.daily_progress;
create policy "daily_progress_update_own"
  on public.daily_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "daily_progress_delete_own" on public.daily_progress;
create policy "daily_progress_delete_own"
  on public.daily_progress for delete
  using (auth.uid() = user_id);

-- ---- mood_entries: CRUD restrito ao dono ------------------------------------
drop policy if exists "mood_entries_select_own" on public.mood_entries;
create policy "mood_entries_select_own"
  on public.mood_entries for select
  using (auth.uid() = user_id);

drop policy if exists "mood_entries_insert_own" on public.mood_entries;
create policy "mood_entries_insert_own"
  on public.mood_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "mood_entries_update_own" on public.mood_entries;
create policy "mood_entries_update_own"
  on public.mood_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "mood_entries_delete_own" on public.mood_entries;
create policy "mood_entries_delete_own"
  on public.mood_entries for delete
  using (auth.uid() = user_id);

-- ---- personal_notes: CRUD restrito ao dono ----------------------------------
drop policy if exists "personal_notes_select_own" on public.personal_notes;
create policy "personal_notes_select_own"
  on public.personal_notes for select
  using (auth.uid() = user_id);

drop policy if exists "personal_notes_insert_own" on public.personal_notes;
create policy "personal_notes_insert_own"
  on public.personal_notes for insert
  with check (auth.uid() = user_id);

drop policy if exists "personal_notes_update_own" on public.personal_notes;
create policy "personal_notes_update_own"
  on public.personal_notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "personal_notes_delete_own" on public.personal_notes;
create policy "personal_notes_delete_own"
  on public.personal_notes for delete
  using (auth.uid() = user_id);

-- ---- achievements: catálogo público (somente leitura) -----------------------
drop policy if exists "achievements_select_authenticated" on public.achievements;
create policy "achievements_select_authenticated"
  on public.achievements for select
  to authenticated
  using (true);

-- ---- user_achievements: usuária vê as próprias; inserção via RPC/backend ----
drop policy if exists "user_achievements_select_own" on public.user_achievements;
create policy "user_achievements_select_own"
  on public.user_achievements for select
  using (auth.uid() = user_id);

drop policy if exists "user_achievements_insert_own" on public.user_achievements;
create policy "user_achievements_insert_own"
  on public.user_achievements for insert
  with check (auth.uid() = user_id);

-- ---- notifications: CRUD restrito ao dono (app só marca como lida) ---------
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "notifications_insert_own" on public.notifications;
create policy "notifications_insert_own"
  on public.notifications for insert
  with check (auth.uid() = user_id);

-- ============================================================================
-- SEED: conquistas (achievements)
-- ============================================================================
insert into public.achievements (codigo, nome, descricao, icone, requisito) values
  ('primeiro_dia', 'Primeiro passo', 'Você concluiu o seu primeiro dia do programa.', '🌱', '1 dia concluído'),
  ('primeira_semana', 'Uma semana de cuidado', 'Você completou 7 dias do programa.', '🌤️', '7 dias concluídos'),
  ('sete_consecutivos', 'Constância que floresce', 'Você manteve 7 dias consecutivos de prática.', '🔥', '7 dias seguidos concluídos'),
  ('programa_completo', 'Jornada completa', 'Você concluiu os 14 dias de autocuidado.', '🌸', '14 dias concluídos')
on conflict (codigo) do nothing;

-- ============================================================================
-- SEED: conteúdo dos 14 dias (daily_content)
-- ============================================================================
insert into public.daily_content
  (dia_programa, titulo, mensagem_acolhedora, dica_alimentacao, atividade_fisica, dica_autocuidado, exercicio_emocional, frase_motivacional, checklist)
values
(1, 'Chegando com gentileza',
 'Seu corpo fez algo extraordinário. Hoje não é sobre fazer mais, é sobre permitir-se começar devagar.',
 'Priorize um café da manhã com proteína e água morna com limão ao acordar.',
 'Respiração diafragmática por 5 minutos, sentada e confortável.',
 'Separe 10 minutos só seus, sem culpa, para tomar um banho tranquilo.',
 'Escreva em uma frase como você está se sentindo hoje, sem julgar a resposta.',
 'Você não precisa se recuperar rápido. Você só precisa se recuperar de verdade.',
 '["Beber 2L de água ao longo do dia", "5 minutos de respiração consciente", "Um momento só para mim", "Registrar o humor do dia"]'::jsonb),
(2, 'Corpo que sustenta',
 'Seu corpo carregou uma vida. Hoje, ele merece cuidado, não cobrança.',
 'Inclua uma porção de frutas vermelhas, ricas em antioxidantes, em algum lanche.',
 'Caminhada leve de 10 minutos, no seu ritmo, se liberada pelo médico.',
 'Hidrate a pele com um óleo ou creme que você goste do cheiro.',
 'Liste 3 coisas que seu corpo fez por você essa semana.',
 'Pequenos passos também são progresso.',
 '["Caminhada leve de 10 minutos", "Hidratar a pele", "Listar 3 conquistas do corpo", "Registrar o humor do dia"]'::jsonb),
(3, 'Permissão para descansar',
 'Descansar não é preguiça, é parte do processo de cura. Você tem permissão para parar.',
 'Experimente um chá calmante (camomila ou erva-cidreira) à tarde.',
 'Alongamento suave de pescoço e ombros por 5 minutos.',
 'Cochile quando o bebê cochilar, mesmo que por 15 minutos.',
 'Complete a frase: "Hoje eu preciso de..." e permita-se atender essa necessidade.',
 'Descanso é produtividade em outra forma.',
 '["Alongamento de pescoço e ombros", "Cochilar quando possível", "Completar a frase de autocuidado", "Registrar o humor do dia"]'::jsonb),
(4, 'Nutrindo por dentro',
 'Alimentar-se bem é um ato de amor-próprio, especialmente agora que seu corpo está se reconstruindo.',
 'Adicione uma fonte de ferro (feijão, carne magra ou folhas verde-escuras) a uma refeição.',
 'Exercícios leves de pelve e assoalho pélvico (conforme orientação médica).',
 'Prepare uma xícara de algo quentinho e beba devagar, sem pressa.',
 'Anote uma memória boa desses últimos dias, por menor que pareça.',
 'Cada refeição é uma chance de se cuidar de novo.',
 '["Incluir uma fonte de ferro na alimentação", "Exercícios leves de assoalho pélvico", "Tomar uma bebida quente com calma", "Registrar o humor do dia"]'::jsonb),
(5, 'A voz que acolhe',
 'A forma como você fala consigo mesma importa. Hoje, escolha palavras gentis.',
 'Evite pular refeições; tenha um lanche nutritivo sempre à mão.',
 'Dança leve e livre por 5 minutos com uma música que você goste.',
 'Troque uma peça de roupa por algo confortável que te faça sentir bem.',
 'Escreva uma frase gentil para si mesma, como diria a uma amiga querida.',
 'Fale consigo como fala com quem você ama.',
 '["Ter um lanche nutritivo por perto", "5 minutos de dança livre", "Vestir algo confortável", "Registrar o humor do dia"]'::jsonb),
(6, 'Rede de apoio',
 'Você não precisa fazer isso sozinha. Pedir ajuda é força, não fraqueza.',
 'Peça para alguém preparar ou trazer uma refeição hoje, se possível.',
 'Sente-se ao ar livre por alguns minutos, tomando um pouco de sol.',
 'Peça 20 minutos de ajuda com o bebê para cuidar só de você.',
 'Pense em uma pessoa de confiança e envie uma mensagem pedindo apoio ou só para conversar.',
 'Pedir ajuda é um gesto de coragem e amor-próprio.',
 '["Pedir ajuda com uma refeição", "Alguns minutos ao ar livre", "Pedir 20 min de apoio com o bebê", "Registrar o humor do dia"]'::jsonb),
(7, 'Uma semana de você',
 'Você completou sete dias de cuidado consigo. Pare e reconheça esse marco.',
 'Faça uma refeição especial hoje, algo que você realmente goste de comer.',
 'Caminhada de 15 minutos em um ritmo confortável.',
 'Celebre a semana com um pequeno mimo: um chocolate, um banho longo, uma série.',
 'Releia suas anotações da semana e observe como você já mudou.',
 'Uma semana de cuidado é uma semana de coragem.',
 '["Fazer uma refeição especial", "Caminhada de 15 minutos", "Um pequeno mimo para celebrar", "Reler anotações da semana"]'::jsonb),
(8, 'Reencontrando o espelho',
 'Seu corpo mudou, e isso não é um problema a resolver. É uma história a respeitar.',
 'Beba um smoothie nutritivo com frutas e uma fonte de proteína.',
 'Exercício de postura: alongue a coluna suavemente por 5 minutos.',
 'Olhe-se no espelho e nomeie uma parte do corpo pela qual você é grata.',
 'Escreva uma carta breve para o seu corpo, agradecendo por algo específico.',
 'Seu corpo não é um projeto. Ele é um lar.',
 '["Tomar um smoothie nutritivo", "5 minutos de alongamento de coluna", "Nomear algo grato sobre o corpo", "Registrar o humor do dia"]'::jsonb),
(9, 'Emoções em ondas',
 'É normal que os sentimentos mudem de hora em hora. Você não está quebrada, está se ajustando.',
 'Reduza a cafeína após o almoço para ajudar o sono à noite.',
 'Respiração 4-7-8 (inspire 4s, segure 7s, solte 8s) por 3 ciclos.',
 'Permita-se chorar se precisar, sem se explicar para ninguém.',
 'Identifique qual emoção foi mais forte hoje e onde ela apareceu no corpo.',
 'Sentir tudo isso não te torna fraca. Te torna humana.',
 '["Reduzir cafeína à tarde", "Respiração 4-7-8", "Identificar a emoção do dia", "Registrar o humor do dia"]'::jsonb),
(10, 'Pequenos prazeres',
 'A alegria pode ser pequena e ainda assim verdadeira. Procure por ela hoje.',
 'Experimente uma fruta diferente ou um sabor que você não come há um tempo.',
 'Mova o corpo livremente por 5 minutos, sem regras, só sentindo.',
 'Ouça uma playlist ou podcast que te faça companhia e bem.',
 'Liste 3 pequenos prazeres que você sentiu essa semana.',
 'A alegria não precisa ser grande para ser real.',
 '["Experimentar um sabor novo", "5 minutos de movimento livre", "Ouvir algo que goste", "Listar 3 pequenos prazeres"]'::jsonb),
(11, 'Limites com amor',
 'Dizer não também é uma forma de cuidar de quem você ama, incluindo você mesma.',
 'Prepare uma refeição simples que exija pouco esforço hoje.',
 'Alongamento de quadril e pernas por 5 minutos, sentada.',
 'Identifique uma tarefa que você pode adiar ou delegar hoje.',
 'Escreva um limite que você gostaria de estabelecer essa semana.',
 'Seus limites são um mapa para quem quer te apoiar de verdade.',
 '["Preparar uma refeição simples", "Alongar quadril e pernas", "Identificar uma tarefa para delegar", "Registrar o humor do dia"]'::jsonb),
(12, 'Memória e gratidão',
 'Olhe para trás e veja o quanto você já caminhou, mesmo nos dias mais difíceis.',
 'Tome um chá ou suco natural enquanto reflete sobre o dia.',
 'Caminhada de 10 a 15 minutos, observando a paisagem ao redor.',
 'Reserve 10 minutos para fazer algo puramente por prazer.',
 'Escreva 3 coisas pelas quais você é grata nessa fase da maternidade.',
 'Gratidão não apaga o cansaço, mas ilumina o caminho.',
 '["Tomar um chá ou suco com calma", "Caminhada observando a paisagem", "10 minutos de prazer pessoal", "Listar 3 gratidões"]'::jsonb),
(13, 'Quase lá',
 'Você está a um passo de completar essa jornada de 14 dias. Sinta orgulho de ter chegado até aqui.',
 'Monte um prato colorido, com pelo menos 3 grupos alimentares diferentes.',
 'Sequência leve de alongamentos de corpo inteiro, 8 minutos.',
 'Prepare algo especial para amanhã, seu dia de celebração.',
 'Escreva o que você aprendeu sobre si mesma nesses 13 dias.',
 'Você chegou até aqui porque é mais forte do que imaginava.',
 '["Montar um prato colorido", "8 minutos de alongamento completo", "Planejar a celebração de amanhã", "Registrar o humor do dia"]'::jsonb),
(14, 'Celebrando você',
 'Você completou 14 dias de escolher a si mesma. Isso é motivo de celebração, hoje e sempre.',
 'Escolha uma refeição para celebrar essa conquista, com calma e presença.',
 'Movimente-se da forma que mais te dá prazer hoje, por 10 minutos.',
 'Faça algo que simbolize essa conquista: uma foto, uma nota, um mimo especial.',
 'Escreva uma carta para a mãe que você está se tornando.',
 'Você não terminou uma jornada. Você começou uma nova forma de se cuidar.',
 '["Fazer uma refeição para celebrar", "10 minutos de movimento por prazer", "Marcar essa conquista de alguma forma", "Escrever uma carta para si mesma"]'::jsonb)
on conflict (dia_programa) do update set
  titulo = excluded.titulo,
  mensagem_acolhedora = excluded.mensagem_acolhedora,
  dica_alimentacao = excluded.dica_alimentacao,
  atividade_fisica = excluded.atividade_fisica,
  dica_autocuidado = excluded.dica_autocuidado,
  exercicio_emocional = excluded.exercicio_emocional,
  frase_motivacional = excluded.frase_motivacional,
  checklist = excluded.checklist;

-- ============================================================================
-- Fim do script. Após executar, verifique em Table Editor se as 8 tabelas
-- foram criadas e se "daily_content" e "achievements" já têm os dados.
-- ============================================================================
