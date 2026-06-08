'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink, Zap } from 'lucide-react';
import { useTechnologies, Technology } from '@/hooks/useTechnologies';

export default function TechnologiesPage() {
  const { technologies, loading } = useTechnologies();

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="text-theme-text">Cargando tecnologías...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-background transition-colors duration-300">
      {/* Header */}
      <header className="bg-theme-card border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-theme-secondary hover:text-theme-text transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver al Inicio</span>
            </Link>
            <div className="text-sm text-theme-secondary">
              TechLab • Catálogo de Tecnologías
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-theme-text mb-4">
            Tecnologías Implementadas
          </h1>
          <p className="text-lg text-theme-secondary max-w-3xl mx-auto">
            Explora nuestro catálogo completo de tecnologías de vanguardia
            implementadas en el Tech Lab. Desde IoT y Blockchain hasta IA y
            sistemas 3D interactivos.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-theme-accent">
            <Zap size={20} />
            <span className="font-medium">
              {technologies.length} tecnologías disponibles
            </span>
          </div>
        </div>

        {/* Grid de Tecnologías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technologies.map((tech) => (
            <div
              key={tech.id}
              className="bg-theme-card rounded-xl p-6 border border-theme-border hover:border-theme-accent/50 transition-all duration-300 group"
            >
              {/* Header con Icono */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`text-3xl p-3 rounded-lg bg-gradient-to-r ${tech.gradient} text-white`}
                  >
                    {tech.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-theme-text group-hover:text-theme-accent transition-colors">
                      {tech.name}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <p className="text-theme-secondary text-sm leading-relaxed mb-4 line-clamp-3">
                {tech.description}
              </p>

              {/* Características destacadas */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-theme-text mb-2">
                  Características:
                </h3>
                <div className="space-y-1">
                  {tech.features.items.slice(0, 3).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs text-theme-secondary"
                    >
                      <div className="w-1.5 h-1.5 bg-theme-accent rounded-full"></div>
                      {feature.text}
                    </div>
                  ))}
                  {tech.features.items.length > 3 && (
                    <div className="text-xs text-theme-accent">
                      +{tech.features.items.length - 3} más características
                    </div>
                  )}
                </div>
              </div>

              {/* Proyectos Vinculados */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-theme-text">
                    Proyectos Vinculados:
                  </h3>
                  <div className="text-xs text-theme-accent font-medium">
                    {tech.relatedProjects?.length || 0}
                  </div>
                </div>

                {tech.relatedProjects && tech.relatedProjects.length > 0 ? (
                  <div className="space-y-2">
                    {tech.relatedProjects
                      .slice(0, 2)
                      .map(
                        (project: {
                          id: string;
                          title: string;
                          status: string;
                          progress: number;
                        }) => (
                          <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="block p-2 bg-theme-background rounded-md hover:bg-theme-accent/10 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-theme-text truncate">
                                {project.title}
                              </span>
                              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    project.status === 'completed'
                                      ? 'bg-green-500'
                                      : project.status === 'active'
                                        ? 'bg-blue-500'
                                        : project.status === 'paused'
                                          ? 'bg-yellow-500'
                                          : 'bg-gray-500'
                                  }`}
                                />
                                <span className="text-xs text-theme-secondary">
                                  {project.progress}%
                                </span>
                              </div>
                            </div>
                          </Link>
                        )
                      )}
                    {tech.relatedProjects.length > 2 && (
                      <div className="text-xs text-theme-secondary text-center py-1">
                        +{tech.relatedProjects.length - 2} proyecto
                        {tech.relatedProjects.length > 3 ? 's' : ''} más
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-theme-secondary/70 italic text-center py-2">
                    No hay proyectos vinculados
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                {/* Enlace principal */}
                <Link
                  href={`/technologies/${tech.id}`}
                  className={`flex-1 bg-gradient-to-r ${tech.gradient} text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
                >
                  Ver Detalles
                  <ExternalLink size={14} />
                </Link>

                {/* Enlace directo para tecnologías con sistemas */}
                {tech.hasDirectLinks && tech.directLinks && (
                  <Link
                    href={
                      tech.directLinks.find((link) => link.primary)?.href || '#'
                    }
                    className="px-3 py-2 border border-theme-border text-theme-text rounded-lg hover:bg-theme-card transition-colors text-sm"
                  >
                    Sistema
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Sección de estadísticas */}
        <div className="mt-16 bg-gradient-to-r from-theme-accent/10 via-theme-secondary/5 to-theme-accent/10 rounded-xl p-8 border border-theme-border/50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-theme-text mb-4">
              Ecosistema Tecnológico
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-theme-accent mb-2">
                  {technologies.length}
                </div>
                <div className="text-sm text-theme-secondary">
                  Tecnologías Implementadas
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-theme-accent mb-2">
                  {technologies.reduce(
                    (acc: number, tech: Technology) =>
                      acc + (tech.relatedProjects?.length || 0),
                    0
                  )}
                </div>
                <div className="text-sm text-theme-secondary">
                  Proyectos Vinculados
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-theme-accent mb-2">
                  {technologies.filter((tech) => tech.hasDirectLinks).length}
                </div>
                <div className="text-sm text-theme-secondary">
                  Sistemas Disponibles
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold text-theme-text mb-4">
            ¿Interesado en alguna tecnología específica?
          </h3>
          <p className="text-theme-secondary mb-6 max-w-2xl mx-auto">
            Cada tecnología representa horas de investigación e implementación.
            Explora los detalles técnicos y proyectos de cada una.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="px-6 py-3 bg-theme-accent text-white rounded-lg hover:bg-theme-accent/80 transition-colors font-medium"
            >
              Contactar Equipo
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-theme-border text-theme-text rounded-lg hover:bg-theme-card transition-colors font-medium"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
