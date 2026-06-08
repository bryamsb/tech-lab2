'use client';

import { useState } from 'react';
import { X, User, Link as LinkIcon, Plus } from 'lucide-react';
import Image from 'next/image';
import { Researcher } from '@/contexts/ResearcherContext';
import { useAuth } from '@/contexts/AuthContextLegacy';

// Modal para agregar investigador
interface AddResearcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    researcher: Omit<Researcher, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
}

export function AddResearcherModal({
  isOpen,
  onClose,
  onAdd,
}: AddResearcherModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
    position: '',
    department: '',
    specializations: [] as string[],
    biography: '',
    academicLevel: 'bachelor' as Researcher['academicLevel'],
    status: 'active' as Researcher['status'],
    joinDate: new Date().toISOString().split('T')[0],
    endDate: '',
    phone: '',
    linkedIn: '',
    researchGate: '',
    orcid: '',
    personalWebsite: '',
    university: '',
    degree: '',
    researchInterests: [] as string[],
    publications: [] as string[],
    achievements: [] as string[],
    currentProjects: [] as string[],
    pastProjects: [] as string[],
    projectRoles: {} as { [projectId: string]: string },
    projectsCompleted: 0,
    publicationsCount: 0,
    yearsExperience: 0,
    createdBy: user?.username || 'admin',
  });

  const [currentSpecialization, setCurrentSpecialization] = useState('');
  const [currentInterest, setCurrentInterest] = useState('');
  const [currentPublication, setCurrentPublication] = useState('');
  const [currentAchievement, setCurrentAchievement] = useState('');

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
      };
      onAdd(updatedData);
      // Reset form
      setFormData({
        name: '',
        email: '',
        avatar: '',
        position: '',
        department: '',
        specializations: [],
        biography: '',
        academicLevel: 'bachelor',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        endDate: '',
        phone: '',
        linkedIn: '',
        researchGate: '',
        orcid: '',
        personalWebsite: '',
        university: '',
        degree: '',
        researchInterests: [],
        publications: [],
        achievements: [],
        currentProjects: [],
        pastProjects: [],
        projectRoles: {},
        projectsCompleted: 0,
        publicationsCount: 0,
        yearsExperience: 0,
        createdBy: user?.username || 'admin',
      });
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const removeInterest = (index: number) => {
    setFormData({
      ...formData,
      researchInterests: formData.researchInterests.filter(
        (_, i) => i !== index
      ),
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addPublication = () => {
    if (currentPublication.trim()) {
      setFormData({
        ...formData,
        publications: [...formData.publications, currentPublication.trim()],
      });
      setCurrentPublication('');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const removePublication = (index: number) => {
    setFormData({
      ...formData,
      publications: formData.publications.filter((_, i) => i !== index),
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addAchievement = () => {
    if (currentAchievement.trim()) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, currentAchievement.trim()],
      });
      setCurrentAchievement('');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const removeAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-sm modal-container modal-dark-bg">
        <div className="p-6 border-b modal-header flex justify-between items-center">
          <h2 className="text-xl font-semibold modal-text">
            Agregar Nuevo Investigador
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
              Agregar Investigador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal para ver detalles del investigador
interface ViewResearcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  researcher: Researcher | null;
}

export function ViewResearcherModal({
  isOpen,
  onClose,
  researcher,
}: ViewResearcherModalProps) {
  if (!isOpen || !researcher) return null;

  const statusLabels = {
    active: 'Activo',
    inactive: 'Inactivo',
    alumni: 'Alumni',
    visiting: 'Visitante',
  };

  const academicLevelLabels = {
    undergraduate: 'Pregrado',
    bachelor: 'Licenciado',
    master: 'Magíster',
    phd: 'Doctor',
    postdoc: 'Postdoc',
    professor: 'Profesor',
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-sm modal-container modal-dark-bg">
        <div className="p-6 border-b modal-header flex justify-between items-center">
          <div className="flex items-center gap-4">
            {researcher.avatar ? (
              <Image
                src={researcher.avatar}
                alt={researcher.name}
                width={60}
                height={60}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-15 h-15 rounded-full bg-theme-accent/10 flex items-center justify-center">
                <User className="w-8 h-8 text-theme-accent" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold modal-text">
                {researcher.name}
              </h2>
              <p className="text-theme-secondary text-sm">
                {researcher.position}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-theme-secondary hover:text-theme-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 modal-content">
          {/* Información Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-theme-text mb-3">
                Información Personal
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-theme-secondary text-sm">Email:</span>
                  <div className="text-theme-text">{researcher.email}</div>
                </div>
                <div>
                  <span className="text-theme-secondary text-sm">
                    Departamento:
                  </span>
                  <div className="text-theme-text">{researcher.department}</div>
                </div>
                <div>
                  <span className="text-theme-secondary text-sm">Estado:</span>
                  <div className="text-theme-text">
                    {statusLabels[researcher.status]}
                  </div>
                </div>
                <div>
                  <span className="text-theme-secondary text-sm">
                    Nivel Académico:
                  </span>
                  <div className="text-theme-text">
                    {academicLevelLabels[researcher.academicLevel]}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-theme-text mb-3">
                Estadísticas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-theme-background rounded-lg">
                  <div className="text-xl font-bold text-theme-text">
                    {researcher.projectsCompleted}
                  </div>
                  <div className="text-xs text-theme-secondary">
                    Proyectos Completados
                  </div>
                </div>
                <div className="text-center p-3 bg-theme-background rounded-lg">
                  <div className="text-xl font-bold text-theme-text">
                    {researcher.publicationsCount}
                  </div>
                  <div className="text-xs text-theme-secondary">
                    Publicaciones
                  </div>
                </div>
                <div className="text-center p-3 bg-theme-background rounded-lg">
                  <div className="text-xl font-bold text-theme-text">
                    {researcher.yearsExperience}
                  </div>
                  <div className="text-xs text-theme-secondary">
                    Años Experiencia
                  </div>
                </div>
                <div className="text-center p-3 bg-theme-background rounded-lg">
                  <div className="text-xl font-bold text-theme-text">
                    {researcher.currentProjects.length}
                  </div>
                  <div className="text-xs text-theme-secondary">
                    Proyectos Actuales
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Biografía */}
          {researcher.biography && (
            <div>
              <h3 className="text-lg font-medium text-theme-text mb-3">
                Biografía
              </h3>
              <p className="text-theme-secondary">{researcher.biography}</p>
            </div>
          )}

          {/* Especializaciones */}
          {researcher.specializations.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-theme-text mb-3">
                Especializaciones
              </h3>
              <div className="flex flex-wrap gap-2">
                {researcher.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Intereses de Investigación */}
          {researcher.researchInterests.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-theme-text mb-3">
                Intereses de Investigación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {researcher.researchInterests.map((interest, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-theme-accent rounded-full"></div>
                    <span className="text-theme-secondary text-sm">
                      {interest}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publicaciones */}
          {researcher.publications.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-theme-text mb-3">
                Publicaciones Recientes
              </h3>
              <ul className="space-y-2">
                {researcher.publications.slice(0, 5).map((pub, index) => (
                  <li key={index} className="text-theme-secondary text-sm">
                    • {pub}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Logros */}
          {researcher.achievements.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-theme-text mb-3">
                Logros Destacados
              </h3>
              <ul className="space-y-2">
                {researcher.achievements.map((achievement, index) => (
                  <li key={index} className="text-theme-secondary text-sm">
                    🏆 {achievement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Enlaces */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {researcher.linkedIn && (
              <a
                href={researcher.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                Ver LinkedIn
              </a>
            )}
            {researcher.researchGate && (
              <a
                href={researcher.researchGate}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                Ver ResearchGate
              </a>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-theme-border">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity gradient-button"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
