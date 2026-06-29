"use client";

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback, useRef } from 'react';

export interface SupabaseProject {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  related_technology_ids: string[];
  status: 'active' | 'completed' | 'paused' | 'planning';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date: string;
  end_date?: string;
  team_lead: string;
  team_members: string[];
  budget?: number;
  progress: number;
  objectives: string[];
  challenges: string[];
  gallery: string[];
  demo_url?: string;
  repository_url?: string;
  documentation?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  positions?: string[];

  researchers?: Array<{ id: string; name: string; role: string; is_current: boolean }>;
  related_technologies?: Array<{ id: string; name: string; icon: string; usage_type: string }>;
}

interface ProjectFilters {
  status?: SupabaseProject['status'];
  category?: string;
  priority?: SupabaseProject['priority'];
  technology?: string;
  search?: string;
}

interface UseSupabaseProjectsOptions {
  autoFetch?: boolean;
}

// ─── Helper: parse positions array into memberName -> [positionNames] map ────
function parsePositions(positions: string[]): Record<string, string[]> {
  const memberPositions: Record<string, string[]> = {};
  for (const p of positions) {
    const match = p.match(/^(.+?)\s*\((.+)\)$/);
    if (match) {
      const posName = match[1].trim();
      const memberName = match[2].trim();
      if (!memberPositions[memberName]) memberPositions[memberName] = [];
      if (!memberPositions[memberName].includes(posName)) {
        memberPositions[memberName].push(posName);
      }
    }
  }
  return memberPositions;
}

// ─── Helper: write to user_profiles via admin API route (bypasses RLS) ────────
// A logged-in user can normally only UPDATE their own user_profiles row under
// RLS. Direct client-side updates to ANOTHER member's row are silently
// rejected (no error, 0 rows affected), which is why syncing projects/
// specializations only ever "worked" for the currently logged-in user.
// This calls a server route that uses the Supabase service role key.
async function adminUpdateUserProfile(
  id: string,
  updates: { projects?: string[]; specializations?: string[] }
): Promise<void> {
  try {
    const res = await fetch('/api/sync-user-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error('Error sincronizando user_profiles:', body.error || res.statusText);
    }
  } catch (err) {
    console.error('Error sincronizando user_profiles:', err);
  }
}

// ─── Helper: recalculate specializations for a member from ALL their projects ──
// This replaces the old "additive-only" approach.
// It fetches every project the member belongs to, collects ALL positions
// assigned to them across those projects, and writes the full set to user_profiles.
async function recalcMemberSpecializations(memberName: string): Promise<void> {
  // 1. Find the user profile
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, specializations')
    .ilike('full_name', memberName)
    .limit(1);

  if (!profiles || profiles.length === 0) return;
  const profile = profiles[0];

  // 2. Find all projects where this member has an assigned position
  //    Positions are stored as "Role Name (Member Name)" strings
  const { data: allProjects } = await supabase
    .from('projects')
    .select('positions');

  if (!allProjects) return;

  // 3. Collect every position assigned to this member across all projects
  const memberNameLower = memberName.toLowerCase();
  const allSpecs: string[] = [];

  for (const project of allProjects) {
    const positions: string[] = Array.isArray(project.positions) ? project.positions : [];
    for (const p of positions) {
      const match = p.match(/^(.+?)\s*\((.+)\)$/);
      if (match) {
        const posName = match[1].trim();
        const assignedTo = match[2].trim().toLowerCase();
        if (assignedTo === memberNameLower && !allSpecs.includes(posName)) {
          allSpecs.push(posName);
        }
      }
    }
  }

  // 4. Write the recalculated specs (replaces whatever was there)
  // ✅ FIX: direct supabase.update() here was silently blocked by RLS for
  // any profile that isn't the logged-in user's own. Route through the
  // admin API instead.
  await adminUpdateUserProfile(profile.id, { specializations: allSpecs });
}

// ─── Helper: sync specializations for all members mentioned in positions ──────
// positions format: "Position Name (Member Name)" or just "Position Name"
// Now recalculates from scratch instead of only adding.
async function syncMemberSpecializations(positions: string[]): Promise<void> {
  if (!positions || positions.length === 0) return;

  // Collect unique member names mentioned in these positions
  const memberNames = new Set<string>();
  for (const p of positions) {
    const match = p.match(/^(.+?)\s*\((.+)\)$/);
    if (match) memberNames.add(match[2].trim());
  }

  // Recalculate each member's specs from ALL their projects
  for (const memberName of memberNames) {
    await recalcMemberSpecializations(memberName);
  }
}

// ─── Helper: sync specializations for members whose positions were REMOVED ────
// oldPositions: positions before the update
// newPositions: positions after the update
// Members that lost a position need their specs recalculated.
async function syncRemovedPositions(
  oldPositions: string[],
  newPositions: string[]
): Promise<void> {
  const oldMap = parsePositions(oldPositions);
  const newMap = parsePositions(newPositions);

  // Find members who lost at least one position
  const affectedMembers = new Set<string>();
  for (const [memberName, oldSpecs] of Object.entries(oldMap)) {
    const newSpecs = newMap[memberName] || [];
    const lost = oldSpecs.filter((s) => !newSpecs.includes(s));
    if (lost.length > 0) affectedMembers.add(memberName);
  }

  for (const memberName of affectedMembers) {
    await recalcMemberSpecializations(memberName);
  }
}

// ─── Helper: recalculate a member's linked project IDs from CURRENT team membership ──
// Looks at every project's CURRENT team_lead/team_members, collects the ids of
// projects where this member currently appears, and OVERWRITES
// user_profiles.projects with that set.
//
// This fixes two related issues:
//  1. Legacy rows stored a mix of project TITLES and project IDs in
//     `projects` (e.g. ["Plataforma TechLab", "1a2b9f6b-..."]). Recalculating
//     from scratch always produces a clean array of project ids.
//  2. The old syncMemberProjects only ever ADDED ids and never removed one
//     when a member was taken off a project's team — so a user kept showing
//     as linked to "Plataforma TechLab" no matter how many times they were
//     removed. Recalculating replaces the whole array, so removed projects
//     simply disappear.
async function recalcMemberProjects(memberName: string): Promise<void> {
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id')
    .ilike('full_name', memberName)
    .limit(1);

  if (!profiles || profiles.length === 0) return;
  const profile = profiles[0];

  const { data: allProjects } = await supabase
    .from('projects')
    .select('id, team_lead, team_members');

  if (!allProjects) return;

  const memberNameLower = memberName.toLowerCase();
  const linkedProjectIds: string[] = [];

  for (const project of allProjects as Array<{
    id: string;
    team_lead: string | null;
    team_members: string[] | null;
  }>) {
    const teamLead = (project.team_lead || '').toLowerCase();
    const teamMembers = (project.team_members || []).map((m) => m.toLowerCase());
    if (teamLead === memberNameLower || teamMembers.includes(memberNameLower)) {
      linkedProjectIds.push(project.id);
    }
  }

  await adminUpdateUserProfile(profile.id, { projects: linkedProjectIds });
}

// ─── Helper: recalc projects for everyone whose team membership on a project changed ──
// oldMembers/newMembers are the team_lead + team_members before/after a save
// (or, for delete, oldMembers = the deleted project's team and newMembers = []).
// The union covers additions, removals, and members unaffected by this save
// (who get a free normalization of any stale title/UUID entries too).
async function syncMemberProjects(oldMembers: string[], newMembers: string[]): Promise<void> {
  const affected = new Set<string>([...oldMembers, ...newMembers].filter(Boolean));
  for (const memberName of affected) {
    await recalcMemberProjects(memberName);
  }
}

export function useSupabaseProjects(options?: UseSupabaseProjectsOptions) {
  const autoFetch = options?.autoFetch ?? true;
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasAutoFetched = useRef(false);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getProject = useCallback((id: string): SupabaseProject | null => {
    return projects.find((project) => project.id === id) || null;
  }, [projects]);

  const filterProjects = useCallback((filters: ProjectFilters): SupabaseProject[] => {
    return projects.filter((project) => {
      if (filters.status && project.status !== filters.status) return false;
      if (filters.category && project.category !== filters.category) return false;
      if (filters.priority && project.priority !== filters.priority) return false;
      if (filters.technology && !project.related_technology_ids.includes(filters.technology)) return false;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          project.title.toLowerCase().includes(searchTerm) ||
          project.description.toLowerCase().includes(searchTerm) ||
          project.category.toLowerCase().includes(searchTerm) ||
          project.technologies.some((tech) => tech.toLowerCase().includes(searchTerm))
        );
      }
      return true;
    });
  }, [projects]);

  const getProjectsByTechnology = useCallback((technologyId: string): SupabaseProject[] => {
    return projects.filter((project) => project.related_technology_ids.includes(technologyId));
  }, [projects]);

  const createProject = useCallback(async (
    projectData: Omit<SupabaseProject, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SupabaseProject | null> => {
    try {
      const now = new Date().toISOString();
      const cleanData = { ...projectData };
      const cleanProject = {
        ...cleanData,
        id: crypto.randomUUID(),
        start_date: cleanData.start_date || null,
        end_date: cleanData.end_date || null,
        budget: cleanData.budget || null,
        progress: cleanData.progress || null,
        created_at: now,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([cleanProject])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No se pudo crear el proyecto');

      setProjects((prev) => [data as SupabaseProject, ...prev]);

      // Assign project to all team members in user_profiles.projects
      const allMembers = [
        projectData.team_lead,
        ...(projectData.team_members || []),
      ].filter(Boolean) as string[];
      await syncMemberProjects([], allMembers);

      // Sync specializations for assigned positions (recalculates from scratch)
      if (projectData.positions && projectData.positions.length > 0) {
        await syncMemberSpecializations(projectData.positions);
      }

      return data as SupabaseProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando proyecto');
      console.error('Error creating project:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      return null;
    }
  }, []);

  const updateProject = useCallback(async (
    id: string,
    updates: Partial<SupabaseProject>
  ): Promise<boolean> => {
    try {
      // Capture old team + positions BEFORE the update so we can detect removals
      const oldProject = projects.find((p) => p.id === id);
      const oldPositions: string[] = oldProject?.positions ?? [];
      const oldMembers = [
        oldProject?.team_lead,
        ...(oldProject?.team_members || []),
      ].filter(Boolean) as string[];

      const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Proyecto no encontrado');

      setProjects((prev) =>
        prev.map((project) =>
          project.id === id ? { ...project, ...(data as SupabaseProject) } : project
        )
      );

      // Re-sync project assignment when team changes on update
      if (updates.team_lead !== undefined || updates.team_members !== undefined) {
        const updatedProject = data as SupabaseProject;
        const newMembers = [
          updatedProject.team_lead,
          ...(updatedProject.team_members || []),
        ].filter(Boolean) as string[];
        await syncMemberProjects(oldMembers, newMembers);
      }

      // Sync specializations when positions change
      if (updates.positions !== undefined) {
        const newPositions: string[] = updates.positions ?? [];

        // 1. Recalc specs for members who GAINED or KEPT positions (additive side)
        if (newPositions.length > 0) {
          await syncMemberSpecializations(newPositions);
        }

        // 2. Recalc specs for members who LOST positions (removal side)
        await syncRemovedPositions(oldPositions, newPositions);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando proyecto');
      console.error('Error updating project:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      return false;
    }
  }, [projects]);

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Before deleting, recalc specs for all members who had positions in this project
      const project = projects.find((p) => p.id === id);
      if (project?.positions && project.positions.length > 0) {
        // Remove this project's positions first by passing empty newPositions
        await syncRemovedPositions(project.positions, []);
      }

      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects((prev) => prev.filter((project) => project.id !== id));

      // Recalc projects for the team so the now-deleted project disappears
      // from their user_profiles.projects (run after the delete so the
      // recalc query no longer sees this project).
      if (project) {
        const members = [project.team_lead, ...(project.team_members || [])].filter(Boolean) as string[];
        await syncMemberProjects(members, []);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando proyecto');
      console.error('Error deleting project:', err);
      return false;
    }
  }, [projects]);

  const getProjectStats = useCallback(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === 'active').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const avgProgress = projects.reduce((sum, p) => sum + p.progress, 0) / total || 0;
    return {
      total, active, completed,
      paused: projects.filter((p) => p.status === 'paused').length,
      planning: projects.filter((p) => p.status === 'planning').length,
      avgProgress: Math.round(avgProgress),
      categories: [...new Set(projects.map((p) => p.category))].length,
      technologies: [...new Set(projects.flatMap((p) => p.technologies))].length,
    };
  }, [projects]);

  useEffect(() => {
    if (!autoFetch) return;
    if (hasAutoFetched.current) return;
    hasAutoFetched.current = true;
    fetchProjects();
  }, [autoFetch, fetchProjects]);

  return {
    projects, loading, error,
    fetchProjects, getProject, filterProjects,
    getProjectsByTechnology, createProject, updateProject,
    deleteProject, getProjectStats,
  };
}