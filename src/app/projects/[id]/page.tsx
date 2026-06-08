'use client';

import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Users,
  Target,
  TrendingUp,
  ExternalLink,
  GitBranch,
  FileText,
  Monitor,
} from 'lucide-react';
import { useProjects } from '@/contexts/ProjectContext';
import RelatedTechnologies from '@/components/RelatedTechnologies';
import SmartParkingViewer from '@/components/SmartParkingViewer';
import PeopleCounterViewer from '@/components/PeopleCounterViewer';
import LoRaSensorViewer from '@/components/LoRaSensorViewer';
import BlockchainViewer from '@/components/BlockchainViewer';
import TechLabPlatformViewer from '@/components/TechLabPlatformViewer';
import AirQualityViewer from '@/components/AirQualityViewer';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getProject, isLoading } = useProjects();

  const project = getProject(projectId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <p className="text-theme-secondary">Cargando proyecto...</p>
      </div>
    );
  }

  if (!project) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 bg-green-500/20';
      case 'active':
        return 'text-blue-500 bg-blue-500/20';
      case 'paused':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'planning':
        return 'text-purple-500 bg-purple-500/20';
      default:
        return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-500 bg-red-500/20';
      case 'high':
        return 'text-orange-500 bg-orange-500/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'low':
        return 'text-green-500 bg-green-500/20';
      default:
        return 'text-gray-500 bg-gray-500/20';
    }
  };

  const isBlockchainProject =
    project.id === '5a72d6f1-c3b1-5f0b-8b13-0ffec9aa3c1b' ||
    project.title.toLowerCase().includes('blockchain') ||
    project.category.toLowerCase().includes('blockchain') ||
    project.technologies.some((tech) =>
      ['blockchain', 'ethereum', 'poa', 'clique'].some((keyword) =>
        tech.toLowerCase().includes(keyword)
      )
    );

  const isTechLabPlatformProject =
    project.id === '1a2b9f6b-3c2a-5db2-9b0d-cc2f5f3d72f3' ||
    project.title.toLowerCase().includes('plataforma techlab') ||
    project.category.toLowerCase().includes('plataforma') ||
    project.technologies.some((tech) =>
      ['web platform', 'auth/roles', 'gestión de proyectos', 'techlab-platform'].some((keyword) =>
        tech.toLowerCase().includes(keyword)
      )
    );

  const isIndoorAirQualityProject =
    project.id === '65b97c1d-0a6a-5fdd-9a9b-2c3b1c63cf5a' ||
    project.title.toLowerCase().includes('calidad de aire') ||
    project.category.toLowerCase().includes('salud ambiental') ||
    project.technologies.some((tech) =>
      ['air quality', 'calidad de aire', 'monitoreo ambiental', 'indoor-air-quality-iot'].some((keyword) =>
        tech.toLowerCase().includes(keyword)
      )
    );

  return (
    <div className="min-h-screen bg-theme-background">
      {/* Header */}
      <header className="bg-theme-card border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/projects"
              className="flex items-center gap-2 text-theme-secondary hover:text-theme-text transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver a Proyectos</span>
            </Link>
            <div className="text-sm text-theme-secondary">
              TechLab • {project.category}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-theme-text mb-4">
                {project.title}
              </h1>
              <p className="text-xl text-theme-secondary mb-6 leading-relaxed">
                {project.description}
              </p>

              {/* Status y Priority */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}
                >
                  {project.status.charAt(0).toUpperCase() +
                    project.status.slice(1)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}
                >
                  Prioridad{' '}
                  {project.priority.charAt(0).toUpperCase() +
                    project.priority.slice(1)}
                </span>
                <div className="flex items-center gap-2 text-theme-secondary">
                  <TrendingUp size={16} />
                  <span className="text-sm">
                    {project.progress}% completado
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Ring */}
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24">
                <svg
                  className="w-24 h-24 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-theme-border"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - project.progress / 100)}`}
                    className="text-theme-accent transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-theme-text">
                    {project.progress}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contenido Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Objetivos */}
            <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
              <h2 className="text-xl font-bold text-theme-text mb-4 flex items-center gap-2">
                <Target className="text-theme-accent" size={24} />
                Objetivos del Proyecto
              </h2>
              <ul className="space-y-3">
                {project.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-theme-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-theme-accent"></div>
                    </div>
                    <span className="text-theme-secondary">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Simulación 3D - Solo para Smart Parking System */}
            {(project.id === '00000000-0000-0000-0000-000000000001' || project.title.toLowerCase().includes('smart parking')) && (
              <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
                <h2 className="text-xl font-bold text-theme-text mb-4 flex items-center gap-2">
                  <Monitor className="text-theme-accent" size={24} />
                  Simulación 3D en Tiempo Real
                </h2>
                <p className="text-theme-secondary mb-6">
                  Visualización interactiva del sistema de estacionamiento
                  inteligente que muestra la ocupación de espacios en tiempo
                  real utilizando tecnología IoT y sensores.
                </p>
                <div className="bg-theme-background rounded-lg p-4 border border-theme-border">
                  <SmartParkingViewer />
                </div>
                <p className="mt-4">
                  <strong>Características de la simulación:</strong>
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-theme-secondary">
                  <li>Espacios de estacionamiento con identidades únicas</li>
                  <li>Estado de ocupación en tiempo real</li>
                  <li>Visualización 3D interactiva</li>
                  <li>Colores diferenciados por disponibilidad</li>
                </ul>
              </div>
            )}

            {/* Visualización - Sistema de Conteo de Personas */}
            {(
              project.id === '4104a0b2-24ea-45b6-8b56-b0ef7ead7539' ||
              project.id === '00000000-0000-0000-0000-000000000007' ||
              project.title.toLowerCase().includes('conteo de personas') ||
              project.title.toLowerCase().includes('cuenta personas')
            ) && (
                <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
                  <h2 className="text-xl font-bold text-theme-text mb-4 flex items-center gap-2">
                    <Monitor className="text-theme-accent" size={24} />
                    Monitoreo de Aforo en Tiempo Real
                  </h2>
                  <p className="text-theme-secondary mb-6">
                    Sistema de conteo de personas en tiempo real que muestra el
                    aforo actual del área monitoreada, alertas de capacidad y
                    tendencias de ocupación.
                  </p>
                  <div className="bg-theme-background rounded-lg p-4 border border-theme-border min-h-[600px]">
                    <PeopleCounterViewer camId="cuenta_personas:A1" refreshMs={10000} />
                  </div>
                  <p className="mt-4">
                    <strong>Características del sistema:</strong>
                  </p>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-theme-secondary">
                    <li>Conteo de personas en tiempo real con visión artificial</li>
                    <li>Indicador visual de porcentaje de ocupación</li>
                    <li>Alertas automáticas de aforo máximo</li>
                    <li>Tendencias de ocupación (subiendo/bajando/estable)</li>
                    <li>Actualización automática cada 10 segundos</li>
                  </ul>
                </div>
              )}

            {/* Visualización - Red de Sensores LoRa */}
            {(project.id === '00000000-0000-0000-0000-000000000002' || project.title.toLowerCase().includes('lora')) && (
              <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
                <h2 className="text-xl font-bold text-theme-text mb-4 flex items-center gap-2">
                  <Monitor className="text-theme-accent" size={24} />
                  Monitoreo de Calidad de Aire - Red LoRa
                </h2>
                <p className="text-theme-secondary mb-6">
                  Sistema de monitoreo de calidad de aire usando tecnología LoRa
                  con sensores distribuidos que miden temperatura, humedad y CO₂
                  en tiempo real.
                </p>
                <div className="bg-theme-background rounded-lg p-4 border border-theme-border">
                  <LoRaSensorViewer refreshMs={10000} />
                </div>
                <p className="mt-4">
                  <strong>Características del sistema:</strong>
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-theme-secondary">
                  <li>Múltiples sensores LoRa distribuidos en la red</li>
                  <li>Medición de temperatura, humedad y CO₂</li>
                  <li>Gráficas de evolución temporal (últimas 24 horas)</li>
                  <li>Alertas automáticas de valores fuera de rango</li>
                  <li>Actualización automática cada 10 segundos</li>
                  <li>Comunicación de largo alcance y bajo consumo energético</li>
                </ul>
              </div>
            )}

            {/* Simulación - Red Blockchain */}
            {isBlockchainProject && (
              <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
                <h2 className="text-xl font-bold text-theme-text mb-4 flex items-center gap-2">
                  <Monitor className="text-theme-accent" size={24} />
                  Simulación de Red Blockchain
                </h2>
                <p className="text-theme-secondary mb-6">
                  Entorno de simulación para visualizar transacciones pendientes,
                  minería de bloques y encadenamiento mediante hash en una red
                  privada tipo Ethereum PoA/Clique.
                </p>
                <div className="bg-theme-background rounded-lg p-4 border border-theme-border">
                  <BlockchainViewer />
                </div>
                <p className="mt-4">
                  <strong>Características de la simulación:</strong>
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-theme-secondary">
                  <li>Generación de transacciones entre nodos validadores</li>
                  <li>Mempool con transacciones pendientes</li>
                  <li>Minería simulada con cálculo de nonce y hash</li>
                  <li>Visualización de la cadena y hash previo por bloque</li>
                </ul>
              </div>
            )}

            {/* Simulación - Plataforma TechLab */}
            {isTechLabPlatformProject && (
              <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
                <h2 className="text-xl font-bold text-theme-text mb-4 flex items-center gap-2">
                  <Monitor className="text-theme-accent" size={24} />
                  Demo de Plataforma TechLab
                </h2>
                <p className="text-theme-secondary mb-6">
                  Simulación funcional de la plataforma web para centralizar
                  proyectos, investigadores y préstamos en un mismo panel de
                  control.
                </p>
                <div className="bg-theme-background rounded-lg p-4 border border-theme-border">
                  <TechLabPlatformViewer />
                </div>
                <p className="mt-4">
                  <strong>Incluye en la demo:</strong>
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-theme-secondary">
                  <li>KPIs de operación en tiempo real (simulados)</li>
                  <li>Acciones rápidas para simular eventos del sistema</li>
                  <li>Feed de actividad reciente de la plataforma</li>
                  <li>Estado operativo general del portal</li>
                </ul>
              </div>
            )}

            {/* Simulación 3D - Módulo de Calidad de Aire Interior */}
            {isIndoorAirQualityProject && (
              <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
                <h2 className="text-xl font-bold text-theme-text mb-4 flex items-center gap-2">
                  <Monitor className="text-theme-accent" size={24} />
                  Simulación 3D de Calidad de Aire Interior
                </h2>
                <p className="text-theme-secondary mb-6">
                  Monitoreo visual del ambiente interior con sensores de CO₂,
                  PM2.5, temperatura, humedad y compuestos orgánicos volátiles
                  (VOC), con actualización automática del estado de calidad.
                </p>
                <div className="bg-theme-background rounded-lg p-4 border border-theme-border">
                  <AirQualityViewer refreshMs={3000} />
                </div>
                <p className="mt-4">
                  <strong>Incluye en la simulación:</strong>
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-theme-secondary">
                  <li>Escena 3D de sala interior con nodos de sensado</li>
                  <li>Partículas ambientales según nivel PM2.5</li>
                  <li>Indicador de calidad del aire en tiempo real (0-100)</li>
                  <li>Métricas en vivo de CO₂, temperatura, humedad y VOC</li>
                </ul>
              </div>
            )}

            {/* Tecnologías Vinculadas */}
            <RelatedTechnologies projectId={projectId} />

            {/* Desafíos */}
            {project.challenges && project.challenges.length > 0 && (
              <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
                <h2 className="text-xl font-bold text-theme-text mb-4">
                  Desafíos y Consideraciones
                </h2>
                <ul className="space-y-3">
                  {project.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      </div>
                      <span className="text-theme-secondary">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del Proyecto */}
            <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
              <h3 className="text-lg font-bold text-theme-text mb-4">
                Información del Proyecto
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar
                    className="text-theme-accent flex-shrink-0"
                    size={18}
                  />
                  <div>
                    <div className="text-sm text-theme-secondary">Inicio</div>
                    <div className="text-theme-text font-medium">
                      {new Date(project.startDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                {project.endDate && (
                  <div className="flex items-center gap-3">
                    <Calendar
                      className="text-theme-accent flex-shrink-0"
                      size={18}
                    />
                    <div>
                      <div className="text-sm text-theme-secondary">
                        Finalización
                      </div>
                      <div className="text-theme-text font-medium">
                        {new Date(project.endDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Users
                    className="text-theme-accent flex-shrink-0"
                    size={18}
                  />
                  <div>
                    <div className="text-sm text-theme-secondary">
                      Líder del Equipo
                    </div>
                    <div className="text-theme-text font-medium">
                      {project.teamLead}
                    </div>
                  </div>
                </div>

                {project.budget && (
                  <div className="flex items-center gap-3">
                    <Target
                      className="text-theme-accent flex-shrink-0"
                      size={18}
                    />
                    <div>
                      <div className="text-sm text-theme-secondary">
                        Presupuesto
                      </div>
                      <div className="text-theme-text font-medium">
                        ${project.budget.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Equipo */}
            <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
              <h3 className="text-lg font-bold text-theme-text mb-4 flex items-center gap-2">
                <Users className="text-theme-accent" size={20} />
                Equipo de Trabajo
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-theme-accent/10 rounded-lg">
                  <div className="font-medium text-theme-text">
                    {project.teamLead}
                  </div>
                  <div className="text-sm text-theme-secondary">
                    Líder del Proyecto
                  </div>
                </div>
                {project.teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="p-3 bg-theme-background rounded-lg"
                  >
                    <div className="font-medium text-theme-text">{member}</div>
                    <div className="text-sm text-theme-secondary">
                      Miembro del Equipo
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tecnologías Utilizadas */}
            <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
              <h3 className="text-lg font-bold text-theme-text mb-4">
                Tecnologías Utilizadas
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-theme-accent/20 text-theme-accent rounded-full text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Enlaces */}
            <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
              <h3 className="text-lg font-bold text-theme-text mb-4">
                Enlaces del Proyecto
              </h3>
              <div className="space-y-3">
                {project.demoUrl && (
                  <Link
                    href={project.demoUrl}
                    className="flex items-center gap-2 p-3 bg-theme-background rounded-lg hover:bg-theme-accent/10 transition-colors group"
                  >
                    <ExternalLink
                      className="text-theme-accent group-hover:text-theme-text"
                      size={18}
                    />
                    <span className="text-theme-text group-hover:text-theme-accent">
                      Ver Demo
                    </span>
                  </Link>
                )}

                {project.repositoryUrl && (
                  <Link
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-theme-background rounded-lg hover:bg-theme-accent/10 transition-colors group"
                  >
                    <GitBranch
                      className="text-theme-accent group-hover:text-theme-text"
                      size={18}
                    />
                    <span className="text-theme-text group-hover:text-theme-accent">
                      Repositorio
                    </span>
                  </Link>
                )}

                {project.documentation && (
                  <div className="flex items-start gap-2 p-3 bg-theme-background rounded-lg">
                    <FileText
                      className="text-theme-accent flex-shrink-0 mt-0.5"
                      size={18}
                    />
                    <div>
                      <div className="text-theme-text font-medium">
                        Documentación
                      </div>
                      <div className="text-sm text-theme-secondary">
                        {project.documentation}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
