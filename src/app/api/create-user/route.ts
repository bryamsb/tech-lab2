import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { username, full_name, email, password, phone, projects, specializations } = await req.json();

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabaseAdmin.from('user_profiles').insert({
    id: data.user.id,
    username,
    full_name,
    email,
    phone: phone || '',
    projects: projects || [],
    role: 'researcher',
    avatar_url: '',
    academic_level: 'student',
    university: 'Universidad Nacional de Ingeniería',
    degree: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    specializations: specializations ? [specializations] : [],

  });

  return NextResponse.json({ success: true });
}