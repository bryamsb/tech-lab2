import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { id, full_name, phone, projects, specializations } = await req.json();

  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({
      full_name,
      phone: phone || '',
      projects: Array.isArray(projects) ? projects : (projects ? [projects] : []),
      specializations: Array.isArray(specializations) ? specializations : (specializations ? [specializations] : []),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}