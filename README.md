# 14 Dias de Autocuidado Pós-Parto

Aplicação web completa para uma jornada de 14 dias de autocuidado voltada a mães no pós-parto:
dashboard de progresso, conteúdo diário (alimentação, movimento, autocuidado, exercício emocional),
checklist, humor, anotações pessoais e conquistas.

**Stack:** Next.js 14 (App Router, TypeScript) · Supabase (Postgres + Auth + RLS) · Tailwind CSS · Vercel.

---

## 1. Estrutura do projeto

```
app/
  page.tsx                 → landing page
  login/                   → login
  cadastro/                → cadastro (signup)
  recuperar-senha/         → solicitar link de redefinição de senha
  redefinir-senha/         → definir nova senha
  auth/callback/route.ts   → troca o "code" do link de e-mail por sessão
  dashboard/                → painel com progresso, conquistas, humor
  dia/[numero]/             → conteúdo e checklist de cada um dos 14 dias
  layout.tsx, globals.css   → layout raiz, fontes e paleta
components/                 → Navbar, MoonProgress (assinatura visual),
                               DailyChecklist, MoodSelector, AchievementBadge,
                               DiaInterativo (lógica client-side do dia)
lib/
  supabase/client.ts        → cliente Supabase (browser)
  supabase/server.ts        → cliente Supabase (server components/actions)
  supabase/middleware.ts    → renovação de sessão + proteção de rotas
  types.ts                  → tipos TypeScript compartilhados
middleware.ts                → aplica a proteção de rotas em toda a app
supabase/migrations/0001_init.sql → script SQL completo (tabelas, RLS, seed)
```

## 2. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor → New query**, cole todo o conteúdo de
   `supabase/migrations/0001_init.sql` e execute. Esse script cria:
   - as 8 tabelas (`profiles`, `daily_content`, `daily_progress`, `mood_entries`,
     `personal_notes`, `achievements`, `user_achievements`, `notifications`);
   - chaves primárias, estrangeiras e índices;
   - a trigger que cria automaticamente um `profile` quando alguém se cadastra;
   - a função `recalcular_progresso`, usada para atualizar sequência e progresso;
   - Row Level Security habilitado em todas as tabelas, com policies completas
     (cada usuária só acessa seus próprios dados; `daily_content` e
     `achievements` têm leitura pública para usuários autenticados);
   - os dados iniciais dos 14 dias e das 4 conquistas.
3. Em **Authentication → URL Configuration**, defina:
   - **Site URL**: a URL do seu deploy (ex.: `https://seu-site.vercel.app`).
   - **Redirect URLs**: adicione `https://seu-site.vercel.app/auth/callback`
     (e `http://localhost:3000/auth/callback` para desenvolvimento local).
4. Em **Authentication → Providers → Email**, mantenha "Confirm email" ativado
   se quiser exigir confirmação por e-mail antes do primeiro login.
5. Em **Settings → API**, copie a **Project URL** e a **anon public key**.

## 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA_PUBLICA
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## 5. Deploy na Vercel

1. Suba este projeto para um repositório Git (GitHub, GitLab ou Bitbucket).
2. Em [vercel.com](https://vercel.com), clique em **New Project** e importe o repositório.
3. A Vercel detecta Next.js automaticamente — não é preciso configurar build command.
4. Em **Environment Variables**, adicione as três variáveis do passo 3 (usando a URL
   final da Vercel em `NEXT_PUBLIC_SITE_URL`).
5. Clique em **Deploy**.
6. Depois do primeiro deploy, volte ao Supabase (**Authentication → URL Configuration**)
   e confirme que a Site URL e a Redirect URL apontam para o domínio final da Vercel.

## 6. Segurança implementada

- **RLS em todas as tabelas de dados do usuário**: `profiles`, `daily_progress`,
  `mood_entries`, `personal_notes`, `user_achievements` e `notifications` só podem
  ser lidas/escritas pelo próprio usuário (`auth.uid() = user_id`).
- **Leitura pública controlada**: `daily_content` e `achievements` são somente
  leitura, liberadas apenas para usuários autenticados (`to authenticated`).
- **Perfil criado automaticamente** via trigger em `auth.users`, evitando que a
  aplicação precise de uma service role key no frontend.
- **Sessão via cookies HTTP-only** administrada pelo `@supabase/ssr`, com o
  `middleware.ts` protegendo `/dashboard` e `/dia/*` e redirecionando usuárias
  não autenticadas para `/login`.

## 7. Notas de design

O elemento de assinatura visual é o **ciclo de 14 luas** (`components/MoonProgress.tsx`):
os 14 dias do programa são representados como fases de um ciclo lunar — metáfora
para o ritmo natural de repouso e renovação do pós-parto — em vez de uma barra de
progresso genérica. A paleta (areia clara, verde-sálvia, rosa-empoeirado e dourado)
e a tipografia (Fraunces para títulos com um toque itálico afetuoso + Karla para
texto corrido) foram escolhidas para transmitir acolhimento sem soar clínico.
