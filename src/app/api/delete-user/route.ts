import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { id } = await req.json();

  const { error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .delete()
    .eq('id', id);

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });

  // Intentar borrar de Auth, pero no fallar si no se puede
  await supabaseAdmin.auth.admin.deleteUser(id).catch(() => {});

  return NextResponse.json({ success: true });
}