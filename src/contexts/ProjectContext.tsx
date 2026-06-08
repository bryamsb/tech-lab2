'use client';

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import {
  useSupabaseProjects,
  SupabaseProject,
} from '@/hooks/useSupabaseProjects';

// Interfaz legacy para mantener compatibilidad
export interface TechProject {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  relatedTechnologyIds: string[]; // IDs de tecnologías vinculadas
  status: 'active' | 'completed' | 'paused' | 'planning';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate?: string;
  teamLead: string;
  teamMembers: string[];
  budget?: number;
  progress: number; // 0-100
  objectives: string[];
  challenges?: string[];
  gallery: string[]; // URLs de imágenes
  demoUrl?: string;
  repositoryUrl?: string;
  documentation?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  positions?: string[];

}

interface ProjectContextType {
  projects: TechProject[];
  addProject: (
    project: Omit<TechProject, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<boolean>;
  updateProject: (
    id: string,
    updates: Partial<TechProject>
  ) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  getProject: (id: string) => TechProject | undefined;
  searchProjects: (query: string) => TechProject[];
  filterByCategory: (category: string) => TechProject[];
  filterByStatus: (status: TechProject['status']) => TechProject[];
  filterByPriority: (priority: TechProject['priority']) => TechProject[];
  getProjectsByTechnology: (technologyId: string) => TechProject[];
  getTechnologiesForProject: (projectId: string) => string[];
  isLoading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
}

// Función para convertir SupabaseProject a TechProject
function convertSupabaseProjectToLegacy(
  supabaseProject: SupabaseProject
): TechProject {
  return {
    id: supabaseProject.id,
    title: supabaseProject.title,
    description: supabaseProject.description,
    category: supabaseProject.category,
    technologies: supabaseProject.technologies,
    relatedTechnologyIds: supabaseProject.related_technology_ids,
    status: supabaseProject.status,
    priority: supabaseProject.priority,
    startDate: supabaseProject.start_date,
    endDate: supabaseProject.end_date,
    teamLead: supabaseProject.team_lead,
    teamMembers: supabaseProject.team_members,
    budget: supabaseProject.budget,
    progress: supabaseProject.progress,
    objectives: supabaseProject.objectives,
    challenges: supabaseProject.challenges,
    gallery: supabaseProject.gallery,
    demoUrl: supabaseProject.demo_url,
    repositoryUrl: supabaseProject.repository_url,
    documentation: supabaseProject.documentation,
    createdAt: supabaseProject.created_at,
    updatedAt: supabaseProject.updated_at,
    createdBy: supabaseProject.created_by || 'unknown',
    positions: supabaseProject.positions || [],

  };
}

// Función para convertir TechProject a datos para Supabase
function convertLegacyProjectToSupabase(
  legacyProject: Omit<TechProject, 'id' | 'createdAt' | 'updatedAt'>
): Omit<
  SupabaseProject,
  'id' | 'created_at' | 'updated_at' | 'researchers' | 'related_technologies'
> {
  return {
    title: legacyProject.title,
    description: legacyProject.description,
    category: legacyProject.category,
    technologies: legacyProject.technologies,
    related_technology_ids: legacyProject.relatedTechnologyIds,
    status: legacyProject.status,
    priority: legacyProject.priority,
    start_date: legacyProject.startDate,
    end_date: legacyProject.endDate,
    team_lead: legacyProject.teamLead,
    team_members: legacyProject.teamMembers,
    budget: legacyProject.budget,
    progress: legacyProject.progress,
    objectives: legacyProject.objectives,
    challenges: legacyProject.challenges || [],
    gallery: legacyProject.gallery,
    demo_url: legacyProject.demoUrl,
    repository_url: legacyProject.repositoryUrl,
    documentation: legacyProject.documentation,
    created_by: legacyProject.createdBy,
  };
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);
export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const {
    projects: supabaseProjects,
    loading,
    error,
    createProject,
    updateProject: updateSupabaseProject,
    deleteProject: deleteSupabaseProject,
    fetchProjects,
  } = useSupabaseProjects({ autoFetch: true });

  // Convertir proyectos de Supabase al formato legacy
  const projects = useMemo(() => {
    return supabaseProjects.map(convertSupabaseProjectToLegacy);
  }, [supabaseProjects]);

  const addProject = useCallback(
    async (
      newProject: Omit<TechProject, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<boolean> => {
      try {
        const supabaseData = convertLegacyProjectToSupabase(newProject);
        const result = await createProject(supabaseData);
        return result !== null;
      } catch (err) {
        console.error('Error adding project:', err);
        return false;
      }
    },
    [createProject]
  );

  const updateProject = useCallback(
    async (id: string, updates: Partial<TechProject>): Promise<boolean> => {
      try {
        // Convertir updates al formato de Supabase
        const supabaseUpdates: Partial<SupabaseProject> = {};

        if (updates.title) supabaseUpdates.title = updates.title;
        if (updates.description)
          supabaseUpdates.description = updates.description;
        if (updates.category) supabaseUpdates.category = updates.category;
        if (updates.technologies)
          supabaseUpdates.technologies = updates.technologies;
        if (updates.relatedTechnologyIds)
          supabaseUpdates.related_technology_ids = updates.relatedTechnologyIds;
        if (updates.status) supabaseUpdates.status = updates.status;
        if (updates.priority) supabaseUpdates.priority = updates.priority;
        if (updates.startDate) supabaseUpdates.start_date = updates.startDate;
        if (updates.endDate) supabaseUpdates.end_date = updates.endDate;
        if (updates.teamLead) supabaseUpdates.team_lead = updates.teamLead;
        if (updates.teamMembers)
          supabaseUpdates.team_members = updates.teamMembers;
        if (updates.budget !== undefined)
          supabaseUpdates.budget = updates.budget;
        if (updates.progress !== undefined)
          supabaseUpdates.progress = updates.progress;
        if (updates.objectives) supabaseUpdates.objectives = updates.objectives;
        if (updates.challenges) supabaseUpdates.challenges = updates.challenges;
        if (updates.gallery) supabaseUpdates.gallery = updates.gallery;
        if (updates.demoUrl) supabaseUpdates.demo_url = updates.demoUrl;
        if (updates.repositoryUrl)
          supabaseUpdates.repository_url = updates.repositoryUrl;
        if (updates.documentation)
          supabaseUpdates.documentation = updates.documentation;

        const result = await updateSupabaseProject(id, supabaseUpdates);
        return result !== null;
      } catch (err) {
        console.error('Error updating project:', err);
        return false;
      }
    },
    [updateSupabaseProject]
  );

  const deleteProject = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        return await deleteSupabaseProject(id);
      } catch (err) {
        console.error('Error deleting project:', err);
        return false;
      }
    },
    [deleteSupabaseProject]
  );

  const getProject = useCallback(
    (id: string) => {
      return projects.find((project) => project.id === id);
    },
    [projects]
  );

  const searchProjects = useCallback(
    (query: string) => {
      if (!query.trim()) return projects;

      const lowerQuery = query.toLowerCase();
      return projects.filter(
        (project) =>
          project.title.toLowerCase().includes(lowerQuery) ||
          project.description.toLowerCase().includes(lowerQuery) ||
          project.category.toLowerCase().includes(lowerQuery) ||
          project.technologies.some((tech) =>
            tech.toLowerCase().includes(lowerQuery)
          ) ||
          project.teamLead.toLowerCase().includes(lowerQuery)
      );
    },
    [projects]
  );

  const filterByCategory = useCallback(
    (category: string) => {
      if (!category) return projects;
      return projects.filter((project) => project.category === category);
    },
    [projects]
  );

  const filterByStatus = useCallback(
    (status: TechProject['status']) => {
      return projects.filter((project) => project.status === status);
    },
    [projects]
  );

  const filterByPriority = useCallback(
    (priority: TechProject['priority']) => {
      return projects.filter((project) => project.priority === priority);
    },
    [projects]
  );

  const getProjectsByTechnology = useCallback(
    (technologyId: string) => {
      return projects.filter((project) =>
        project.relatedTechnologyIds.includes(technologyId)
      );
    },
    [projects]
  );

  const getTechnologiesForProject = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId);
      return project ? project.relatedTechnologyIds : [];
    },
    [projects]
  );

  const value: ProjectContextType = {
    projects,
    addProject,
    updateProject,
    deleteProject,
    getProject,
    searchProjects,
    filterByCategory,
    filterByStatus,
    filterByPriority,
    getProjectsByTechnology,
    getTechnologiesForProject,
    isLoading: loading,
    error,
    refreshProjects: fetchProjects,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
