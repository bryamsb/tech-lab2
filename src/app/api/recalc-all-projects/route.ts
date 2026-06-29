import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// One-time maintenance endpoint: recalculates user_profiles.projects for every
// researcher/admin from the CURRENT team_lead/team_members of every project.
//
// Use this once to clean up existing rows where `projects` mixed project
// titles (e.g. "Plataforma TechLab") with project ids, or still listed a
// project the user was removed from long ago. Going forward,
// useSupabaseProjects.ts keeps this in sync automatically on every
// create/update/delete.
//
// Call it once, e.g. from the browser console while logged in as admin:
//   fetch('/api/recalc-all-projects', { method: 'POST' }).then(r => r.json()).then(console.log)
export async function POST() {
  const [{ data: users, error: usersError }, { data: allProjects, error: projectsError }] =
    await Promise.all([
      supabaseAdmin.from('user_profiles').select('id, full_name, role'),
      supabaseAdmin.from('projects').select('id, team_lead, team_members'),
    ]);

  if (usersError) return NextResponse.json({ error: usersError.message }, { status: 400 });
  if (projectsError) return NextResponse.json({ error: projectsError.message }, { status: 400 });

  const results: Array<{ id: string; full_name: string; projects: string[] }> = [];

  for (const user of users || []) {
    if (user.role !== 'researcher' && user.role !== 'admin') continue;

    const nameLower = (user.full_name || '').toLowerCase();
    const linkedProjectIds = (allProjects || [])
      .filter((project) => {
        const teamLead = (project.team_lead || '').toLowerCase();
        const teamMembers: string[] = Array.isArray(project.team_members) ? project.team_members : [];
        return teamLead === nameLower || teamMembers.map((m) => m.toLowerCase()).includes(nameLower);
      })
      .map((project) => project.id);

    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ projects: linkedProjectIds, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message, failedUser: user.id }, { status: 400 });
    }

    results.push({ id: user.id, full_name: user.full_name, projects: linkedProjectIds });
  }

  return NextResponse.json({ success: true, updated: results.length, results });
}