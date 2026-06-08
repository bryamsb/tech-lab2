'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseProjects, SupabaseProject } from './useSupabaseProjects';

export interface SupabaseTechnology {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  primary_color: string;
  description: string;
  about_title: string;
  about_content: string[];
  features_title: string;
  features_items: Array<{
    text: string;
    color: string;
  }>;
  example_projects: Array<{
    title: string;
    description: string;
  }>;
  has_direct_links: boolean;
  direct_links?: Array<{
    href: string;
    text: string;
    primary: boolean;
  }>;
  created_at: string;
  updated_at: string;
}

// Interfaz legacy para compatibilidad
export interface Technology {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  primaryColor: string;
  description: string;
  about: {
    title: string;
    content: string[];
  };
  features: {
    title: string;
    items: {
      text: string;
      color: string;
    }[];
  };
  projects: {
    title: string;
    description: string;
  }[];
  relatedProjects?: {
    id: string;
    title: string;
    status: string;
    progress: number;
  }[];
  hasDirectLinks?: boolean;
  directLinks?: {
    href: string;
    text: string;
    primary: boolean;
  }[];
}

// Función para convertir datos de Supabase al formato legacy
function convertSupabaseTechnologyToLegacy(
  supabaseTech: SupabaseTechnology,
  relatedProjects: SupabaseProject[]
): Technology {
  return {
    id: supabaseTech.id,
    name: supabaseTech.name,
    icon: supabaseTech.icon,
    gradient: supabaseTech.gradient,
    primaryColor: supabaseTech.primary_color,
    description: supabaseTech.description,
    about: {
      title: supabaseTech.about_title,
      content: supabaseTech.about_content,
    },
    features: {
      title: supabaseTech.features_title,
      items: supabaseTech.features_items,
    },
    projects: supabaseTech.example_projects,
    relatedProjects: relatedProjects.map((project) => ({
      id: project.id,
      title: project.title,
      status: project.status,
      progress: project.progress,
    })),
    hasDirectLinks: supabaseTech.has_direct_links,
    directLinks: supabaseTech.direct_links,
  };
}

export function useTechnologies() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { projects } = useSupabaseProjects();

  const loadTechnologies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/mocks/technologies.json');
      if (!response.ok) {
        throw new Error('No se pudo cargar technologies.json');
      }
      const json = await response.json();
      const technologiesData: SupabaseTechnology[] = (json.technologies || []).map(
        (item: Record<string, unknown>) => ({
          ...item,
          example_projects: (item.projects as SupabaseTechnology['example_projects']) || [],
        })
      ) as SupabaseTechnology[];

      // Convertir y enriquecer con proyectos relacionados
      const enrichedTechnologies = technologiesData.map(
        (supabaseTech: SupabaseTechnology) => {
          // Encontrar proyectos relacionados por technology IDs
          const relatedProjects = projects.filter((project) =>
            project.related_technology_ids?.includes(supabaseTech.id)
          );

          return convertSupabaseTechnologyToLegacy(
            supabaseTech,
            relatedProjects
          );
        }
      );

      setTechnologies(enrichedTechnologies);
    } catch (err) {
      console.error('Error in loadTechnologies:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [projects]);

  useEffect(() => {
    loadTechnologies();
  }, [loadTechnologies]);

  const getTechnology = useCallback(
    (id: string) => {
      return technologies.find((tech) => tech.id === id);
    },
    [technologies]
  );

  const getTechnologiesByProject = useCallback(
    (projectId: string) => {
      return technologies.filter((tech) =>
        tech.relatedProjects?.some((proj) => proj.id === projectId)
      );
    },
    [technologies]
  );

  const searchTechnologies = useCallback(
    (query: string) => {
      if (!query.trim()) return technologies;

      const lowerQuery = query.toLowerCase();
      return technologies.filter(
        (tech) =>
          tech.name.toLowerCase().includes(lowerQuery) ||
          tech.description.toLowerCase().includes(lowerQuery) ||
          tech.about.content.some((content) =>
            content.toLowerCase().includes(lowerQuery)
          )
      );
    },
    [technologies]
  );

  return {
    technologies,
    loading,
    error,
    getTechnology,
    getTechnologiesByProject,
    searchTechnologies,
    refreshTechnologies: loadTechnologies,
    clearError: () => setError(null),
  };
}
