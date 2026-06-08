'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Researcher } from '@/contexts/ResearcherContext';
import { useAuth } from '@/contexts/AuthContextLegacy';

// Modal para editar investigador
interface EditResearcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (researcher: Researcher) => void;
  researcher: Researcher | null;
}

export function EditResearcherModal({
  isOpen,
  onClose,
  onEdit,
  researcher,
}: EditResearcherModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Researcher>({
    id: researcher?.id || '',
    name: researcher?.name || '',
    email: researcher?.email || '',
    avatar: researcher?.avatar || '',
    position: researcher?.position || '',
    department: researcher?.department || '',
    specializations: researcher?.specializations || [],
    biography: researcher?.biography || '',
    academicLevel: researcher?.academicLevel || 'bachelor',
    status: researcher?.status || 'active',
    joinDate: researcher?.joinDate || new Date().toISOString().split('T')[0],
    endDate: researcher?.endDate || '',
    phone: researcher?.phone || '',
    linkedIn: researcher?.linkedIn || '',
    researchGate: researcher?.researchGate || '',
    orcid: researcher?.orcid || '',
    personalWebsite: researcher?.personalWebsite || '',
    university: researcher?.university || '',
    degree: researcher?.degree || '',
    researchInterests: researcher?.researchInterests || [],
    publications: researcher?.publications || [],
    achievements: researcher?.achievements || [],
    currentProjects: researcher?.currentProjects || [],
    pastProjects: researcher?.pastProjects || [],
    projectRoles: researcher?.projectRoles || {},
    projectsCompleted: researcher?.projectsCompleted || 0,
    publicationsCount: researcher?.publicationsCount || 0,
    yearsExperience: researcher?.yearsExperience || 0,
    createdAt: researcher?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: researcher?.createdBy || user?.username || 'admin',
  });

  const [currentSpecialization, setCurrentSpecialization] = useState('');
  const [currentInterest, setCurrentInterest] = useState('');
  const [currentPublication, setCurrentPublication] = useState('');
  const [currentAchievement, setCurrentAchievement] = useState('');

  // Actualizar formData cuando cambie el researcher
  useState(() => {
    if (researcher) {
      setFormData(researcher);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.name &&
      formData.email &&
      formData.position &&
      formData.department
    ) {
      // Calcular estadísticas automáticamente
      const updatedData = {
        ...formData,
        publicationsCount: formData.publications.length,
        yearsExperience: formData.joinDate
          ? new Date().getFullYear() - new Date(formData.joinDate).getFullYear()
          : 0,
        updatedAt: new Date().toISOString(),
      };
      onEdit(updatedData);
      onClose();
    }
  };

  const addSpecialization = () => {
    if (
      currentSpecialization.trim() &&
      !formData.specializations.includes(currentSpecialization.trim())
    ) {
      setFormData({
        ...formData,
        specializations: [
          ...formData.specializations,
          currentSpecialization.trim(),
        ],
      });
      setCurrentSpecialization('');
    }
  };

  const removeSpecialization = (index: number) => {
    setFormData({
      ...formData,
      specializations: formData.specializations.filter((_, i) => i !== index),
    });
  };

  const addInterest = () => {
    if (
      currentInterest.trim() &&
      !formData.researchInterests.includes(currentInterest.trim())
    ) {
      setFormData({
        ...formData,
        researchInterests: [
          ...formData.researchInterests,
          currentInterest.trim(),
        ],
      });
      setCurrentInterest('');
    }
  };

  const removeInterest = (index: number) => {
    setFormData({
      ...formData,
      researchInterests: formData.researchInterests.filter(
        (_, i) => i !== index
      ),
    });
  };

  const addPublication = () => {
    if (currentPublication.trim()) {
      setFormData({
        ...formData,
        publications: [...formData.publications, currentPublication.trim()],
      });
      setCurrentPublication('');
    }
  };

  const removePublication = (index: number) => {
    setFormData({
      ...formData,
      publications: formData.publications.filter((_, i) => i !== index),
    });
  };

  const addAchievement = () => {
    if (currentAchievement.trim()) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, currentAchievement.trim()],
      });
      setCurrentAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index),
    });
  };

  if (!isOpen || !researcher) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-sm modal-container modal-dark-bg">
        <div className="p-6 border-b modal-header flex justify-between items-center">
          <h2 className="text-xl font-semibold modal-text">
            Editar Investigador
          </h2>
          <button
            onClick={onClose}
            className="text-theme-secondary hover:text-theme-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 modal-content">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-theme-text">
              Información Personal
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                  placeholder="Dr. Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                  placeholder="juan.perez@techlab.uni.edu.pe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">
                  Posición *
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                  placeholder="Investigador Principal, Desarrollador Senior, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">
                  Departamento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                  placeholder="Ingeniería de Sistemas, Computer Science, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">
                  Nivel Académico
                </label>
                <select
                  value={formData.academicLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      academicLevel: e.target
                        .value as Researcher['academicLevel'],
                    })
                  }
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                >
                  <option value="undergraduate">Pregrado</option>
                  <option value="bachelor">Licenciado</option>
                  <option value="master">Magíster</option>
                  <option value="phd">Doctor</option>
                  <option value="postdoc">Postdoc</option>
                  <option value="professor">Profesor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as Researcher['status'],
                    })
                  }
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="alumni">Alumni</option>
                  <option value="visiting">Visitante</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-text mb-1">
                Biografía
              </label>
              <textarea
                value={formData.biography}
                onChange={(e) =>
                  setFormData({ ...formData, biography: e.target.value })
                }
                className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text h-20"
                placeholder="Breve descripción profesional..."
              />
            </div>
          </div>

          {/* Especializaciones */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-theme-text">
              Especializaciones
            </h3>

            <div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentSpecialization}
                  onChange={(e) => setCurrentSpecialization(e.target.value)}
                  className="flex-1 px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                  placeholder="ej. Machine Learning, IoT, Blockchain"
                  onKeyPress={(e) =>
                    e.key === 'Enter' &&
                    (e.preventDefault(), addSpecialization())
                  }
                />
                <button
                  type="button"
                  onClick={addSpecialization}
                  className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialization(index)}
                      className="text-blue-400 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Intereses de Investigación */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-theme-text">
              Intereses de Investigación
            </h3>

            <div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentInterest}
                  onChange={(e) => setCurrentInterest(e.target.value)}
                  className="flex-1 px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                  placeholder="ej. Inteligencia Artificial, Robótica, Ciberseguridad"
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addInterest())
                  }
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.researchInterests.map((interest, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => removeInterest(index)}
                      className="text-green-400 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Publicaciones */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-theme-text">
              Publicaciones
            </h3>

            <div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentPublication}
                  onChange={(e) => setCurrentPublication(e.target.value)}
                  className="flex-1 px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                  placeholder="Título de la publicación, revista, año..."
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addPublication())
                  }
                />
                <button
                  type="button"
                  onClick={addPublication}
                  className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {formData.publications.map((pub, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-theme-background rounded-lg"
                  >
                    <span className="flex-1 text-theme-text text-sm">
                      {pub}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePublication(index)}
                      className="text-theme-secondary hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Logros */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-theme-text">
              Logros y Reconocimientos
            </h3>

            <div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentAchievement}
                  onChange={(e) => setCurrentAchievement(e.target.value)}
                  className="flex-1 px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                  placeholder="Premio, beca, reconocimiento..."
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addAchievement())
                  }
                />
                <button
                  type="button"
                  onClick={addAchievement}
                  className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {formData.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-theme-background rounded-lg"
                  >
                    <span className="flex-1 text-theme-text text-sm">
                      🏆 {achievement}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      className="text-theme-secondary hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-theme-text">
              Información de Contacto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                  placeholder="+51 999 888 777"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={formData.linkedIn}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedIn: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                  placeholder="https://linkedin.com/in/usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">
                  ResearchGate
                </label>
                <input
                  type="url"
                  value={formData.researchGate}
                  onChange={(e) =>
                    setFormData({ ...formData, researchGate: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                  placeholder="https://researchgate.net/profile/usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">
                  Sitio Web Personal
                </label>
                <input
                  type="url"
                  value={formData.personalWebsite}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      personalWebsite: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
                  placeholder="https://miwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-theme-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-theme-secondary hover:text-theme-text transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-neon-pink to-bright-blue text-white rounded-lg hover:opacity-90 transition-opacity gradient-button"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
