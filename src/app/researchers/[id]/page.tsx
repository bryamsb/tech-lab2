'use client';
import { supabase } from '@/lib/supabase';
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
  const [editingPubId, setEditingPubId] = useState<string | null>(null);
const [deletingPubId, setDeletingPubId] = useState<string | null>(null);
const [deletingPubTitle, setDeletingPubTitle] = useState('');


  const { researchers, loading, fetchResearchers } = useSupabaseResearchers({ autoFetch: true });
  const [researcher, setResearcher] = useState<SupabaseResearcher | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'publications' | 'achievements'>('profile');

  // Modal publicación
  const [showPubModal, setShowPubModal] = useState(false);
  const [pubForm, setPubForm] = useState({ title: '', description: '', images: [''] });

  const [pubSaving, setPubSaving] = useState(false);
  const [pubMessage, setPubMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal logro
  const [showAchModal, setShowAchModal] = useState(false);
  const [achForm, setAchForm] = useState({ title: '', description: '', project: '' });

  const [achSaving, setAchSaving] = useState(false);
  const [achMessage, setAchMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingAchId, setDeletingAchId] = useState<string | null>(null);
const [deletingAchTitle, setDeletingAchTitle] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState<{
  title: string;
  description: string;
  project: string;
} | null>(null);

// Logros desde Supabase
const [achievements, setAchievements] = useState<{
  id: string;
  title: string;
  description: string;
  project: string;
}[]>([]);

useEffect(() => {
  if (!researcher?.id) return;
  supabase
    .from('achievements')
    .select('*')
    .eq('user_id', researcher.id)
    .then(({ data }) => {
      if (data) setAchievements(data);
    });
}, [researcher?.id]);

const [publications, setPublications] = useState<{
  id: string;
  title: string;
  description: string;
  image_url: string;
  image_urls: string[];
  created_at: string;
}[]>([]);

useEffect(() => {
  if (!researcher?.id) return;
  supabase
    .from('publications')
    .select('*')
    .eq('user_id', researcher.id)
    .order('created_at', { ascending: false })
    .then(({ data }) => {
      if (data) setPublications(data);
    });
}, [researcher?.id]);



  // Bloquear scroll del body al abrir modales
  useEffect(() => {
    if (showPubModal || showAchModal) {
      document.documentElement.classList.add('modal-open');
    } else {
      document.documentElement.classList.remove('modal-open');
    }
    return () => { document.documentElement.classList.remove('modal-open'); };
  }, [showPubModal, showAchModal]);

const [editingAchId, setEditingAchId] = useState<string | null>(null);

const handleDeleteAchievement = async () => {
  if (!deletingAchId) return;
  await supabase.from('achievements').delete().eq('id', deletingAchId);
  setAchievements(prev => prev.filter(a => a.id !== deletingAchId));
  setDeletingAchId(null);
  setDeletingAchTitle('');
};

  const handleAddPublication = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!researcher) return;
  setPubSaving(true);
  setPubMessage(null);

  const payload = {
  title: pubForm.title,
  description: pubForm.description,
  image_url: pubForm.images[0] || '',
  image_urls: pubForm.images.filter(u => u.trim() !== ''),
};

  let error;
  if (editingPubId) {
    ({ error } = await supabase.from('publications').update(payload).eq('id', editingPubId));
  } else {
    ({ error } = await supabase.from('publications').insert({ ...payload, user_id: researcher.id }));
  }

  if (error) {
    setPubMessage({ type: 'error', text: 'Error al guardar la publicación.' });
  } else {
    setPubMessage({ type: 'success', text: editingPubId ? '¡Publicación actualizada!' : '¡Publicación agregada!' });
    const { data } = await supabase.from('publications').select('*').eq('user_id', researcher.id).order('created_at', { ascending: false });
    if (data) setPublications(data);
    setTimeout(() => {
      setShowPubModal(false);
      setPubForm({ title: '', description: '', images: [''] });

      setEditingPubId(null);
      setPubMessage(null);
    }, 1500);
  }
  setPubSaving(false);
};

  const handleDeletePublication = async () => {
  if (!deletingPubId) return;
  await supabase.from('publications').delete().eq('id', deletingPubId);
  setPublications(prev => prev.filter(p => p.id !== deletingPubId));
  setDeletingPubId(null);
  setDeletingPubTitle('');
};

  const handleAddAchievement = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!researcher) return;
  setAchSaving(true);
  setAchMessage(null);

  const payload = {
    title: achForm.title,
    description: achForm.description,
    project: achForm.project,

  };

  let error;
  if (editingAchId) {
    ({ error } = await supabase.from('achievements').update(payload).eq('id', editingAchId));
  } else {
    ({ error } = await supabase.from('achievements').insert({ ...payload, user_id: researcher.id }));
  }

  if (error) {
    setAchMessage({ type: 'error', text: 'Error al guardar el logro.' });
  } else {
    setAchMessage({ type: 'success', text: editingAchId ? '¡Logro actualizado!' : '¡Logro agregado correctamente!' });
    const { data } = await supabase.from('achievements').select('*').eq('user_id', researcher.id);
    if (data) setAchievements(data);
    setTimeout(() => {
      setShowAchModal(false);
      setAchForm({ title: '', description: '', project: '' });
      setEditingAchId(null);
      setAchMessage(null);
    }, 1500);
  }
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
                          { value: publications.length, label: 'Publicaciones' },

                          { value: researcher.years_experience, label: 'Años Exp.' },
                          { value: achievements.length, label: 'Logros' },

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
        <BookOpen className="w-4 h-4" />Publicaciones ({publications.length})
      </h2>
      {sbUser && sbUser.id === researcher.id && (
        <button
          onClick={() => {
            setEditingPubId(null);
            setPubForm({ title: '', description: '', images: [''] });
            setShowPubModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-bright-blue to-neon-pink text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />Agregar Publicación
        </button>
      )}
    </div>
    {publications.length > 0 ? (
      <div className="space-y-3">
        {publications.map((pub) => (
            <div key={pub.id} className="group relative">
              <Link
                href={`/publications/${pub.id}`}
                className="flex items-center gap-4 p-4 bg-theme-background rounded-xl border border-theme-border hover:border-theme-accent/40 hover:bg-theme-accent/5 transition-all"
              >
                <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-theme-text text-base truncate">{pub.title}</h3>
                  {sbUser && (sbUser.id === researcher.id || profile?.role === 'admin') && (
  <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.preventDefault()}>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setPubForm({ 
  title: pub.title, 
  description: pub.description, 
  images: pub.image_urls?.length ? pub.image_urls : [pub.image_url || ''] 
});
                          setEditingPubId(pub.id);
                          setShowPubModal(true);
                        }}
                        className="p-1.5 rounded-lg border border-theme-border bg-theme-card text-theme-secondary hover:text-theme-text hover:border-theme-accent/50 transition-colors"
                        title="Editar publicación">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setDeletingPubId(pub.id);
                          setDeletingPubTitle(pub.title);
                        }}
                        className="p-1.5 rounded-lg border border-red-500/40 bg-theme-card text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Eliminar publicación">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-theme-secondary text-sm line-clamp-2">
                  {pub.description || 'Sin descripción...'}
                </p>
              </div>
                <div className="w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-theme-border bg-theme-card flex items-center justify-center">
                  {pub.image_url ? (
                    <img src={pub.image_url} alt={pub.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <BookOpen className="w-6 h-6 text-theme-secondary/40" />
                  )}
                </div>
              </Link>

              {/* Botones editar/eliminar — solo dueño */}
              
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
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-theme-secondary flex items-center gap-2">
        <Trophy className="w-4 h-4" />Logros ({achievements.length})
      </h2>
      {sbUser && profile?.role === 'admin' && (
        <button onClick={() => {
          setEditingAchId(null);
          setAchForm({ title: '', description: '', project: '' });
          setShowAchModal(true);
        }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-bright-blue to-neon-pink text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />Agregar Logro
        </button>
      )}
    </div>

    {achievements.length > 0 ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {achievements.map((ach) => (
          <div
  key={ach.id}
  className="group relative flex flex-col items-center gap-3 p-4 rounded-2xl border border-theme-border bg-theme-background hover:border-theme-accent/60 hover:shadow-lg transition-all duration-200 cursor-pointer"
  onClick={() => setSelectedAchievement(ach)}
>
  <p className="text-xs font-bold uppercase tracking-widest text-theme-text text-center leading-tight">
    {ach.title}
  </p>
  <svg
    viewBox="0 0 51 48"
    className="w-24 h-24 group-hover:scale-105 transition-transform duration-200"
    style={{ fill: 'var(--theme-text)', stroke: 'var(--theme-text)' }}
    strokeWidth="1.5"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M25.5 2l6.18 12.53 13.82 2.01-10 9.74 2.36 13.75L25.5 33.77 13.64 40.03 16 26.28 6 16.54l13.82-2.01z" />
  </svg>

  {/* Botones editar/eliminar — solo para el dueño */}
  {sbUser && profile?.role === 'admin' && (
  <div
    className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    onClick={(e) => e.stopPropagation()}
  >
      <button
        onClick={() => {
          setAchForm({ title: ach.title, description: ach.description, project: ach.project });
          setEditingAchId(ach.id);
          setShowAchModal(true);
        }}
        className="p-1.5 rounded-lg border border-theme-border bg-theme-card text-theme-secondary hover:text-theme-text hover:border-theme-accent/50 transition-colors"
        title="Editar logro"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        onClick={() => { setDeletingAchId(ach.id); setDeletingAchTitle(ach.title); }}

        className="p-1.5 rounded-lg border border-red-500/40 bg-theme-card text-red-500 hover:bg-red-500/10 transition-colors"
        title="Eliminar logro"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  )}
</div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12">
        <Trophy className="w-10 h-10 text-theme-secondary mx-auto mb-3" />
        <p className="text-theme-secondary text-sm">No hay logros registrados.</p>
      </div>
    )}

    {/* Modal detalle del logro */}
    {selectedAchievement && (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
        onClick={() => setSelectedAchievement(null)}
      >
        <div
          className="border border-theme-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col items-center gap-4"
          style={{ backgroundColor: 'var(--modal-bg)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full flex justify-between items-center">
  <h2 className="text-xl font-semibold text-theme-text capitalize text-center flex-1">
              {selectedAchievement.title}
            </h2>
            <button
              onClick={() => setSelectedAchievement(null)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-theme-secondary hover:bg-theme-accent/10 hover:text-theme-text transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Estrella grande */}
          <svg
            viewBox="0 0 51 48"
            className="w-40 h-40"
style={{ fill: 'var(--theme-text)', stroke: 'var(--theme-text)' }}
            strokeWidth="1.5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M25.5 2l6.18 12.53 13.82 2.01-10 9.74 2.36 13.75L25.5 33.77 13.64 40.03 16 26.28 6 16.54l13.82-2.01z" />
          </svg>

          <div className="w-full space-y-2 text-sm text-theme-secondary text-center">
  {selectedAchievement.description && (
    <p>{selectedAchievement.description}</p>
  )}
  {selectedAchievement.project && (
    <p className="font-medium">
      Proyecto : <span className="text-theme-text">{selectedAchievement.project}</span>
    </p>
  )}
</div>
        </div>
      </div>
    )}
  </div>
 )}

              </div>  {/* fin contenido tabs */}
            </div>    {/* fin tab card */}
          </div>      {/* fin contenido derecha */}
        </div>        {/* fin layout principal */}
      </main>
      {showPubModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPubModal(false); }}>
          <div className="border border-theme-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto modal-no-scrollbar"
            style={{ backgroundColor: 'var(--modal-bg)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-theme-border">
              <h2 className="text-xl font-semibold text-theme-text">
  {editingPubId ? 'Editar Publicación' : 'Agregar Publicación'}
</h2>
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
  <label className="block text-xs font-semibold text-theme-secondary uppercase tracking-wide">
    URL Imagen(s)
  </label>
  {pubForm.images.map((url, idx) => (
    <div key={idx} className="flex gap-2 items-center">
      <input
        type="text"
        value={url}
        onChange={(e) => {
          const newImages = [...pubForm.images];
          newImages[idx] = e.target.value;
          setPubForm(p => ({ ...p, images: newImages }));
        }}
        placeholder="https://ejemplo.com/imagen.jpg"
        className="flex-1 rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg"
      />
      {pubForm.images.length > 1 && (
        <button
          type="button"
          onClick={() => setPubForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}
          className="p-2 rounded-lg border border-red-500/40 text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  ))}
  <button
    type="button"
    onClick={() => setPubForm(p => ({ ...p, images: [...p.images, ''] }))}
    className="flex items-center gap-1.5 text-xs text-theme-accent hover:text-theme-accent/80 transition-colors mt-1">
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
    Agregar otra imagen
  </button>
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
  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
    {editingPubId ? 'Guardando...' : 'Añadiendo...'}
  </>
) : (editingPubId ? 'Guardar Cambios' : 'Añadir Publicación')}
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
              <h2 className="text-xl font-semibold text-theme-text">
  {editingAchId ? 'Editar Logro' : 'Añadir Logro'}
</h2>
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
                <select
  value={achForm.project}

  onChange={(e) => setAchForm(p => ({ ...p, project: e.target.value }))}
  className="w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg">
  <option value="">Sin proyecto</option>
  {[...( researcher.current_projects || []), ...(researcher.past_projects || [])].map((p) => (
    <option key={p.id} value={p.title}>{p.title}</option>
  ))}
</select>
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
  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
    {editingAchId ? 'Guardando...' : 'Agregando...'}
  </>
) : (editingAchId ? 'Guardar Cambios' : 'Agregar Logro')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ── MODAL CONFIRMAR ELIMINAR LOGRO ── */}
{deletingAchId && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center"
    style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
    onClick={() => { setDeletingAchId(null); setDeletingAchTitle(''); }}>
    <div className="border border-theme-border rounded-2xl shadow-2xl w-full max-w-md mx-4"
      style={{ backgroundColor: 'var(--modal-bg)' }}
      onClick={(e) => e.stopPropagation()}>
      <div className="px-6 pt-6 pb-4 border-b border-theme-border">
        <h2 className="text-xl font-semibold text-theme-text">Confirmar eliminación</h2>
      </div>
      <div className="px-6 py-5">
        <p className="text-theme-secondary text-sm">
          ¿Estás seguro de eliminar el logro{' '}
          <span className="text-theme-text font-semibold">"{deletingAchTitle}"</span>?
          Esta acción no se puede deshacer.
        </p>
      </div>
      <div className="flex gap-3 px-6 pb-6">
        <button
          onClick={() => { setDeletingAchId(null); setDeletingAchTitle(''); }}
          className="flex-1 py-2.5 rounded-xl border border-red-500/50 text-sm font-medium transition-colors text-red-400 hover:bg-red-500/10 cursor-pointer">
          No
        </button>
        <button
          onClick={handleDeleteAchievement}
          className="flex-1 rounded-xl bg-red-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition-colors cursor-pointer flex items-center justify-center gap-2">
          Sí, eliminar
        </button>
      </div>
    </div>
  </div>
)}


{/* ── MODAL CONFIRMAR ELIMINAR PUBLICACIÓN ── */}
{deletingPubId && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center"
    style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
    onClick={() => { setDeletingPubId(null); setDeletingPubTitle(''); }}>
    <div className="border border-theme-border rounded-2xl shadow-2xl w-full max-w-md mx-4"
      style={{ backgroundColor: 'var(--modal-bg)' }}
      onClick={(e) => e.stopPropagation()}>
      <div className="px-6 pt-6 pb-4 border-b border-theme-border">
        <h2 className="text-xl font-semibold text-theme-text">Confirmar eliminación</h2>
      </div>
      <div className="px-6 py-5">
        <p className="text-theme-secondary text-sm">
          ¿Estás seguro de eliminar la publicación{' '}
          <span className="text-theme-text font-semibold">"{deletingPubTitle}"</span>?
          Esta acción no se puede deshacer.
        </p>
      </div>
      <div className="flex gap-3 px-6 pb-6">
        <button onClick={() => { setDeletingPubId(null); setDeletingPubTitle(''); }}
          className="flex-1 py-2.5 rounded-xl border border-red-500/50 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
          No
        </button>
        <button onClick={handleDeletePublication}
          className="flex-1 rounded-xl bg-red-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition-colors cursor-pointer">
          Sí, eliminar
        </button>
      </div>
    </div>
  </div>
)}
     </div>
  );
}