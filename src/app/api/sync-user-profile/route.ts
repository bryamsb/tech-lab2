import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Partial admin update for user_profiles.projects / user_profiles.specializations.
//
// Why this route exists: when a project is created/edited and a teammate
// (someone other than the logged-in user) is added with a position, the
// client needs to write that project id / specialization into THAT
// teammate's user_profiles row. Under normal RLS, a logged-in user can only
// update their OWN user_profiles row, so a direct client-side
// supabase.from('user_profiles').update(...) for another user's id is
// silently rejected (no rows affected, no error). This route uses the
// service role key to perform that write on the server, bypassing RLS,
// and only ever touches the `projects` / `specializations` fields that are
// explicitly provided.
export async function POST(req: Request) {
  const { id, projects, specializations } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'id es requerido' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (projects !== undefined) {
    updates.projects = Array.isArray(projects) ? projects : [];
  }
  if (specializations !== undefined) {
    updates.specializations = Array.isArray(specializations) ? specializations : [];
  }

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update(updates)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}