'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, Calendar, Award, BookOpen,
  ExternalLink, User, Share2, Download,
  GraduationCap, Trophy, Target, Users, Briefcase,
  Link as LinkIcon, MapPin, Clock, Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useSupabaseResearchers, SupabaseResearcher } from '@/hooks/useSupabaseResearchers';
import Header from '@/components/Header';

export default function ResearcherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const researcherId = params.id as string;
  const { user: sbUser, profile } = useAuth();


  const { researchers, loading, fetchResearchers } = useSupabaseResearchers({ autoFetch: true });
  const [researcher, setResearcher] = useState<SupabaseResearcher | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'publications' | 'achievements'>('profile');

  // Modal publicación
  const [showPubModal, setShowPubModal] = useState(false);
  const [pubForm, setPubForm] = useState({ title: '', description: '', image: '' });
  const [pubSaving, setPubSaving] = useState(false);
  const [pubMessage, setPubMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal logro
  const [showAchModal, setShowAchModal] = useState(false);
  const [achForm, setAchForm] = useState({ title: '', description: '' });
  const [achSaving, setAchSaving] = useState(false);
  const [achMessage, setAchMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Bloquear scroll del body al abrir modales
  useEffect(() => {
    if (showPubModal || showAchModal) {
      document.documentElement.classList.add('modal-open');
    } else {
      document.documentElement.classList.remove('modal-open');
    }
    return () => { document.documentElement.classList.remove('modal-open'); };
  }, [showPubModal, showAchModal]);

  const handleAddPublication = async (e: React.FormEvent) => {
    e.preventDefault();
    setPubSaving(true);
    setPubMessage(null);
    // TODO: conectar con API/Supabase para guardar publicación
    await new Promise(r => setTimeout(r, 800)); // simulación
    setPubMessage({ type: 'success', text: '¡Publicación agregada correctamente!' });
    setTimeout(() => {
      setShowPubModal(false);
      setPubForm({ title: '', description: '', url: '', image: '' });
      setPubMessage(null);
    }, 1500);
    setPubSaving(false);
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAchSaving(true);
    setAchMessage(null);
    // TODO: conectar con API/Supabase para guardar logro
    await new Promise(r => setTimeout(r, 800)); // simulación
    setAchMessage({ type: 'success', text: '¡Logro agregado correctamente!' });
    setTimeout(() => {
      setShowAchModal(false);
      setAchForm({ title: '', description: '' });
      setAchMessage(null);
    }, 1500);
    setAchSaving(false);
  };

  useEffect(() => {
    if (researchers.length > 0 && researcherId) {
      const found = researchers.find((r) => r.id === researcherId);
      setResearcher(found || null);
    }
  }, [researchers, researcherId]);

  useEffect(() => {
    const handler = () => fetchResearchers();
    window.addEventListener('profile-updated', handler);
    return () => window.removeEventListener('profile-updated', handler);
  }, [fetchResearchers]);

  const statusLabels: Record<string, string> = {
    active: 'Activo', inactive: 'Inactivo', alumni: 'Alumni', visiting: 'Visitante',
  };

  const academicLevelLabels: Record<string, string> = {
    undergraduate: 'Pregrado', bachelor: 'Licenciado', master: 'Magíster',
    phd: 'Doctor', postdoc: 'Postdoc', professor: 'Profesor',
    student: 'Estudiante', technician: 'Técnico',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'inactive': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'alumni': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'visiting': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'undergraduate': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'bachelor': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'master': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'phd': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'postdoc': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'professor': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'student': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'technician': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-theme-text">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!researcher) {
    return (
      <div className="min-h-screen bg-theme-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <User className="w-16 h-16 text-theme-secondary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-theme-text mb-2">Investigador no encontrado</h1>
            <p className="text-theme-secondary mb-6">No se pudo encontrar el perfil solicitado.</p>
            <button onClick={() => router.push('/researchers')}
              className="flex items-center gap-2 bg-gradient-to-r from-neon-pink to-bright-blue text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity mx-auto">
              <ArrowLeft className="w-4 h-4" />Volver al Directorio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allProjects = [...(researcher.current_projects || []), ...(researcher.past_projects || [])];

  return (
    <div className="min-h-screen bg-theme-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Volver */}
        <button onClick={() => router.push('/researchers')}
          className="flex items-center gap-2 text-theme-secondary hover:text-theme-text transition-colors mb-6 cursor-pointer">
          <ArrowLeft className="w-4 h-4" />Volver al Directorio
        </button>

        {/* Layout principal: sidebar izquierda + contenido derecha */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── SIDEBAR IZQUIERDA ── */}
          <div className="lg:w-72 flex-shrink-0 space-y-4">

            {/* Foto + nombre + badges */}
            <div className="bg-theme-card border border-theme-border rounded-2xl p-6 text-center">
              <div className="relative inline-block mb-4">
                {researcher.avatar_url ? (
                  <img src={researcher.avatar_url} alt={researcher.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-theme-border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-theme-accent/10 border-2 border-theme-border flex items-center justify-center mx-auto">
                    <User className="w-10 h-10 text-theme-accent" />
                  </div>
                )}
                <span className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(researcher.status)}`}>
                  {statusLabels[researcher.status] || researcher.status}
                </span>
              </div>

              <h1 className="text-xl font-bold text-theme-text mb-1">{researcher.name}</h1>
              <p className="text-sm text-theme-secondary mb-3">{researcher.position}</p>

              <div className="flex flex-wrap gap-2 justify-center">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getLevelColor(researcher.academic_level)}`}>
                  <GraduationCap className="w-3 h-3" />
                  {academicLevelLabels[researcher.academic_level] || researcher.academic_level}
                </span>
                <span className="px-2.5 py-1 bg-theme-accent/10 text-theme-accent rounded-full text-xs font-medium border border-theme-accent/20">
                  {researcher.department}
                </span>
              </div>
            </div>

            {/* Información de contacto — SIN "Desde año" ni "años experiencia" */}
            <div className="bg-theme-card border border-theme-border rounded-2xl p-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-theme-secondary mb-3">Contacto</h3>
              <div className="space-y-3">
                {researcher.email && (
                  <a href={`mailto:${researcher.email}`}
                    className="flex items-center gap-2.5 text-sm text-theme-secondary hover:text-theme-text transition-colors">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{researcher.email}</span>
                  </a>
                )}
                {researcher.phone && (
                  <a href={`tel:${researcher.phone}`}
                    className="flex items-center gap-2.5 text-sm text-theme-secondary hover:text-theme-text transition-colors">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{researcher.phone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Links externos */}
            {(researcher.linkedin_url || researcher.research_gate_url || researcher.personal_website) && (
              <div className="bg-theme-card border border-theme-border rounded-2xl p-5 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-theme-secondary mb-3">Enlaces</h3>
                {researcher.linkedin_url && (
                  <a href={researcher.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full p-2.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm">
                    <LinkIcon className="w-4 h-4" />LinkedIn<ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
                {researcher.research_gate_url && (
                  <a href={researcher.research_gate_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full p-2.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors text-sm">
                    <LinkIcon className="w-4 h-4" />ResearchGate<ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
                {researcher.personal_website && (
                  <a href={researcher.personal_website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full p-2.5 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors text-sm">
                    <LinkIcon className="w-4 h-4" />Sitio Web<ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
              </div>
            )}

          </div>

          {/* ── CONTENIDO DERECHA ── */}
          <div className="flex-1 min-w-0">

            {/* Tabs */}
            <div className="bg-theme-card border border-theme-border rounded-2xl mb-4 overflow-hidden">
              <nav className="flex border-b border-theme-border">
                {[
                  { key: 'profile', label: 'Perfil', icon: User },
                  { key: 'projects', label: 'Proyectos', icon: Briefcase },
                  { key: 'publications', label: 'Publicaciones', icon: BookOpen },
                  { key: 'achievements', label: 'Logros', icon: Trophy },
                ].map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
                    className={`flex items-center gap-2 py-4 px-5 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
                      activeTab === key
                        ? 'border-theme-accent text-theme-accent'
                        : 'border-transparent text-theme-secondary hover:text-theme-text'
                    }`}>
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </nav>

              {/* Contenido tabs */}
              <div className="p-6">

                {activeTab === 'profile' && (
                  <div className="space-y-6">

                    {/* Biografía */}
                    <div>
                      <h2 className="text-sm font-semibold uppercase tracking-widest text-theme-secondary mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />Biografía
                      </h2>
                      <p className="text-theme-text leading-relaxed">
                        {researcher.biography || <span className="text-theme-secondary italic">No hay biografía disponible.</span>}
                      </p>
                    </div>

                    {/* Académico — Universidad (izq) | Carrera (der) */}
                    <div>
                      <h2 className="text-sm font-semibold uppercase tracking-widest text-theme-secondary mb-3 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />Académico
                      </h2>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-theme-background rounded-xl border border-theme-border/50">
                          <p className="text-xs text-theme-secondary mb-0.5">Universidad</p>
                          <p className="text-sm text-theme-text font-medium">
                            {researcher.university || <span className="text-theme-secondary italic">—</span>}
                          </p>
                        </div>
                        <div className="p-3 bg-theme-background rounded-xl border border-theme-border/50">
                          <p className="text-xs text-theme-secondary mb-0.5">Carrera</p>
                          <p className="text-sm text-theme-text font-medium">
                            {researcher.degree || <span className="text-theme-secondary italic">—</span>}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Áreas de Investigación (izq) | Especializaciones (der) — misma altura */}
                    <div className="grid grid-cols-2 gap-3 items-start">
                      <div>
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-theme-secondary mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />Áreas de Investigación
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {researcher.research_interests?.length > 0
                            ? researcher.research_interests.map((interest, i) => (
                                <span key={i} className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-sm">{interest}</span>
                              ))
                            : <span className="text-theme-secondary text-sm italic">—</span>
                          }
                        </div>
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-theme-secondary mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4" />Especializaciones
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {researcher.specializations?.length > 0
                            ? researcher.specializations.map((spec, i) => (
                                <span key={i} className="px-3 py-1 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 rounded-lg text-sm">{spec}</span>
                              ))
                            : <span className="text-theme-secondary text-sm italic">—</span>
                          }
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div>
                      <h2 className="text-sm font-semibold uppercase tracking-widest text-theme-secondary mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4" />Estadísticas
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { value: allProjects.length, label: 'Proyectos' },
                          { value: researcher.publications_count, label: 'Publicaciones' },
                          { value: researcher.years_experience, label: 'Años Exp.' },
                          { value: researcher.achievements.length, label: 'Logros' },
                        ].map(({ value, label }) => (
                          <div key={label} className="text-center p-3 bg-theme-background rounded-xl border border-theme-border/50">
                            <div className="text-xl font-bold text-theme-text">{value}</div>
                            <div className="text-xs text-theme-secondary">{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {activeTab === 'projects' && (
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-theme-secondary mb-4 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />Proyectos ({allProjects.length})
                    </h2>
                    {allProjects.length > 0 ? (
                      <div className="space-y-3">
                        {allProjects.map((project) => (
                          <Link key={project.id} href={`/projects/${project.id}`}
                            className="flex items-center justify-between p-4 bg-theme-background rounded-xl border border-theme-border hover:border-theme-accent/40 hover:bg-theme-accent/5 transition-all">
                            <div>
                              <h3 className="font-medium text-theme-text">{project.title}</h3>
                              <p className="text-xs text-theme-secondary mt-0.5">
  Rol: {project.role === 'team_lead' ? 'Líder' : 'Miembro'}
</p>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full border ${
                              project.status === 'active' || project.status === 'planning'
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                            }`}>
                              {project.status === 'active' || project.status === 'planning' ? 'Activo' : 'Completado'}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="w-10 h-10 text-theme-secondary mx-auto mb-3" />
                        <p className="text-theme-secondary text-sm">No hay proyectos registrados.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'publications' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold uppercase tracking-widest text-theme-secondary flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />Publicaciones ({researcher.publications.length})
                      </h2>
                      {sbUser && sbUser.id === researcher.id && (
  <button onClick={() => setShowPubModal(true)}
    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-bright-blue to-neon-pink text-white text-sm font-semibold hover:opacity-90 transition-opacity">
    <Plus className="w-4 h-4" />Agregar Publicación
  </button>
)}
                    </div>
                    {researcher.publications.length > 0 ? (
                      <div className="space-y-3">
                        {researcher.publications.map((pub, i) => (
                          <div key={i} className="p-4 bg-theme-background rounded-xl border-l-4 border-blue-500 border border-theme-border">
                            <p className="text-theme-text text-sm">{pub}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="w-10 h-10 text-theme-secondary mx-auto mb-3" />
                        <p className="text-theme-secondary text-sm">No hay publicaciones registradas.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'achievements' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold uppercase tracking-widest text-theme-secondary flex items-center gap-2">
                        <Trophy className="w-4 h-4" />Logros ({researcher.achievements.length})
                      </h2>
                      {sbUser && sbUser.id === researcher.id && (
  <button onClick={() => setShowAchModal(true)}
    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-bright-blue to-neon-pink text-white text-sm font-semibold hover:opacity-90 transition-opacity">
    <Plus className="w-4 h-4" />Agregar Logro
  </button>
)}
                    </div>
                    {researcher.achievements.length > 0 ? (
                      <div className="space-y-3">
                        {researcher.achievements.map((ach, i) => (
                          <div key={i} className="p-4 bg-theme-background rounded-xl border-l-4 border-yellow-500 border border-theme-border">
                            <div className="flex items-start gap-3">
                              <Award className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <p className="text-theme-text text-sm">{ach}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Trophy className="w-10 h-10 text-theme-secondary mx-auto mb-3" />
                        <p className="text-theme-secondary text-sm">No hay logros registrados.</p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── MODAL AGREGAR PUBLICACIÓN ── */}
      {showPubModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPubModal(false); }}>
          <div className="border border-theme-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto modal-no-scrollbar"
            style={{ backgroundColor: 'var(--modal-bg)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-theme-border">
              <h2 className="text-xl font-semibold text-theme-text">Agregar Publicación</h2>
              <button onClick={() => setShowPubModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-theme-secondary hover:bg-theme-accent/10 hover:text-theme-text transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddPublication} className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-theme-secondary uppercase tracking-wide">Título Publicación *</label>
                <input type="text" value={pubForm.title} required
                  onChange={(e) => setPubForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ej. Análisis de sistemas IoT en entornos urbanos"
                  className="w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-theme-secondary uppercase tracking-wide">Descripción</label>
                <textarea value={pubForm.description} rows={3}
                  onChange={(e) => setPubForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Breve descripción de la publicación..."
                  className="w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg resize-none" />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-theme-secondary uppercase tracking-wide">URL Imagen</label>
                <input type="text" value={pubForm.image}
                  onChange={(e) => setPubForm(p => ({ ...p, image: e.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg" />
              </div>
              {pubMessage && (
                <div className={`rounded-lg px-4 py-3 text-sm font-medium border ${
                  pubMessage.type === 'success'
                    ? 'bg-green-500/10 text-green-400 border-green-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>{pubMessage.text}</div>
              )}
              <div className="flex gap-3 pt-2 pb-1">
                <button type="button" onClick={() => setShowPubModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-red-500/50 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={pubSaving}
                  className="rounded-md bg-gradient-to-r from-bright-blue to-neon-pink px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                  {pubSaving ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Añadiendo...</>
                  ) : 'Añadir Publicación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL AGREGAR LOGRO ── */}
      {showAchModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAchModal(false); }}>
          <div className="border border-theme-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto modal-no-scrollbar"
            style={{ backgroundColor: 'var(--modal-bg)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-theme-border">
              <h2 className="text-xl font-semibold text-theme-text">Añadir Logro</h2>
              <button onClick={() => setShowAchModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-theme-secondary hover:bg-theme-accent/10 hover:text-theme-text transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddAchievement} className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-theme-secondary uppercase tracking-wide">Título Logro *</label>
                <input type="text" value={achForm.title} required
                  onChange={(e) => setAchForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ej. Primer lugar en hackathon IoT 2025"
                  className="w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-theme-secondary uppercase tracking-wide">Descripción</label>
                <textarea value={achForm.description} rows={3}
                  onChange={(e) => setAchForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe el logro alcanzado..."
                  className="w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg resize-none" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-theme-secondary uppercase tracking-wide">Proyecto</label>
                <select disabled
                  value={researcher.current_projects?.[0]?.title || researcher.past_projects?.[0]?.title || ''}
                  className="w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text focus:outline-none transition-all bg-theme-bg opacity-60 cursor-not-allowed">
                  <option value={researcher.current_projects?.[0]?.title || researcher.past_projects?.[0]?.title || ''}>
                    {researcher.current_projects?.[0]?.title || researcher.past_projects?.[0]?.title || 'Sin proyecto asignado'}
                  </option>
                </select>
                <p className="text-xs text-theme-secondary/70">Proyecto asignado automáticamente.</p>
              </div>
              {achMessage && (
                <div className={`rounded-lg px-4 py-3 text-sm font-medium border ${
                  achMessage.type === 'success'
                    ? 'bg-green-500/10 text-green-400 border-green-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>{achMessage.text}</div>
              )}
              <div className="flex gap-3 pt-2 pb-1">
                <button type="button" onClick={() => setShowAchModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-red-500/50 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={achSaving}
                  className="rounded-md bg-gradient-to-r from-bright-blue to-neon-pink px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                  {achSaving ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Agregando...</>
                  ) : 'Agregar Logro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
