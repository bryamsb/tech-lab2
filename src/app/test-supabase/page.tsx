'use client';

import { useSupabaseProjects } from '@/hooks/useSupabaseProjects';
import { useSupabaseResearchers } from '@/hooks/useSupabaseResearchers';

export default function SupabaseTest() {
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useSupabaseProjects();
  const {
    researchers,
    loading: researchersLoading,
    error: researchersError,
  } = useSupabaseResearchers();

  if (projectsLoading || researchersLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-xl">Conectando con Supabase...</p>
        </div>
      </div>
    );
  }

  if (projectsError || researchersError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            Error de Conexión
          </h1>
          <p className="text-gray-300">{projectsError || researchersError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-green-400">
          🎉 ¡Supabase Conectado Exitosamente!
        </h1>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-blue-400">
              {projects.length}
            </h2>
            <p className="text-gray-300">Proyectos Cargados</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-purple-400">
              {researchers.length}
            </h2>
            <p className="text-gray-300">Investigadores</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-green-400">
              {projects.filter((p) => p.status === 'active').length}
            </h2>
            <p className="text-gray-300">Proyectos Activos</p>
          </div>
        </div>

        {/* Proyectos Recientes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">
            🚀 Proyectos Recientes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
              <div key={project.id} className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex justify-between items-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      project.status === 'active'
                        ? 'bg-green-600'
                        : 'bg-yellow-600'
                    }`}
                  >
                    {project.status}
                  </span>
                  <span className="text-sm text-gray-300">
                    {project.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipo Tech Lab */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-purple-400">
            👥 Equipo Tech Lab
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {researchers.slice(0, 6).map((researcher) => (
              <div key={researcher.id} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  {researcher.avatar_url ? (
                    <div className="w-12 h-12 rounded-full mr-3 bg-gray-600 flex items-center justify-center">
                      👤
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-600 mr-3 flex items-center justify-center">
                      👤
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{researcher.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {researcher.position}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{researcher.department}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400">
            ✅ Base de datos Supabase funcionando correctamente
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Datos cargados desde PostgreSQL en tiempo real
          </p>
        </div>
      </div>
    </div>
  );
}
