'use client';

import { useState } from 'react';
import { X, Target, Link as LinkIcon } from 'lucide-react';
import { TechProject } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContextLegacy';
import { useEffect } from 'react';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (project: Omit<TechProject, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function AddProjectModal({ isOpen, onClose, onAdd }: AddProjectModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '', description: '', category: '',
    technologies: [] as string[],
    status: 'planning' as TechProject['status'],
    priority: 'medium' as TechProject['priority'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '', teamLead: user?.name || '',
    teamMembers: [] as string[], budget: 0, progress: 0,
    objectives: [] as string[], challenges: [] as string[],
    gallery: [] as string[], demoUrl: '', repositoryUrl: '',
    documentation: '', relatedTechnologyIds: [] as string[],
    createdBy: user?.username || 'admin',
  });

  const [currentTech, setCurrentTech] = useState('');
  const [currentMember, setCurrentMember] = useState('');


  useEffect(() => {
    if (!isOpen) return;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);
  const resetForm = () => setFormData({
    title: '', description: '', category: '', technologies: [],
    status: 'planning', priority: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '', teamLead: user?.name || '', teamMembers: [],
    budget: 0, progress: 0, objectives: [], challenges: [],
    gallery: [], demoUrl: '', repositoryUrl: '', documentation: '',
    relatedTechnologyIds: [], createdBy: user?.username || 'admin',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.description && formData.category) {
      onAdd(formData);
      resetForm();
      onClose();
    }
  };

  const addTechnology = () => {
    if (currentTech.trim() && !formData.technologies.includes(currentTech.trim())) {
      setFormData({ ...formData, technologies: [...formData.technologies, currentTech.trim()] });
      setCurrentTech('');
    }
  };
  const removeTechnology = (i: number) =>
    setFormData({ ...formData, technologies: formData.technologies.filter((_, idx) => idx !== i) });

  const addTeamMember = () => {
    if (currentMember.trim() && !formData.teamMembers.includes(currentMember.trim())) {
      setFormData({ ...formData, teamMembers: [...formData.teamMembers, currentMember.trim()] });
      setCurrentMember('');
    }
  };
  const removeTeamMember = (i: number) =>
    setFormData({ ...formData, teamMembers: formData.teamMembers.filter((_, idx) => idx !== i) });

  if (!isOpen) return null;

  const inputClass = "w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg";
  const labelClass = "block text-xs font-semibold text-theme-secondary uppercase tracking-wide mb-1.5";
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="border border-theme-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-container"
        style={{ backgroundColor: 'var(--modal-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-theme-border sticky top-0 z-10" style={{ backgroundColor: 'var(--modal-bg)' }}>
          <h2 className="text-xl font-semibold text-theme-text">Crear Nuevo Proyecto</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-theme-secondary hover:bg-theme-accent/10 hover:text-theme-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-theme-secondary uppercase tracking-wide">Información Básica</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Título del Proyecto *</label>
                <input type="text" required value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputClass} placeholder="ej. Sistema de IA Avanzado" />
              </div>
              <div>
                <label className={labelClass}>Categoría *</label>
                <input type="text" required value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={inputClass} placeholder="ej. Artificial Intelligence, IoT" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Descripción *</label>
              <textarea required value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={inputClass + ' h-24 resize-none'}
                placeholder="Describe el objetivo y alcance del proyecto..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Estado</label>
                <select value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TechProject['status'] })}
                  className={inputClass}>
                  <option value="planning">Planificación</option>
                  <option value="active">Activo</option>
                  <option value="paused">Pausado</option>
                  <option value="completed">Completado</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Prioridad</label>
                <select value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TechProject['priority'] })}
                  className={inputClass}>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Progreso (%)</label>
                <input type="number" min="0" max="100" value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                  className={inputClass} />
              </div>
            </div>
          </div>

          {/* Fechas y Equipo */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-theme-secondary uppercase tracking-wide">Fechas y Equipo</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Fecha de Inicio</label>
                <input type="date" value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Fecha de Fin (opcional)</label>
                <input type="date" value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Presupuesto (opcional)</label>
                <input type="number" min="0" value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                  className={inputClass} placeholder="0" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Team Lead</label>
              <input type="text" value={formData.teamLead}
                onChange={(e) => setFormData({ ...formData, teamLead: e.target.value })}
                className={inputClass} placeholder="Nombre del líder del proyecto" />
            </div>

            <div>
              <label className={labelClass}>Miembros del Equipo</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={currentMember}
                  onChange={(e) => setCurrentMember(e.target.value)}
                  className={inputClass} placeholder="Nombre del miembro"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTeamMember())} />
                <button type="button" onClick={addTeamMember}
                  className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:opacity-90 text-sm font-medium whitespace-nowrap">
                  Agregar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.teamMembers.map((member, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-theme-accent/10 text-theme-accent rounded-full text-sm">
                    {member}
                    <button type="button" onClick={() => removeTeamMember(i)} className="hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tecnologías */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-theme-secondary uppercase tracking-wide">Tecnologías</h3>
            <div className="flex gap-2 mb-2">
              <input type="text" value={currentTech}
                onChange={(e) => setCurrentTech(e.target.value)}
                className={inputClass} placeholder="ej. React, Python, Arduino"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())} />
              <button type="button" onClick={addTechnology}
                className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:opacity-90 text-sm font-medium whitespace-nowrap">
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.technologies.map((tech, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                  {tech}
                  <button type="button" onClick={() => removeTechnology(i)} className="hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Enlaces */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-theme-secondary uppercase tracking-wide">Enlaces y Recursos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>URL de Demo</label>
                <input type="url" value={formData.demoUrl}
                  onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                  className={inputClass} placeholder="https://demo.ejemplo.com" />
              </div>
              <div>
                <label className={labelClass}>Repositorio</label>
                <input type="url" value={formData.repositoryUrl}
                  onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
                  className={inputClass} placeholder="https://github.com/usuario/proyecto" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Documentación</label>
              <textarea value={formData.documentation}
                onChange={(e) => setFormData({ ...formData, documentation: e.target.value })}
                className={inputClass + ' h-20 resize-none'}
                placeholder="Enlaces a documentación, papers, etc..." />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2 pb-1 border-t border-theme-border">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-red-500/50 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-bright-blue to-neon-pink py-2.5 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-opacity gradient-button cursor-pointer">
              Crear Proyecto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ViewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: TechProject | null;
}

export function ViewProjectModal({ isOpen, onClose, project }: ViewProjectModalProps) {
  if (!isOpen || !project) return null;

  const statusLabels = { active: 'Activo', completed: 'Completado', paused: 'Pausado', planning: 'Planificación' };
  const priorityLabels = { low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="border border-theme-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-container"
        style={{ backgroundColor: 'var(--modal-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-theme-border sticky top-0 z-10" style={{ backgroundColor: 'var(--modal-bg)' }}>
          <div>
            <h2 className="text-xl font-semibold text-theme-text">{project.title}</h2>
            <p className="text-theme-secondary text-sm">{project.category}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-theme-secondary hover:bg-theme-accent/10 hover:text-theme-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-theme-secondary uppercase tracking-wide mb-2">Descripción</h3>
            <p className="text-theme-text text-sm leading-relaxed">{project.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Estado', value: statusLabels[project.status] },
              { label: 'Prioridad', value: priorityLabels[project.priority] },
              { label: 'Progreso', value: `${project.progress}%` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-theme-border p-3" style={{ backgroundColor: 'var(--modal-inner-bg)' }}>
                <p className="text-xs text-theme-secondary mb-1">{label}</p>
                <p className="text-theme-text font-semibold text-sm">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs text-theme-secondary mb-1">Progreso del Proyecto</p>
            <div className="w-full bg-theme-border/30 rounded-full h-2.5">
              <div className="bg-gradient-to-r from-neon-pink to-bright-blue h-2.5 rounded-full transition-all"
                style={{ width: `${project.progress}%` }} />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-theme-secondary uppercase tracking-wide mb-3">Equipo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-theme-border p-3" style={{ backgroundColor: 'var(--modal-inner-bg)' }}>
                <p className="text-xs text-theme-secondary mb-1">Team Lead</p>
                <p className="text-theme-text font-medium text-sm">{project.teamLead}</p>
              </div>
              <div className="rounded-xl border border-theme-border p-3" style={{ backgroundColor: 'var(--modal-inner-bg)' }}>
                <p className="text-xs text-theme-secondary mb-1">Miembros</p>
                <p className="text-theme-text text-sm">{project.teamMembers.join(', ') || 'Sin miembros asignados'}</p>
              </div>
            </div>
          </div>

          {project.technologies.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-theme-secondary uppercase tracking-wide mb-3">Tecnologías</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">{tech}</span>
                ))}
              </div>
            </div>
          )}

          {project.objectives.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-theme-secondary uppercase tracking-wide mb-3">Objetivos</h3>
              <ul className="space-y-2">
                {project.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Target className="w-4 h-4 text-theme-accent mt-0.5 flex-shrink-0" />
                    <span className="text-theme-secondary">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(project.demoUrl || project.repositoryUrl) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.demoUrl && (
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm">
                  <LinkIcon className="w-4 h-4" /> Ver Demo
                </a>
              )}
              {project.repositoryUrl && (
                <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors text-sm">
                  <LinkIcon className="w-4 h-4" /> Ver Repositorio
                </a>
              )}
            </div>
          )}

          {project.documentation && (
            <div>
              <h3 className="text-xs font-semibold text-theme-secondary uppercase tracking-wide mb-2">Documentación</h3>
              <p className="text-theme-secondary text-sm">{project.documentation}</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 border-t border-theme-border pt-4">
          <div className="flex justify-end">
            <button onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-bright-blue to-neon-pink text-white text-sm font-bold hover:opacity-90 transition-opacity gradient-button">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}