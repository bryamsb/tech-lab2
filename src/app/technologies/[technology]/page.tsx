'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useTechnologies } from '@/hooks/useTechnologies';
import { ExternalLink } from 'lucide-react';

export default function TechnologyPage() {
  const params = useParams();
  const technologyId = params.technology as string;
  const { getTechnology, loading } = useTechnologies();

  const technology = getTechnology(technologyId);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  // Si no se encuentra la tecnología, mostrar 404
  if (!technology) {
    notFound();
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-dark-bg text-light-gray font-roboto">
      <Header />

      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${technology.gradient} rounded-full mb-6`}
            >
              <span className="text-3xl font-bold text-white">
                {technology.icon}
              </span>
            </div>
            <h1 className="font-bebas text-5xl md:text-6xl font-bold text-white mb-6">
              {technology.name}
            </h1>
            <p className="text-xl text-light-gray/90 max-w-3xl mx-auto">
              {technology.description}
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* About Section */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-8 border border-white/10">
              <h2 className="font-bebas text-3xl font-bold text-white mb-6">
                {technology.about.title}
              </h2>
              <div className="space-y-4 text-light-gray/90">
                {technology.about.content.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Features Section */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-8 border border-white/10">
              <h2 className="font-bebas text-3xl font-bold text-white mb-6">
                {technology.features.title}
              </h2>
              <ul className="space-y-3 text-light-gray/90">
                {technology.features.items.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className={`text-${feature.color} mr-3`}>•</span>
                    {feature.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Projects Section */}
          <div
            className={`bg-gradient-to-r ${technology.gradient}/10 rounded-xl p-8 border border-white/10 mb-12`}
          >
            {/* Proyectos Vinculados */}
            <h2 className="font-bebas text-3xl font-bold text-white mb-8 text-center">
              Proyectos Vinculados con {technology.name}
            </h2>

            {technology.relatedProjects &&
            technology.relatedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {technology.relatedProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="bg-black/30 rounded-lg p-6 border border-white/10 hover:border-white/30 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white group-hover:text-neon-pink transition-colors">
                        {project.title}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-light-gray/60 group-hover:text-white transition-colors" />
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          project.status === 'completed'
                            ? 'bg-green-500'
                            : project.status === 'active'
                              ? 'bg-blue-500'
                              : project.status === 'paused'
                                ? 'bg-yellow-500'
                                : 'bg-purple-500'
                        }`}
                      ></div>
                      <span className="text-sm text-light-gray/80 capitalize">
                        {project.status}
                      </span>
                      <span className="text-sm text-light-gray/60">
                        {project.progress}% completado
                      </span>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${technology.gradient} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-light-gray/60 mb-4">
                  No hay proyectos vinculados actualmente
                </div>
                <Link
                  href="/projects"
                  className="text-neon-pink hover:text-white transition-colors"
                >
                  Ver todos los proyectos →
                </Link>
              </div>
            )}

            {/* Proyectos del JSON original como ejemplos */}
            {technology.projects && technology.projects.length > 0 && (
              <div className="mt-12">
                <h3 className="font-bebas text-2xl font-bold text-white mb-6 text-center">
                  Casos de Uso Típicos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {technology.projects.map(
                    (
                      project: { title: string; description: string },
                      index: number
                    ) => (
                      <div
                        key={index}
                        className="bg-black/20 rounded-lg p-4 border border-white/5"
                      >
                        <h4 className="font-medium text-white mb-2 text-sm">
                          {project.title}
                        </h4>
                        <p className="text-light-gray/70 text-xs">
                          {project.description}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Direct Links Section (if available) */}
          {technology.hasDirectLinks && technology.directLinks && (
            <div
              className={`bg-gradient-to-r ${technology.gradient}/20 rounded-xl p-8 border border-white/10 mb-12 text-center`}
            >
              <h3 className="font-bebas text-2xl font-bold text-white mb-4">
                Accede al Sistema de {technology.name}
              </h3>
              <p className="text-light-gray/90 mb-6">
                Explora nuestro sistema completo de gestión de equipos y
                recursos
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {technology.directLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className={`inline-block px-8 py-3 rounded-lg font-bold transition-all ${
                      link.primary
                        ? `bg-gradient-to-r ${technology.gradient} text-white hover:scale-105 transition-transform`
                        : `bg-black/30 border border-white/20 text-white hover:bg-white/10 transition-colors`
                    }`}
                  >
                    {link.text}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="text-center">
            <Link
              href="/"
              className={`inline-block bg-${technology.primaryColor} text-white px-8 py-3 rounded-lg font-bold hover:bg-${technology.primaryColor}/80 transition-colors`}
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
