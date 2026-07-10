import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Rota chamada pelos links de e-mail do Supabase (confirmação de cadastro
// e recuperação de senha) para trocar o "code" por uma sessão válida.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?erro=link_invalido`);
}
