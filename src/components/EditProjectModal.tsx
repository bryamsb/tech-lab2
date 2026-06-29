'use client';

import { useState, useEffect } from 'react';
import {
  X, Save, Users, Crown, UserPlus, UserMinus,
  Search, ChevronDown, Link as LinkIcon, Target,
  AlertCircle, Briefcase, Plus
} from 'lucide-react';
import { TechProject } from '@/contexts/ProjectContext';
import { SupabaseResearcher, useSupabaseResearchers } from '@/hooks/useSupabaseResearchers';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: TechProject;
  onUpdate: (id: string, updates: Partial<TechProject>) => Promise<boolean>;
}

const inputClass =
  'w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text ' +
  'placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 ' +
  'focus:border-theme-accent transition-all bg-theme-bg';
const labelClass = 'block text-xs font-semibold text-theme-secondary uppercase tracking-wide mb-1.5';
const sectionTitle = 'text-sm font-semibold text-theme-secondary uppercase tracking-wide';

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function AvatarBadge({ name, size = 'md', isLead = false }: { name: string; size?: 'sm' | 'md'; isLead?: boolean }) {
  const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div className="relative flex-shrink-0">
      <div className={`${dim} rounded-full flex items-center justify-center font-bold ${isLead ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/50' : 'bg-theme-accent/15 text-theme-accent'}`}>
        {getInitials(name)}
      </div>
      {isLead && <Crown className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-400" />}
    </div>
  );
}

interface ProjectPosition {
  name: string;
  assignedTo: string;
}

export function EditProjectModal({ isOpen, onClose, project, onUpdate }: EditProjectModalProps) {
  const { researchers } = useSupabaseResearchers();

  const [formData, setFormData] = useState<Partial<TechProject>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'team' | 'positions' | 'links'>('info');

  const [memberSearch, setMemberSearch] = useState('');
  const [showLeadPicker, setShowLeadPicker] = useState(false);

  const [currentTech, setCurrentTech] = useState('');
  const [currentObjective, setCurrentObjective] = useState('');
  const [currentChallenge, setCurrentChallenge] = useState('');

  // Positions state
  const [positions, setPositions] = useState<ProjectPosition[]>([]);
  const [newPositionName, setNewPositionName] = useState('');

  useEffect(() => {
    if (isOpen && project) {
      setFormData({
        title: project.title,
        description: project.description,
        category: project.category,
        status: project.status,
        priority: project.priority,
        startDate: project.startDate,
        endDate: project.endDate ?? '',
        budget: project.budget ?? 0,
        progress: project.progress,
        teamLead: project.teamLead,
        teamMembers: [...(project.teamMembers ?? [])],
        technologies: [...(project.technologies ?? [])],
        objectives: [...(project.objectives ?? [])],
        challenges: [...(project.challenges ?? [])],
        demoUrl: project.demoUrl ?? '',
        repositoryUrl: project.repositoryUrl ?? '',
        documentation: project.documentation ?? '',
      });
      // Initialize positions from project.positions (stored as string[])
      setPositions(
        (project.positions ?? []).map((p) => {
          // Format: "Position Name (Assigned Member)" or just "Position Name"
          const match = p.match(/^(.+?)\s*\((.+)\)$/);
          if (match) return { name: match[1].trim(), assignedTo: match[2].trim() };
          return { name: p, assignedTo: '' };
        })
      );
      setActiveTab('info');
      setError(null);
      setNewPositionName('');
    }
  }, [isOpen, project]);

  useEffect(() => {
    if (!isOpen) return;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (key: keyof TechProject, value: unknown) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const addTag = (field: 'technologies' | 'objectives' | 'challenges', value: string, setter: (v: string) => void) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const current = (formData[field] as string[]) ?? [];
    if (!current.includes(trimmed)) set(field, [...current, trimmed]);
    setter('');
  };

  const removeTag = (field: 'technologies' | 'objectives' | 'challenges', index: number) => {
    const current = (formData[field] as string[]) ?? [];
    set(field, current.filter((_, i) => i !== index));
  };

  // ── Equipo ────────────────────────────────────────────────────────────────
  const currentMembers: string[] = formData.teamMembers ?? [];
  const currentLead: string = formData.teamLead ?? '';
  const teamResearchers = researchers.filter((r) => currentMembers.includes(r.name));
  const availableResearchers = researchers.filter(
    (r) => !currentMembers.includes(r.name) && r.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const addMember = (researcher: SupabaseResearcher) => {
    if (!currentMembers.includes(researcher.name)) set('teamMembers', [...currentMembers, researcher.name]);
    setMemberSearch('');
  };

  const removeMember = (name: string) => {
    set('teamMembers', currentMembers.filter((m) => m !== name));
    if (name === currentLead) set('teamLead', '');
    setPositions((prev) => prev.map((p) => p.assignedTo === name ? { ...p, assignedTo: '' } : p));
  };

  const designateLead = (name: string) => { set('teamLead', name); setShowLeadPicker(false); };

  // ── Positions ─────────────────────────────────────────────────────────────
  const allTeamMembers = currentLead
    ? [currentLead, ...currentMembers.filter((m) => m !== currentLead)]
    : currentMembers;

  const addPosition = () => {
    const trimmed = newPositionName.trim();
    if (!trimmed) return;
    setPositions((prev) => [...prev, { name: trimmed, assignedTo: '' }]);
    setNewPositionName('');
  };

  const removePosition = (i: number) => setPositions((prev) => prev.filter((_, idx) => idx !== i));

  const assignPosition = (posIdx: number, memberName: string) => {
    setPositions((prev) => prev.map((p, i) => i === posIdx ? { ...p, assignedTo: memberName } : p));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      setError('Título, descripción y categoría son obligatorios.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const ok = await onUpdate(project.id, {
        ...formData,
        // Store positions as "Position Name (Member)" strings
        positions: positions.map((p) => p.assignedTo ? `${p.name} (${p.assignedTo})` : p.name),
      });
      if (ok) onClose();
      else setError('No se pudo guardar. Inténtalo de nuevo.');
    } catch {
      setError('Error inesperado al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'info' as const, label: 'Información' },
    { id: 'team' as const, label: 'Equipo' },
    { id: 'positions' as const, label: 'Posiciones' },
    { id: 'links' as const, label: 'Links & Extras' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="border border-theme-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col modal-container"
        style={{ backgroundColor: 'var(--modal-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-theme-border sticky top-0 z-10 flex-shrink-0" style={{ backgroundColor: 'var(--modal-bg)' }}>
          <div className="min-w-0 pr-4">
            <h2 className="text-xl font-semibold text-theme-text truncate">Editar Proyecto</h2>
            <p className="text-xs text-theme-secondary truncate mt-0.5">{project.title}</p>
          </div>
          <button type="button" onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-theme-secondary hover:bg-theme-accent/10 hover:text-theme-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-theme-border px-6 flex-shrink-0 overflow-x-auto" style={{ backgroundColor: 'var(--modal-bg)' }}>
          {tabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${activeTab === tab.id ? 'border-theme-accent text-theme-accent' : 'border-transparent text-theme-secondary hover:text-theme-text'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* ══ TAB: INFORMACIÓN ══ */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              <h3 className={sectionTitle}>Datos generales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Título *</label>
                  <input type="text" required value={formData.title ?? ''} onChange={(e) => set('title', e.target.value)} className={inputClass} placeholder="Título del proyecto" />
                </div>
                <div>
                  <label className={labelClass}>Categoría *</label>
                  <input type="text" required value={formData.category ?? ''} onChange={(e) => set('category', e.target.value)} className={inputClass} placeholder="ej. IoT, IA, Blockchain" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Descripción *</label>
                <textarea required value={formData.description ?? ''} onChange={(e) => set('description', e.target.value)} className={inputClass + ' h-24 resize-none'} placeholder="Describe el objetivo y alcance del proyecto..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Estado</label>
                  <select value={formData.status ?? 'planning'} onChange={(e) => set('status', e.target.value as TechProject['status'])} className={inputClass}>
                    <option value="planning">Planificación</option>
                    <option value="active">Activo</option>
                    <option value="paused">Pausado</option>
                    <option value="completed">Completado</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Prioridad</label>
                  <select value={formData.priority ?? 'medium'} onChange={(e) => set('priority', e.target.value as TechProject['priority'])} className={inputClass}>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Progreso (%)</label>
                  <input type="number" min={0} max={100} value={formData.progress ?? 0} onChange={(e) => set('progress', Number(e.target.value))} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Fecha de inicio</label>
                  <input type="date" value={formData.startDate ?? ''} onChange={(e) => set('startDate', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fecha de fin</label>
                  <input type="date" value={formData.endDate ?? ''} onChange={(e) => set('endDate', e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Presupuesto (USD)</label>
                <input type="number" min={0} value={formData.budget ?? 0} onChange={(e) => set('budget', Number(e.target.value))} className={inputClass} />
              </div>

              {/* Tecnologías */}
              <div>
                <label className={labelClass}>Tecnologías</label>
                <div className="flex gap-2">
                  <input type="text" value={currentTech} onChange={(e) => setCurrentTech(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('technologies', currentTech, setCurrentTech); } }}
                    className={inputClass} placeholder="ej. React, TensorFlow..." />
                  <button type="button" onClick={() => addTag('technologies', currentTech, setCurrentTech)}
                    className="px-3 py-2 rounded-lg bg-theme-accent/20 hover:bg-theme-accent/30 text-theme-accent text-sm font-medium transition-colors flex-shrink-0">Añadir</button>
                </div>
                {(formData.technologies ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(formData.technologies ?? []).map((t, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-theme-accent/15 text-theme-accent">
                        {t}<button type="button" onClick={() => removeTag('technologies', i)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Objetivos */}
              <div>
                <label className={labelClass}><Target className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />Objetivos</label>
                <div className="flex gap-2">
                  <input type="text" value={currentObjective} onChange={(e) => setCurrentObjective(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('objectives', currentObjective, setCurrentObjective); } }}
                    className={inputClass} placeholder="Añade un objetivo..." />
                  <button type="button" onClick={() => addTag('objectives', currentObjective, setCurrentObjective)}
                    className="px-3 py-2 rounded-lg bg-theme-accent/20 hover:bg-theme-accent/30 text-theme-accent text-sm font-medium transition-colors flex-shrink-0">Añadir</button>
                </div>
                {(formData.objectives ?? []).length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {(formData.objectives ?? []).map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-theme-text p-2 rounded-lg bg-theme-accent/5 border border-theme-border/50">
                        <span className="flex-1">{obj}</span>
                        <button type="button" onClick={() => removeTag('objectives', i)} className="text-theme-secondary hover:text-red-400 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Retos */}
              <div>
                <label className={labelClass}>Retos / Desafíos</label>
                <div className="flex gap-2">
                  <input type="text" value={currentChallenge} onChange={(e) => setCurrentChallenge(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('challenges', currentChallenge, setCurrentChallenge); } }}
                    className={inputClass} placeholder="Añade un reto..." />
                  <button type="button" onClick={() => addTag('challenges', currentChallenge, setCurrentChallenge)}
                    className="px-3 py-2 rounded-lg bg-theme-accent/20 hover:bg-theme-accent/30 text-theme-accent text-sm font-medium transition-colors flex-shrink-0">Añadir</button>
                </div>
                {(formData.challenges ?? []).length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {(formData.challenges ?? []).map((ch, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-theme-text p-2 rounded-lg border border-orange-500/20 bg-orange-500/5">
                        <span className="flex-1">{ch}</span>
                        <button type="button" onClick={() => removeTag('challenges', i)} className="text-theme-secondary hover:text-red-400 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* ══ TAB: EQUIPO ══ */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* Líder */}
              <div>
                <h3 className={sectionTitle + ' flex items-center gap-1.5 mb-3'}>
                  <Crown className="w-4 h-4 text-amber-400" /> Líder del proyecto
                </h3>
                {currentLead ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
                    <AvatarBadge name={currentLead} isLead />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-theme-text truncate">{currentLead}</p>
                      <p className="text-xs text-amber-400">Líder actual</p>
                    </div>
                    <div className="relative">
                      <button type="button" onClick={() => setShowLeadPicker((v) => !v)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 transition-colors">
                        Cambiar <ChevronDown className="w-3 h-3" />
                      </button>
                      {showLeadPicker && currentMembers.length > 0 && (
                        <div className="absolute right-0 top-9 z-20 w-52 rounded-xl border border-theme-border shadow-xl overflow-hidden" style={{ backgroundColor: 'var(--modal-bg)' }}>
                          {currentMembers.filter((m) => m !== currentLead).map((name) => (
                            <button key={name} type="button" onClick={() => designateLead(name)}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-theme-text hover:bg-theme-accent/10 transition-colors text-left">
                              <AvatarBadge name={name} size="sm" /><span className="truncate">{name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-theme-secondary italic">No hay líder designado. Añade miembros y designa uno.</p>
                )}
              </div>

              {/* Miembros */}
              <div>
                <h3 className={sectionTitle + ' flex items-center gap-1.5 mb-3'}>
                  <Users className="w-4 h-4" /> Miembros del equipo
                  <span className="ml-auto text-xs font-normal normal-case text-theme-secondary">
                    {currentMembers.length} miembro{currentMembers.length !== 1 ? 's' : ''}
                  </span>
                </h3>
                {currentMembers.length === 0 ? (
                  <p className="text-sm text-theme-secondary italic py-4 text-center">Sin miembros. Añade investigadores desde abajo.</p>
                ) : (
                  <div className="space-y-2">
                    {currentMembers.map((name) => {
                      const researcher = teamResearchers.find((r) => r.name === name);
                      const isLead = name === currentLead;
                      return (
                        <div key={name} className="flex items-center gap-3 p-3 rounded-xl border border-theme-border/60 bg-theme-bg/50">
                          <AvatarBadge name={name} isLead={isLead} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-theme-text truncate">{name}</p>
                            {researcher && (
                              <p className="text-xs text-theme-secondary truncate">
                                {researcher.position}{researcher.specializations?.[0] ? ` · ${researcher.specializations[0]}` : ''}
                              </p>
                            )}
                          </div>
                          {!isLead && (
                            <button type="button" onClick={() => designateLead(name)} title="Designar como líder"
                              className="p-1.5 rounded-lg text-theme-secondary hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                              <Crown className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button type="button" onClick={() => removeMember(name)} title="Quitar del proyecto"
                            className="p-1.5 rounded-lg text-theme-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Añadir investigadores */}
              <div>
                <h3 className={sectionTitle + ' flex items-center gap-1.5 mb-3'}>
                  <UserPlus className="w-4 h-4" /> Añadir investigadores
                </h3>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary pointer-events-none" />
                  <input type="text" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)}
                    className={inputClass + ' pl-9'} placeholder="Buscar por nombre..." />
                </div>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {availableResearchers.length === 0 ? (
                    <p className="text-sm text-theme-secondary italic text-center py-4">
                      {memberSearch ? 'Sin resultados para esa búsqueda.' : 'Todos los investigadores ya están en el equipo.'}
                    </p>
                  ) : (
                    availableResearchers.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-theme-border/40 hover:border-theme-accent/40 hover:bg-theme-accent/5 transition-all">
                        <AvatarBadge name={r.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-theme-text truncate">{r.name}</p>
                          <p className="text-xs text-theme-secondary truncate">{r.position}{r.specializations?.[0] ? ` · ${r.specializations[0]}` : ''}</p>
                        </div>
                        <button type="button" onClick={() => addMember(r)}
                          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-theme-accent/15 hover:bg-theme-accent/25 text-theme-accent transition-colors">
                          <UserPlus className="w-3 h-3" /> Añadir
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ TAB: POSICIONES ══ */}
          {activeTab === 'positions' && (
            <div className="space-y-5">
              <div>
                <h3 className={sectionTitle + ' flex items-center gap-1.5 mb-1'}>
                  <Briefcase className="w-4 h-4 text-purple-400" /> Posiciones del proyecto
                </h3>
                <p className="text-xs text-theme-secondary mb-4">
                  Define roles/posiciones y asígnalos a miembros. La posición asignada se añadirá como especialización en el perfil del investigador al guardar.
                </p>
              </div>

              {/* Añadir nueva posición */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPositionName}
                  onChange={(e) => setNewPositionName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPosition(); } }}
                  className={inputClass}
                  placeholder="ej. Desarrollador Backend, Líder de Investigación..."
                />
                <button type="button" onClick={addPosition}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" /> Añadir
                </button>
              </div>

              {/* Lista de posiciones */}
              {positions.length === 0 ? (
                <p className="text-sm text-theme-secondary italic text-center py-6">Sin posiciones definidas. Añade una posición arriba.</p>
              ) : (
                <div className="space-y-2">
                  {positions.map((pos, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-purple-500/20 bg-purple-500/5">
                      <Briefcase className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-theme-text">{pos.name}</p>
                        {pos.assignedTo && (
                          <p className="text-xs text-purple-400 mt-0.5">→ {pos.assignedTo}</p>
                        )}
                      </div>
                      {/* Selector de miembro */}
                      <select
                        value={pos.assignedTo}
                        onChange={(e) => assignPosition(i, e.target.value)}
                        className="text-xs rounded-lg border border-theme-border px-2 py-1.5 bg-theme-bg text-theme-text focus:outline-none focus:ring-1 focus:ring-purple-400/50 max-w-[180px]"
                      >
                        <option value="">Sin asignar</option>
                        {allTeamMembers.map((name) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                      {pos.assignedTo && (
                        <AvatarBadge name={pos.assignedTo} size="sm" isLead={pos.assignedTo === currentLead} />
                      )}
                      <button type="button" onClick={() => removePosition(i)}
                        className="p-1.5 rounded-lg text-theme-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {positions.some((p) => p.assignedTo) && (
                <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 text-xs text-purple-400">
                  💡 Al guardar, la posición asignada se añadirá como especialización en el perfil de cada investigador.
                </div>
              )}
            </div>
          )}

          {/* ══ TAB: LINKS ══ */}
          {activeTab === 'links' && (
            <div className="space-y-5">
              <h3 className={sectionTitle}><LinkIcon className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />URLs y documentación</h3>
              <div>
                <label className={labelClass}>URL de demo</label>
                <input type="url" value={formData.demoUrl ?? ''} onChange={(e) => set('demoUrl', e.target.value)} className={inputClass} placeholder="https://demo.proyecto.com" />
              </div>
              <div>
                <label className={labelClass}>Repositorio</label>
                <input type="url" value={formData.repositoryUrl ?? ''} onChange={(e) => set('repositoryUrl', e.target.value)} className={inputClass} placeholder="https://github.com/org/repo" />
              </div>
              <div>
                <label className={labelClass}>Documentación (URL o texto)</label>
                <textarea value={formData.documentation ?? ''} onChange={(e) => set('documentation', e.target.value)} className={inputClass + ' h-32 resize-none'} placeholder="Enlace o notas de documentación del proyecto..." />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-theme-border flex-shrink-0" style={{ backgroundColor: 'var(--modal-bg)' }}>
          <button type="button" onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-accent/10 hover:text-theme-text transition-colors border border-theme-border">
            Cancelar
          </button>
          <button type="button" onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-theme-accent hover:bg-theme-accent/90 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Guardando...</>
            ) : (
              <><Save className="w-4 h-4" />Guardar cambios</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
