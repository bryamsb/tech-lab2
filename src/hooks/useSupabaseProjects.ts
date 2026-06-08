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


  // Relaciones populadas
  researchers?: Array<{
    id: string;
    name: string;
    role: string;
    is_current: boolean;
  }>;

  related_technologies?: Array<{
    id: string;
    name: string;
    icon: string;
    usage_type: string;
  }>;
}

interface ProjectFilters {
  status?: SupabaseProject['status'];
  category?: string;
  priority?: SupabaseProject['priority'];
  technology?: string;
  search?: string;
}

interface UseSupabaseProjectsOptions {
  /** Si true, el hook hará una carga inicial al montar (con guard para StrictMode). */
  autoFetch?: boolean;
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

      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);


  // Obtener proyecto por ID desde el estado local
  const getProject = useCallback(
    (id: string): SupabaseProject | null => {
      return projects.find((project) => project.id === id) || null;
    },
    [projects]
  );

  // Filtrar proyectos según filtros
  const filterProjects = useCallback(
    (filters: ProjectFilters): SupabaseProject[] => {
      return projects.filter((project) => {
        if (filters.status && project.status !== filters.status) return false;
        if (filters.category && project.category !== filters.category) return false;
        if (filters.priority && project.priority !== filters.priority) return false;
        if (
          filters.technology &&
          !project.related_technology_ids.includes(filters.technology)
        ) return false;
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
    },
    [projects]
  );

  // Obtener proyectos por tecnología
  const getProjectsByTechnology = useCallback(
    (technologyId: string): SupabaseProject[] => {
      return projects.filter((project) =>
        project.related_technology_ids.includes(technologyId)
      );
    },
    [projects]
  );

  // Crear proyecto
  const createProject = useCallback(
    async (
      projectData: Omit<SupabaseProject, 'id' | 'created_at' | 'updated_at'>
    ): Promise<SupabaseProject | null> => {
      try {
        const now = new Date().toISOString();
        const newProject: SupabaseProject = {
          ...projectData,
          id: crypto.randomUUID(),
          created_at: now,
          updated_at: now,
        };

        setProjects((prev) => [newProject, ...prev]);
        return newProject;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error creando proyecto');
        console.error('Error creating project:', err);
        return null;
      }
    },
    []
  );

  // Actualizar proyecto
  const updateProject = useCallback(
    async (id: string, updates: Partial<SupabaseProject>): Promise<boolean> => {
      try {
        let found = false;
        setProjects((prev) =>
          prev.map((project) => {
            if (project.id !== id) return project;
            found = true;
            return {
              ...project,
              ...updates,
              updated_at: new Date().toISOString(),
            };
          })
        );

        if (!found) {
          throw new Error('Proyecto no encontrado');
        }
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error actualizando proyecto'
        );
        console.error('Error updating project:', err);
        return false;
      }
    },
    []
  );

  // Eliminar proyecto
  const deleteProject = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        let deleted = false;
        setProjects((prev) => {
          const next = prev.filter((project) => project.id !== id);
          deleted = next.length !== prev.length;
          return next;
        });

        if (!deleted) {
          throw new Error('Proyecto no encontrado');
        }
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error eliminando proyecto'
        );
        console.error('Error deleting project:', err);
        return false;
      }
    },
    []
  );

  // Obtener estadísticas
  const getProjectStats = useCallback(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === 'active').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const avgProgress =
      projects.reduce((sum, p) => sum + p.progress, 0) / total || 0;

    return {
      total,
      active,
      completed,
      paused: projects.filter((p) => p.status === 'paused').length,
      planning: projects.filter((p) => p.status === 'planning').length,
      avgProgress: Math.round(avgProgress),
      categories: [...new Set(projects.map((p) => p.category))].length,
      technologies: [...new Set(projects.flatMap((p) => p.technologies))]
        .length,
    };
  }, [projects]);

  // Cargar datos al montar el componente (una sola vez, protegido ante StrictMode)
  useEffect(() => {
    if (!autoFetch) return;
    if (hasAutoFetched.current) return;
    hasAutoFetched.current = true;
    fetchProjects();
  }, [autoFetch, fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    getProject,
    filterProjects,
    getProjectsByTechnology,
    createProject,
    updateProject,
    deleteProject,
    getProjectStats,
  };
}
