'use client';

import { supabase } from '@/lib/supabase';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface SupabaseResearcher {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  avatar_url?: string;
  position: string;
  department: string;
  specializations: string[];
  biography: string;
  academic_level: 'undergraduate' | 'bachelor' | 'master' | 'phd' | 'postdoc' | 'professor' | 'student' | 'technician';

  status: 'active' | 'inactive' | 'alumni' | 'visiting';
  join_date: string;
  end_date?: string;

  // Información de contacto
  phone?: string;
  linkedin_url?: string;
  research_gate_url?: string;
  orcid?: string;
  personal_website?: string;

  // Información académica
  university?: string;
  degree?: string;
  research_interests: string[];
  publications: string[];
  achievements: string[];

  // Estadísticas
  projects_completed: number;
  publications_count: number;
  years_experience: number;

  created_by?: string;
  created_at: string;
  updated_at: string;

  // Proyectos relacionados (populados)
  current_projects?: Array<{
    id: string;
    title: string;
    role: string;
    status: string;
    progress: number;
  }>;

  past_projects?: Array<{
    id: string;
    title: string;
    role: string;
    status: string;
  }>;
}

type MockUserProfile = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  projects?: string | string[];
  specializations?: string[];
  phone?: string;
  linkedin_url?: string;
  degree?: string;
  university?: string;
  created_at: string;
  updated_at: string;
};

type MockProject = {
  id: string;
  title: string;
  status: string;
  progress: number;
  team_lead?: string;
  team_members?: string[];
};

interface ResearcherFilters {
  department?: string;
  status?: SupabaseResearcher['status'];
  academic_level?: SupabaseResearcher['academic_level'];
  specialization?: string;
  search?: string;
}

interface UseSupabaseResearchersOptions {
  /** Si true, el hook hará una carga inicial al montar (con guard para StrictMode). */
  autoFetch?: boolean;
}

// Helper: detect if a string looks like a UUID
const isUUID = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());

export function useSupabaseResearchers(options?: UseSupabaseResearchersOptions) {
  const autoFetch = options?.autoFetch ?? true;
  const [researchers, setResearchers] = useState<SupabaseResearcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasAutoFetched = useRef(false);

  const normalizeText = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const parseUserProjectRefs = (projects: MockUserProfile['projects']): string[] => {
    if (!projects) return [];

    if (Array.isArray(projects)) {
      return projects.map((item) => item.trim()).filter(Boolean);
    }

    return projects
      .split('/')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const mapMockUserToResearcher = useCallback(
    (user: MockUserProfile, projectsData: MockProject[]): SupabaseResearcher => {
      const fullNameLower = user.full_name.toLowerCase();

      // Find projects where user is in team by name
      const relatedProjectsByTeam = projectsData.filter((project) => {
        const teamLead = (project.team_lead || '').toLowerCase();
        const teamMembers = (project.team_members || []).map((member) =>
          member.toLowerCase()
        );
        return teamLead === fullNameLower || teamMembers.includes(fullNameLower);
      });

      // Parse user.projects — can be UUIDs or names
      const declaredProjectRefs = parseUserProjectRefs(user.projects);

      // Separate UUIDs from name-based refs
      const declaredUUIDs = declaredProjectRefs.filter(isUUID);
      const declaredNames = declaredProjectRefs.filter((ref) => !isUUID(ref));

      // Match by UUID
      const relatedProjectsByUUID = declaredUUIDs.length > 0
        ? projectsData.filter((project) => declaredUUIDs.includes(project.id))
        : [];

      // Match by name (fuzzy)
      const relatedProjectsByDeclaredNames = declaredNames.length > 0
        ? projectsData.filter((project) => {
            const normalizedProjectTitle = normalizeText(project.title);
            return declaredNames.some((declaredName) => {
              const normalizedDeclared = normalizeText(declaredName);
              return (
                normalizedProjectTitle.includes(normalizedDeclared) ||
                normalizedDeclared.includes(normalizedProjectTitle)
              );
            });
          })
        : [];

      // Merge all matched projects (deduplicate by id)
      const allMatchedByDeclaration = [
        ...relatedProjectsByUUID,
        ...relatedProjectsByDeclaredNames,
      ].filter(
        (project, index, self) => self.findIndex((p) => p.id === project.id) === index
      );

      // Priority: declared project refs > team membership
      const relatedProjects = allMatchedByDeclaration.length > 0
        ? allMatchedByDeclaration
        : relatedProjectsByTeam;

      // Build research_interests from project TITLES (never UUIDs)
      const researchInterestTitles = relatedProjects.map((p) => p.title);

      const currentProjects = relatedProjects
        .filter((project) => project.status === 'active' || project.status === 'planning')
        .map((project) => ({
          id: project.id,
          title: project.title,
          role: (project.team_lead || '').toLowerCase() === fullNameLower ? 'team_lead' : 'team_member',
          status: project.status,
          progress: project.progress || 0,
        }));

      const pastProjects = relatedProjects
        .filter((project) => project.status === 'completed' || project.status === 'paused')
        .map((project) => ({
          id: project.id,
          title: project.title,
          role: (project.team_lead || '').toLowerCase() === fullNameLower ? 'team_lead' : 'team_member',
          status: project.status,
        }));

      return {
        id: user.id,
        user_id: user.id,
        name: user.full_name,
        email: user.email || `${user.username}@techlab.local`,
        avatar_url: user.avatar_url || '',
        position: (user as any).position || (user.role === 'admin' ? 'Coordinador' : 'Investigador'),
        department: 'Tech Lab',
        specializations: (user.specializations && user.specializations.length > 0)
          ? user.specializations
          : [],
        biography: user.bio || (researchInterestTitles.length ? `Investigador Tech Lab (${researchInterestTitles.join(' / ')}).` : ''),
        academic_level: (user as any).academic_level || 'bachelor',

        status: 'active',
        join_date: user.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        end_date: undefined,
        phone: user.phone || '',
        linkedin_url: user.linkedin_url || '',
        research_gate_url: '',
        orcid: '',
        personal_website: '',
        university: (user as any).university || 'Universidad Nacional de Ingeniería',
        degree: user.degree || '',
        // Use project TITLES, never raw UUIDs
        research_interests: researchInterestTitles.length
          ? researchInterestTitles
          : user.bio
          ? [user.bio]
          : [],
        publications: [],
        achievements: [],
        projects_completed: relatedProjects.length,
        publications_count: 0,
        years_experience: 1,
        created_by: 'mock-system',
        created_at: user.created_at,
        updated_at: user.updated_at,
        current_projects: currentProjects,
        past_projects: pastProjects,
      };
    },
    []
  );

  // Cargar todos los investigadores con sus proyectos
  const fetchResearchers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersRes, projectsRes] = await Promise.all([
        supabase.from('user_profiles').select('*'),
        supabase.from('projects').select('*'),
      ]);

      if (usersRes.error) throw usersRes.error;
      if (projectsRes.error) throw projectsRes.error;

      const users: MockUserProfile[] = usersRes.data || [];
      const projectsData: MockProject[] = projectsRes.data || [];

      const transformedResearchers = users
        .filter((user) => user.role === 'researcher' || user.role === 'admin')
        .map((user) => mapMockUserToResearcher(user, projectsData));

      setResearchers(transformedResearchers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching researchers:', err);
    } finally {
      setLoading(false);
    }
  }, [mapMockUserToResearcher]);

  // Obtener investigador por ID
  const getResearcher = useCallback(async (id: string): Promise<SupabaseResearcher | null> => {
    return researchers.find((researcher) => researcher.id === id) || null;
  }, [researchers]);

  // Filtrar investigadores
  const filterResearchers = useCallback((filters: ResearcherFilters): SupabaseResearcher[] => {
    return researchers.filter(researcher => {
      if (filters.department && researcher.department !== filters.department) return false;
      if (filters.status && researcher.status !== filters.status) return false;
      if (filters.academic_level && researcher.academic_level !== filters.academic_level) return false;
      if (filters.specialization && !researcher.specializations.includes(filters.specialization)) return false;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          researcher.name.toLowerCase().includes(searchTerm) ||
          researcher.position.toLowerCase().includes(searchTerm) ||
          researcher.department.toLowerCase().includes(searchTerm) ||
          researcher.specializations.some(spec => spec.toLowerCase().includes(searchTerm)) ||
          researcher.research_interests.some(interest => interest.toLowerCase().includes(searchTerm))
        );
      }
      return true;
    });
  }, [researchers]);

  // Obtener investigadores por proyecto
  const getResearchersByProject = useCallback(async (projectId: string): Promise<SupabaseResearcher[]> => {
    return researchers.filter(
      (researcher) =>
        researcher.current_projects?.some((project) => project.id === projectId) ||
        researcher.past_projects?.some((project) => project.id === projectId)
    );
  }, [researchers]);

  // Crear investigador
  const createResearcher = useCallback(async (
    researcherData: Omit<SupabaseResearcher, 'id' | 'created_at' | 'updated_at' | 'current_projects' | 'past_projects'>
  ): Promise<SupabaseResearcher | null> => {
    try {
      const now = new Date().toISOString();
      const newResearcher: SupabaseResearcher = {
        ...researcherData,
        id: crypto.randomUUID(),
        created_at: now,
        updated_at: now,
        current_projects: [],
        past_projects: [],
      };

      setResearchers((prev) => [newResearcher, ...prev]);
      return newResearcher;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando investigador');
      console.error('Error creating researcher:', err);
      return null;
    }
  }, []);

  // Actualizar investigador
  const updateResearcher = useCallback(async (
    id: string,
    updates: Partial<SupabaseResearcher>
  ): Promise<boolean> => {
    try {
      let found = false;
      setResearchers((prev) =>
        prev.map((researcher) => {
          if (researcher.id !== id) return researcher;
          found = true;
          return {
            ...researcher,
            ...updates,
            updated_at: new Date().toISOString(),
          };
        })
      );
      return found;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando investigador');
      console.error('Error updating researcher:', err);
      return false;
    }
  }, []);

  // Eliminar investigador
  const deleteResearcher = useCallback(async (id: string): Promise<boolean> => {
    try {
      setResearchers((prev) => prev.filter((researcher) => researcher.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando investigador');
      console.error('Error deleting researcher:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!autoFetch) return;
    if (hasAutoFetched.current) return;
    hasAutoFetched.current = true;
    fetchResearchers();
  }, [autoFetch, fetchResearchers]);

  return {
    researchers,
    loading,
    error,
    fetchResearchers,
    getResearcher,
    filterResearchers,
    getResearchersByProject,
    createResearcher,
    updateResearcher,
    deleteResearcher,
  };
}