
'use client';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback, useMemo } from 'react';
import ResearcherProfileModal from '@/components/ResearcherProfileModal';

import Link from 'next/link';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  User,
  Mail,
  GraduationCap,
  Target,
  Users,
  Eye,
  MessageCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth as useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseResearchers } from '@/hooks/useSupabaseResearchers';

// Usar la interfaz de Supabase directamente
import type { SupabaseResearcher } from '@/hooks/useSupabaseResearchers';

type Researcher = SupabaseResearcher;
import { useProjects } from '@/contexts/ProjectContext';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import { useRef } from 'react';

export default function ResearchersPage() {
  const { user: sbUser, profile } = useSupabaseAuth();
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);

  const isAuthenticated = !!sbUser;
  const user = { role: profile?.role } as { role?: string };
  const {
    researchers,
    // createResearcher: addResearcher,  // Commented out for build
    // updateResearcher,  // Commented out for build
    deleteResearcher,
    filterResearchers,
    loading: isLoading,
    fetchResearchers,
  } = useSupabaseResearchers({ autoFetch: false });

  // Función de búsqueda simulada
  const searchResearchers = useCallback(
    (query: string) => {
      return filterResearchers({ search: query });
    },
    [filterResearchers]
  );

  // Funciones de filtro auxiliares
  const handleProjectChange = async (projectTitle: string, formType: 'create' | 'edit') => {
  const project = projects.find(p => p.title === projectTitle);
  const positions = (project as any)?.positions || [];
  setAvailablePositions(positions);
  if (formType === 'create') {
    setCreateForm(prev => ({ ...prev, projects: projectTitle, specializations: '' }));
  } else {
    setEditForm(prev => ({ ...prev, projects: projectTitle, specializations: '' }));
  }
};
  const filterByStatus = useCallback(
    (status: string) => {
      return researchers.filter((researcher) => researcher.status === status);
    },
    [researchers]
  );

  const filterByAcademicLevel = useCallback(
    (level: string) => {
      return researchers.filter(
        (researcher) => researcher.academic_level === level
      );
    },
    [researchers]
  );

  // Calcular departamentos únicos
  const departments = useMemo(() => {
    return [
      ...new Set(researchers.map((researcher) => researcher.department)),
    ].filter(Boolean);
  }, [researchers]);

  const getResearcherProjects = useCallback(
    (researcher: Researcher) => {
      return [
        ...(researcher.current_projects || []),
        ...((researcher.past_projects || []).map((project) => ({
          ...project,
          progress: 0,
        })) as Array<{
          id: string;
          title: string;
          role: string;
          status: string;
          progress: number;
        }>),
      ].filter(
        (project, index, array) =>
          array.findIndex((item) => item.id === project.id) === index
      );
    },
    []
  );

  const projectOptions = useMemo(() => {
    const allProjects = researchers.flatMap((researcher) =>
      getResearcherProjects(researcher)
    );

    return allProjects
      .filter(
        (project, index, array) =>
          array.findIndex((item) => item.id === project.id) === index
      )
      .sort((a, b) => a.title.localeCompare(b.title, 'es'));
  }, [researchers, getResearcherProjects]);

  const { projects } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<
    Researcher['status'] | ''
  >('');
  const [selectedProject, setSelectedProject] = useState('');
  const [showWhatsAppInfoModal, setShowWhatsAppInfoModal] = useState(false);
  const [whatsAppTargetName, setWhatsAppTargetName] = useState('');
  // Modal states commented out for build
  // const [showAddModal, setShowAddModal] = useState(false);
  // const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedResearcher, setSelectedResearcher] = useState<Researcher | null>(null);
  const [filteredResearchers, setFilteredResearchers] =
    useState<Researcher[]>(researchers);
  const lastFetchKey = useRef<string | null>(null);
  
  

  useEffect(() => {
    let result = researchers;

    if (searchQuery) {
      result = searchResearchers(searchQuery);
    }

    if (selectedStatus) {
      result = result.filter(
        (researcher) => researcher.status === selectedStatus
      );
    }

    if (selectedProject) {
      result = result.filter((researcher) =>
        getResearcherProjects(researcher).some(
          (project) => project.id === selectedProject
        )
      );
    }

    setFilteredResearchers(result);
  }, [
    searchQuery,
    selectedStatus,
    selectedProject,
    researchers,
    searchResearchers,
    getResearcherProjects,
  ]);

  // Carga inicial controlada para evitar múltiples fetches (StrictMode / nuevas pestañas)
  useEffect(() => {
  const key = 'initial';
  if (lastFetchKey.current === key) return;
  lastFetchKey.current = key;
  fetchResearchers();
}, [fetchResearchers]);

const fetchResearchersRef = useRef(fetchResearchers);
useEffect(() => { fetchResearchersRef.current = fetchResearchers; }, [fetchResearchers]);

useEffect(() => {
  const handler = () => fetchResearchersRef.current();
  window.addEventListener('profile-updated', handler);
  return () => window.removeEventListener('profile-updated', handler);
}, []);



  const [showCreateModal, setShowCreateModal] = useState(false);
const [createForm, setCreateForm] = useState({ username: '', full_name: '', email: '', password: '', phone: '', projects: '', specializations: '' });
const [creating, setCreating] = useState(false);
const [createMessage, setCreateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
const [showEditModal, setShowEditModal] = useState(false);
const [editingResearcher, setEditingResearcher] = useState<Researcher | null>(null);
const [editForm, setEditForm] = useState({ username: '', full_name: '', email: '', phone: '', projects: '', specializations: '' });
const [editing, setEditing] = useState(false);
const [editMessage, setEditMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deletingResearcher, setDeletingResearcher] = useState<Researcher | null>(null);
const [deleting, setDeleting] = useState(false);

useEffect(() => {
  if (showCreateModal || showEditModal || showDeleteModal) {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflowY = 'scroll'; // mantiene el ancho para evitar layout shift
  } else {
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflowY = '';
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }
  return () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflowY = '';
  };
}, [showCreateModal, showEditModal, showDeleteModal]);

  const statuses: Researcher['status'][] = [
    'active',
    'inactive',
    'alumni',
    'visiting',
  ];

  const isAdmin = isAuthenticated && user?.role === 'admin';

  const getStatusColor = (status: Researcher['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'alumni':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'visiting':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    }
  };

  const getAcademicLevelColor = (level: Researcher['academic_level']) => {
    switch (level) {
      case 'undergraduate':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'bachelor':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'master':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'phd':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'postdoc':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'professor':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'student':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'technician':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const statusLabels = {
    active: 'Activo',
    inactive: 'Inactivo',
    alumni: 'Alumni',
    visiting: 'Visitante',
  };

  const academicLevelLabels: Record<string, string> = {
    undergraduate: 'Pregrado',
    bachelor: 'Licenciado',
    master: 'Magíster',
    phd: 'Doctor',
    postdoc: 'Postdoc',
    professor: 'Profesor',
    student: 'Estudiante',
    technician: 'Técnico',
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.title : `Proyecto ${projectId}`;
  };
const handleCreateUser = async (e: React.FormEvent) => {
  e.preventDefault();
  setCreating(true);
  setCreateMessage(null);
  const res = await fetch('/api/create-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
  username: createForm.username,
  full_name: createForm.full_name,
  email: createForm.email,
  password: createForm.password,
  phone: createForm.phone,
}),
  });
  const data = await res.json();
  if (data.error) {
    setCreateMessage({ type: 'error', text: data.error });
  } else {
    setCreateMessage({ type: 'success', text: '¡Usuario creado correctamente!' });
    setTimeout(() => {
      setShowCreateModal(false);
      setCreateForm({ username: '', full_name: '', email: '', password: '', phone: '', projects: '', specializations: '' });

      setCreateMessage(null);
      fetchResearchers();
    }, 1500);
  }
  setCreating(false);
};

  const handleEditUser = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingResearcher) return;
  setEditing(true);
  setEditMessage(null);
  console.log('editando id:', editingResearcher.id);

  const res = await fetch('/api/update-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
  id: editingResearcher.id,
  full_name: editForm.full_name,
  phone: editForm.phone,
}),
  });
  const data = await res.json();
  if (data.error) {
    setEditMessage({ type: 'error', text: data.error });
  } else {
    setEditMessage({ type: 'success', text: '¡Datos actualizados correctamente!' });
    setTimeout(() => {
      setShowEditModal(false);
      setEditingResearcher(null);
      setEditMessage(null);
      fetchResearchers();
    }, 1500);
  }
  setEditing(false);
};

const handleDeleteUser = async () => {
  if (!deletingResearcher) return;
  setDeleting(true);
  const res = await fetch('/api/delete-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: deletingResearcher.id }),
  });
  const data = await res.json();
  setDeleting(false);
  if (!data.error) {
  setFilteredResearchers(prev => prev.filter(r => r.id !== deletingResearcher.id));
  setShowDeleteModal(false);
  setDeletingResearcher(null);
  fetchResearchers();
}
};
  return (
    <div className="min-h-screen bg-theme-background">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-text mb-2">
            {isAdmin
              ? 'Gestión de Investigadores y Trabajadores'
              : 'Equipo del Tech Lab'}
          </h1>
          <p className="text-theme-secondary">
            {isAuthenticated
              ? isAdmin
                ? 'Administra el equipo de investigadores y trabajadores del laboratorio'
                : 'Conoce al equipo de investigación y desarrollo del Tech Lab'
              : 'Descubre el talento humano detrás de la innovación del Tech Lab'}
          </p>

          {/* Mensaje para usuarios no autenticados */}
          {!isAuthenticated && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-sm">
                <strong>Directorio Público:</strong> Explora los perfiles de
                nuestro equipo de investigación.
                <a href="/login" className="ml-1 underline hover:text-blue-300">
                  Inicia sesión
                </a>{' '}
                para acceder a información de contacto completa.
              </p>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="bg-theme-card rounded-lg p-4 sm:p-6 border border-theme-border mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-secondary w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar investigadores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full lg:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as Researcher['status'] | '')
                }
                className="w-full min-w-0 px-3 sm:px-4 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text text-sm sm:text-base"
              >
                <option value="">Todos los estados</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>

              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full min-w-0 px-3 sm:px-4 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text text-sm sm:text-base"
              >
                <option value="">Todos los proyectos</option>
                {projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón Agregar - Solo para administradores */}
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}

                className="flex items-center justify-center gap-2 w-full lg:w-auto bg-gradient-to-r from-neon-pink to-bright-blue text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Nuevo Investigador
              </button>
            )}
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-theme-text">
                {researchers.length}
              </div>
              <div className="text-sm text-theme-secondary">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {filterByStatus('active').length}
              </div>
              <div className="text-sm text-theme-secondary">Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {filterByAcademicLevel('phd').length +
                  filterByAcademicLevel('professor').length}
              </div>
              <div className="text-sm text-theme-secondary">PhD+</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {departments.length}
              </div>
              <div className="text-sm text-theme-secondary">Departamentos</div>
            </div>
          </div>
        </div>

        {/* Grid de Investigadores */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResearchers.map((researcher) => {
            const displayedProjects = getResearcherProjects(researcher);
            const phoneDigits = (researcher.phone || '').replace(/\D/g, '');
            const whatsappMessage = encodeURIComponent(
              `Hola ${researcher.name}, te contacto desde la plataforma Tech Lab.`
            );
            const whatsappLink = phoneDigits
              ? `https://wa.me/${phoneDigits}?text=${whatsappMessage}`
              : '';

            return (
              <div
                key={researcher.id}
                className="group bg-theme-card border border-theme-border/40 rounded-2xl p-4 sm:p-5 hover:border-theme-accent/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 h-full flex flex-col"
              >
                <div className="h-1.5 w-14 rounded-full bg-theme-accent/40 mb-4" />

                {/* Cabecera del Perfil */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="relative">
                    {researcher.avatar_url ? (
  <img
    src={researcher.avatar_url}
    alt={researcher.name}
    width={60}
    height={60}
    className="rounded-full object-cover w-[60px] h-[60px]"
    onError={(e) => {
      (e.target as HTMLImageElement).style.display = 'none';
    }}
  />
) : (
                      <div className="w-12 h-12 sm:w-[60px] sm:h-[60px] rounded-full bg-theme-accent/10 border-2 border-theme-border group-hover:border-theme-accent/50 flex items-center justify-center transition-colors">
                        <User className="w-6 h-6 sm:w-7 sm:h-7 text-theme-accent" />
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(researcher.status)}`}
                    >
                      {statusLabels[researcher.status]}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/researchers/${researcher.id}`}
                      className="block text-lg sm:text-[22px] leading-tight font-bold text-theme-text hover:text-theme-accent truncate transition-colors"
                    >
                      {researcher.name}
                    </Link>
                    <p className="text-theme-secondary text-sm font-semibold mb-0.5">
                      {researcher.position}
                    </p>
                    <p className="text-theme-secondary text-xs truncate">
                      {researcher.department}
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border mt-2 ${getAcademicLevelColor(researcher.academic_level)}`}
                    >
                      <GraduationCap className="w-3 h-3 mr-1" />
                      {academicLevelLabels[researcher.academic_level]}
                    </span>
                  </div>
                </div>

                {/* Estadísticas Rápidas */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center bg-theme-background/30 border border-theme-border/50 rounded-xl p-2.5">
                  <div className="rounded-lg py-1.5 bg-theme-card border border-theme-border/40">
                    <div className="text-lg font-bold text-theme-text leading-tight">
                      {displayedProjects.length}
                    </div>
                    <div className="text-xs text-theme-secondary">Proyectos</div>
                  </div>
                  <div className="rounded-lg py-1.5 bg-theme-card border border-theme-border/40">
                    <div className="text-lg font-bold text-theme-text leading-tight">
                      {researcher.publications_count}
                    </div>
                    <div className="text-xs text-theme-secondary">
                      Publicaciones
                    </div>
                  </div>
                  <div className="rounded-lg py-1.5 bg-theme-card border border-theme-border/40">
                    <div className="text-lg font-bold text-theme-text leading-tight">
                      {researcher.years_experience}
                    </div>
                    <div className="text-xs text-theme-secondary">Años Exp.</div>
                  </div>
                </div>

                {/* Proyectos Actuales */}
                <div className="mb-4 min-h-[96px] bg-theme-background/20 border border-theme-border/50 rounded-xl p-3.5">
                  <p className="text-xs font-semibold text-theme-secondary mb-2">
                    Proyectos:
                  </p>
                  {displayedProjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {displayedProjects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-theme-border/60 bg-theme-card hover:border-theme-accent/50 hover:text-theme-accent transition-colors max-w-full"
                          title={project.title}
                        >
                          <Target className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span className="text-xs text-theme-text truncate">
                            {project.title}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-theme-secondary/70 italic">
                      Sin proyectos actuales
                    </p>
                  )}
                </div>

                {/* Botones de Acción */}
                <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3.5 border-t border-theme-border/60">
                  <div className="flex flex-wrap gap-2">
                    {/* Botón Ver Página Completa - Todos los usuarios */}
                    <Link
                      href={`/researchers/${researcher.id}`}
                      className="p-2.5 text-theme-secondary hover:text-theme-text hover:bg-theme-accent/10 border border-theme-border/60 rounded-lg transition-colors"
                      title="Ver página completa del perfil"
                    >
                      <User className="w-4 h-4" />
                    </Link>

                    {/* Botón Ver Modal - Todos los usuarios */}
                    <button
                      onClick={() => {
  setSelectedResearcher(researcher);
  setShowViewModal(true);
}}
                      className="p-2.5 text-theme-secondary hover:text-theme-text hover:bg-theme-accent/10 border border-theme-border/60 rounded-lg transition-colors"
                      title="Vista rápida del perfil"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Enlaces externos - Solo usuarios autenticados */}
                    {isAuthenticated && researcher.email && (
                      <a
                        href={`mailto:${researcher.email}`}
                        className="p-2.5 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 border border-theme-border/60 rounded-lg transition-colors"
                        title="Enviar email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}

                    {phoneDigits ? (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 text-green-500 hover:text-green-600 hover:bg-green-500/10 border border-theme-border/60 rounded-lg transition-colors"
                        title="Contactar por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setWhatsAppTargetName(researcher.name);
                          setShowWhatsAppInfoModal(true);
                        }}
                        className="p-2.5 text-green-500 hover:text-green-600 hover:bg-green-500/10 border border-theme-border/60 rounded-lg transition-colors"
                        title="Sin número de WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}

                    {/* LinkedIn link temporarily disabled for build 
                  {isAuthenticated && researcher.linkedIn && (
                    <a
                      href={researcher.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Ver LinkedIn"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  */}
                  </div>

                  {/* Botones Admin */}
                  {isAdmin && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
  setEditingResearcher(researcher);
setEditForm({
  username: researcher.name,
  full_name: researcher.name,
  email: researcher.email,
  phone: researcher.phone || '',
  projects: '',
  specializations: '',
});
  setShowEditModal(true);
}}
                        className="p-2.5 text-theme-secondary hover:text-theme-text hover:bg-theme-accent/10 border border-theme-border/60 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
  setDeletingResearcher(researcher);
  setShowDeleteModal(true);
}}
                        className="p-2.5 text-red-500 hover:text-red-600 hover:bg-red-500/10 border border-theme-border/60 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredResearchers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 text-theme-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-theme-text mb-2">
                No se encontraron investigadores
              </h3>
              <p className="text-theme-secondary">
                {searchQuery ||
                  selectedStatus ||
                  selectedProject
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Agrega el primer investigador al directorio'}
              </p>
            </div>
          )}
        </div>

        {/* Loading State (inline, no overlay) */}
        {isLoading && (
          <div className="text-center text-theme-secondary py-6">
            Cargando investigadores...
          </div>
        )}

        {/* Modales */}
        <Modal
          isOpen={showWhatsAppInfoModal}
          onClose={() => setShowWhatsAppInfoModal(false)}
          title="Contacto no disponible"
          size="sm"
          className="bg-theme-card border border-theme-border text-theme-text"
          footer={
            <div className="flex justify-end">
              <button
                onClick={() => setShowWhatsAppInfoModal(false)}
                className="px-4 py-2 rounded-lg border border-theme-border text-theme-text hover:bg-theme-accent/10 transition-colors"
              >
                Entendido
              </button>
            </div>
          }
        >
          <p className="text-theme-secondary">
            {whatsAppTargetName
              ? `${whatsAppTargetName} no tiene número de WhatsApp registrado por el momento.`
              : 'Este investigador no tiene número de WhatsApp registrado por el momento.'}
          </p>
        </Modal>

        {/* Temporarily disabled for build 
        <AddResearcherModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={(researcherData) => {
            addResearcher(researcherData);
            setShowAddModal(false);
          }}
        />
        */}

        {/* Temporarily disabled for build 
        <EditResearcherModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedResearcher(null);
          }}
          onEdit={(researcher) => {
            updateResearcher(researcher.id, researcher);
            setShowEditModal(false);
            setSelectedResearcher(null);
          }}
          researcher={selectedResearcher}
        />

        <ViewResearcherModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedResearcher(null);
          }}
          researcher={selectedResearcher}
        />
        */}
      {showCreateModal && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center"
    style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
    onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
    <div className="border border-theme-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto modal-no-scrollbar"
      style={{ backgroundColor: 'var(--modal-bg)' }}
      onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-theme-border">
        <h2 className="text-xl font-semibold text-theme-text">Crear Nuevo Usuario</h2>
        <button onClick={() => setShowCreateModal(false)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-theme-secondary hover:bg-theme-accent/10 hover:text-theme-text transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form onSubmit={handleCreateUser} className="px-6 py-5 space-y-4">
        {[
          { label: 'Usuario *', name: 'username', placeholder: 'ej. juan.perez', type: 'text' },
          { label: 'Nombre Completo *', name: 'full_name', placeholder: 'Juan Pérez García', type: 'text' },
          { label: 'Email *', name: 'email', placeholder: 'juan@example.com', type: 'email' },
          { label: 'Contraseña *', name: 'password', placeholder: 'Mínimo 6 caracteres', type: 'password' },
          { label: 'Teléfono', name: 'phone', placeholder: '+51 999 999 999', type: 'text' },
        ].map(({ label, name, placeholder, type }) => (
          <div key={name} className="space-y-1.5">
            <label className="block text-xs font-semibold text-theme-secondary uppercase tracking-wide">{label}</label>
            <input type={type} value={(createForm as any)[name]}
              onChange={(e) => setCreateForm(prev => ({ ...prev, [name]: e.target.value }))}
              placeholder={placeholder} required={label.includes('*')}
              className="w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg" />
          </div>
        ))}
        {/*<div className="space-y-1.5">
  <label className="block text-xs font-semibold text-theme-secondary uppercase tracking-wide">Proyecto</label>
  <select value={createForm.projects}
    onChange={(e) => handleProjectChange(e.target.value, 'create')}
    className="w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg">
    <option value="">Sin proyecto</option>
    {projects.map((p) => (
      <option key={p.id} value={p.title}>{p.title}</option>
    ))}
 </select>
</div>

<div className="space-y-1.5">
  <label className="block text-xs font-semibold text-theme-secondary uppercase tracking-wide">Especialización</label>
  <select value={createForm.specializations}
    onChange={(e) => setCreateForm(prev => ({ ...prev, specializations: e.target.value }))}
    disabled={!createForm.projects}
    className="w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg disabled:opacity-50 disabled:cursor-not-allowed">
    <option value="">Sin especialización</option>
    {availablePositions.map((pos) => (
      <option key={pos} value={pos}>{pos}</option>
    ))}
  </select>
</div>

 */}

        {createMessage && (
          <div className={`rounded-lg px-4 py-3 text-sm font-medium border ${
            createMessage.type === 'success'
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>{createMessage.text}</div>
        )}
        <div className="flex gap-3 pt-2 pb-1">
          <button type="button" onClick={() => setShowCreateModal(false)}
            className="flex-1 py-2.5 rounded-xl border border-red-500/50 text-sm font-medium transition-colors text-red-400 hover:bg-red-500/10 cursor-pointer"

            >
            Cancelar
          </button>
          <button type="submit" disabled={creating}
            className="rounded-md bg-gradient-to-r from-bright-blue to-neon-pink px-8 py-3 text-lg font-bold text-white shadow-lg shadow-bright-blue/40 transition-all hover:scale-105 hover:shadow-bright-blue disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
            {creating ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creando...</>
            ) : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{showEditModal && editingResearcher && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center"
    style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
    onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
    <div className="border border-theme-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto modal-no-scrollbar"
      style={{ backgroundColor: 'var(--modal-bg)' }}
      onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-theme-border">
        <h2 className="text-xl font-semibold text-theme-text">Editar Usuario</h2>
        <button onClick={() => setShowEditModal(false)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-theme-secondary hover:bg-theme-accent/10 hover:text-theme-text transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form onSubmit={handleEditUser} className="px-6 py-5 space-y-4">
        {[
          { label: 'Nombre Completo', name: 'full_name', placeholder: 'Juan Pérez García', type: 'text' },
          { label: 'Email', name: 'email', placeholder: 'juan@example.com', type: 'email' },
          { label: 'Teléfono', name: 'phone', placeholder: '+51 999 999 999', type: 'text' },
        ].map(({ label, name, placeholder, type }) => (
          <div key={name} className="space-y-1.5">
            <label className="block text-xs font-semibold text-theme-secondary uppercase tracking-wide">{label}</label>
            <input type={type} value={(editForm as any)[name]}
              onChange={(e) => setEditForm(prev => ({ ...prev, [name]: e.target.value }))}
              placeholder={placeholder}
              className="w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg" />
          </div>
        ))}
        {/*
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-theme-secondary uppercase tracking-wide">Proyecto</label>
          <select value={editForm.projects}
            onChange={(e) => handleProjectChange(e.target.value, 'edit')}

            className="w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg">
            <option value="">Sin proyecto</option>
            {projectOptions.map((p) => (
              <option key={p.id} value={p.title}>{p.title}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
  <label className="block text-xs font-semibold text-theme-secondary uppercase tracking-wide">Especialización</label>
  <select value={editForm.specializations}
    onChange={(e) => setEditForm(prev => ({ ...prev, specializations: e.target.value }))}
    disabled={!editForm.projects}
    className="w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg disabled:opacity-50 disabled:cursor-not-allowed">
    <option value="">Sin especialización</option>
    {availablePositions.map((pos) => (
      <option key={pos} value={pos}>{pos}</option>
    ))}
  </select>
</div>
*/}
        {editMessage && (
          <div className={`rounded-lg px-4 py-3 text-sm font-medium border ${
            editMessage.type === 'success'
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>{editMessage.text}</div>
        )}
        <div className="flex gap-3 pt-2 pb-1">
          <button type="button" onClick={() => setShowEditModal(false)}
            className="flex-1 py-2.5 rounded-xl border border-theme-border text-sm font-medium transition-colors cursor-pointer"
            style={{ color: 'var(--theme-secondary)' }}>
            Cancelar
          </button>
          <button type="submit" disabled={editing}
            className="rounded-md bg-gradient-to-r from-bright-blue to-neon-pink px-8 py-3 text-lg font-bold text-white shadow-lg shadow-bright-blue/40 transition-all hover:scale-105 hover:shadow-bright-blue disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
            {editing ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Guardando...</>
            ) : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{showDeleteModal && deletingResearcher && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center"
    style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
    onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
    <div className="border border-theme-border rounded-2xl shadow-2xl w-full max-w-md mx-4"
      style={{ backgroundColor: 'var(--modal-bg)' }}
      onClick={(e) => e.stopPropagation()}>
      <div className="px-6 pt-6 pb-4 border-b border-theme-border">
        <h2 className="text-xl font-semibold text-theme-text">Confirmar eliminación</h2>
      </div>
      <div className="px-6 py-5">
        <p className="text-theme-secondary text-sm">
          ¿Estás seguro de eliminar al usuario{' '}
          <span className="text-theme-text font-semibold">{deletingResearcher.name}</span>?
          Esta acción no se puede deshacer.
        </p>
      </div>
      <div className="flex gap-3 px-6 pb-6">
        <button onClick={() => setShowDeleteModal(false)}
          className="flex-1 py-2.5 rounded-xl border border-red-500/50 text-sm font-medium transition-colors text-red-400 hover:bg-red-500/10 cursor-pointer">
          No
        </button>
        <button onClick={handleDeleteUser} disabled={deleting}
          className="flex-1 rounded-xl bg-red-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">
          {deleting ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Eliminando...</>
          ) : 'Sí, eliminar'}
        </button>
      </div>
    </div>
  </div>
)}
      </main>

          <ResearcherProfileModal
  isOpen={showViewModal}
  onClose={() => { setShowViewModal(false); setSelectedResearcher(null); }}
  researcher={selectedResearcher}
/>

    </div>
  );
}
