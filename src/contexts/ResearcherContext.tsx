'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Researcher {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  position: string;
  department: string;
  specializations: string[];
  biography: string;
  academicLevel:
    | 'undergraduate'
    | 'bachelor'
    | 'master'
    | 'phd'
    | 'postdoc'
    | 'professor';
  status: 'active' | 'inactive' | 'alumni' | 'visiting';
  joinDate: string;
  endDate?: string;

  // Información de contacto
  phone?: string;
  linkedIn?: string;
  researchGate?: string;
  orcid?: string;
  personalWebsite?: string;

  // Información académica
  university?: string;
  degree?: string;
  researchInterests: string[];
  publications: string[];
  achievements: string[];

  // Participación en proyectos
  currentProjects: string[]; // IDs de proyectos actuales
  pastProjects: string[]; // IDs de proyectos pasados
  projectRoles: { [projectId: string]: string }; // Rol en cada proyecto

  // Estadísticas
  projectsCompleted: number;
  publicationsCount: number;
  yearsExperience: number;

  // Metadatos
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface ResearcherContextType {
  researchers: Researcher[];
  addResearcher: (
    researcher: Omit<Researcher, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  updateResearcher: (id: string, updates: Partial<Researcher>) => void;
  deleteResearcher: (id: string) => void;
  getResearcher: (id: string) => Researcher | undefined;
  getResearchersByProject: (projectId: string) => Researcher[];
  searchResearchers: (query: string) => Researcher[];
  filterByDepartment: (department: string) => Researcher[];
  filterByStatus: (status: Researcher['status']) => Researcher[];
  filterByAcademicLevel: (level: Researcher['academicLevel']) => Researcher[];
  filterBySpecialization: (specialization: string) => Researcher[];
  isLoading: boolean;
}

const ResearcherContext = createContext<ResearcherContextType | undefined>(
  undefined
);

// Investigadores de demostración
const INITIAL_RESEARCHERS: Researcher[] = [
  {
    id: '1',
    name: 'Eduardo Guevara Lázaro',
    email: 'eduardo.guevara.l@uni.edu.pe',
    avatar:
      'https://media.licdn.com/dms/image/v2/D4E03AQFpAYoEscpQdA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1672683113167?e=1762992000&v=beta&t=ljLjvnPW8tKPSC8bY5ECvmpOHwJWU28-LwmUcoBABIk',
    position: 'Estudiante de Ingeniería Electrónica',
    department: 'Ingeniería Electrónica',
    specializations: [
      'Sistemas Embebidos',
      'Microcontroladores',
      'IoT',
      'Electrónica Digital',
    ],
    biography:
      'Estudiante del 10mo ciclo de Ingeniería Electrónica en la Universidad Nacional de Ingeniería. Apasionado por la tecnología, sistemas embebidos y el Internet de las Cosas. Enfocado en el desarrollo de soluciones innovadoras que integren hardware y software.',
    academicLevel: 'undergraduate',
    status: 'active',
    joinDate: '2024-03-01',
    phone: '+51 999 000 000',
    linkedIn: 'https://www.linkedin.com/in/jhunior-guevara-889483162/',
    researchGate: '',
    orcid: '',
    university: 'Universidad Nacional de Ingeniería',
    degree: 'Ingeniería Electrónica (en curso)',
    researchInterests: [
      'Sistemas Embebidos',
      'Internet of Things (IoT)',
      'Automatización Industrial',
      'Microcontroladores y Microprocesadores',
      'Electrónica de Potencia',
    ],
    publications: [
      // Publicaciones futuras del estudiante
    ],
    achievements: [
      'Estudiante destacado del 10mo ciclo',
      'Participante en proyectos de investigación estudiantil',
      'Miembro activo del Tech Lab UNI',
    ],
    currentProjects: ['1'], // Smart Parking System
    pastProjects: [],
    projectRoles: {
      '1': 'Desarrollador de Hardware',
    },
    projectsCompleted: 2,
    publicationsCount: 0,
    yearsExperience: 2,
    createdAt: '2024-03-01T08:00:00Z',
    updatedAt: '2024-12-20T10:30:00Z',
    createdBy: 'admin',
  },
  {
    id: '2',
    name: 'Dra. Ana Silva',
    email: 'ana.silva@techlab.uni.edu.pe',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    position: 'Investigadora Principal',
    department: 'Computer Science',
    specializations: ['Deep Learning', 'Computer Vision', 'Neural Networks'],
    biography:
      'Doctora en Computer Science especializada en redes neuronales profundas y visión por computadora. Líder en proyectos de reconocimiento de imágenes.',
    academicLevel: 'phd',
    status: 'active',
    joinDate: '2021-08-01',
    phone: '+51 988 777 666',
    linkedIn: 'https://linkedin.com/in/ana-silva-ai',
    researchGate: 'https://researchgate.net/profile/Ana-Silva',
    orcid: '0000-0000-0000-0002',
    university: 'MIT',
    degree: 'PhD en Computer Science',
    researchInterests: [
      'Deep Learning',
      'Computer Vision',
      'Medical Image Analysis',
      'Autonomous Systems',
    ],
    publications: [
      'Advanced CNN Architectures for Medical Imaging (2024)',
      'Real-time Object Detection in Industrial Environments (2023)',
      'Transfer Learning in Computer Vision Applications (2022)',
    ],
    achievements: [
      'Google Research Award 2023',
      'Best PhD Thesis MIT 2021',
      '10+ papers en revistas Q1',
    ],
    currentProjects: ['2'], // AI Image Recognition Lab
    pastProjects: [],
    projectRoles: {
      '2': 'Investigadora Principal',
    },
    projectsCompleted: 12,
    publicationsCount: 25,
    yearsExperience: 8,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-12-20T10:30:00Z',
    createdBy: 'admin',
  },
  {
    id: '3',
    name: 'Carlos López',
    email: 'carlos.lopez@techlab.uni.edu.pe',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    position: 'Desarrollador Senior',
    department: 'Ingeniería de Software',
    specializations: ['Frontend Development', 'UX/UI Design', 'React'],
    biography:
      'Ingeniero de software especializado en desarrollo frontend y experiencia de usuario. Experto en tecnologías web modernas.',
    academicLevel: 'bachelor',
    status: 'active',
    joinDate: '2023-02-01',
    phone: '+51 977 666 555',
    linkedIn: 'https://linkedin.com/in/carlos-lopez-dev',
    university: 'Universidad San Marcos',
    degree: 'Ingeniería de Software',
    researchInterests: [
      'User Experience Design',
      'Progressive Web Applications',
      'Accessibility in Web Development',
      'Frontend Performance Optimization',
    ],
    publications: [
      'Modern Frontend Architecture Patterns (2024)',
      'Accessibility Guidelines for Web Applications (2023)',
    ],
    achievements: [
      'Hackathon Nacional Primer Lugar 2023',
      'Certificación Google UX Design',
      'Contribuidor Open Source React',
    ],
    currentProjects: ['1'], // Smart Parking System
    pastProjects: [],
    projectRoles: {
      '1': 'Frontend Developer',
    },
    projectsCompleted: 5,
    publicationsCount: 8,
    yearsExperience: 4,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-12-20T10:30:00Z',
    createdBy: 'admin',
  },
  {
    id: '4',
    name: 'María Rodríguez',
    email: 'maria.rodriguez@techlab.uni.edu.pe',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    position: 'Investigadora Junior',
    department: 'Ingeniería Electrónica',
    specializations: ['IoT', 'Embedded Systems', 'Sensors'],
    biography:
      'Estudiante de maestría especializada en sistemas embebidos e Internet de las Cosas. Enfocada en desarrollo de sensores inteligentes.',
    academicLevel: 'master',
    status: 'active',
    joinDate: '2023-09-01',
    phone: '+51 966 555 444',
    linkedIn: 'https://linkedin.com/in/maria-rodriguez-iot',
    university: 'Universidad Nacional de Ingeniería',
    degree: 'Maestría en Ingeniería Electrónica (en curso)',
    researchInterests: [
      'Internet of Things',
      'Wireless Sensor Networks',
      'Edge Computing',
      'Smart Environmental Monitoring',
    ],
    publications: [
      'Low-Power IoT Sensors for Smart Cities (2024)',
      'Wireless Communication Protocols Comparison (2023)',
    ],
    achievements: [
      'Beca de Excelencia Académica 2023',
      'Mejor Proyecto de Tesis Pregrado 2022',
      'Certificación Arduino Expert',
    ],
    currentProjects: ['1'], // Smart Parking System
    pastProjects: [],
    projectRoles: {
      '1': 'Hardware Developer',
    },
    projectsCompleted: 3,
    publicationsCount: 4,
    yearsExperience: 2,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-12-20T10:30:00Z',
    createdBy: 'admin',
  },
  {
    id: '5',
    name: 'Pedro Morales',
    email: 'pedro.morales@techlab.uni.edu.pe',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    position: 'Analista de Datos',
    department: 'Data Science',
    specializations: ['Data Analysis', 'Machine Learning', 'Python'],
    biography:
      'Especialista en análisis de datos y machine learning. Experto en extracción de insights de grandes volúmenes de datos.',
    academicLevel: 'master',
    status: 'active',
    joinDate: '2022-11-15',
    phone: '+51 955 444 333',
    linkedIn: 'https://linkedin.com/in/pedro-morales-data',
    university: 'Universidad Católica',
    degree: 'Maestría en Data Science',
    researchInterests: [
      'Big Data Analytics',
      'Predictive Modeling',
      'Data Visualization',
      'Statistical Analysis',
    ],
    publications: [
      'Predictive Analytics in Healthcare Systems (2024)',
      'Data-Driven Decision Making in Smart Cities (2023)',
    ],
    achievements: [
      'Kaggle Competition Winner 2023',
      'Certificación AWS Data Analytics',
      'Databricks Certified Associate',
    ],
    currentProjects: ['2'], // AI Image Recognition Lab
    pastProjects: [],
    projectRoles: {
      '2': 'Data Scientist',
    },
    projectsCompleted: 6,
    publicationsCount: 10,
    yearsExperience: 5,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-12-20T10:30:00Z',
    createdBy: 'admin',
  },
  {
    id: '6',
    name: 'Sofia Blockchain',
    email: 'sofia.crypto@techlab.uni.edu.pe',
    avatar:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    position: 'Especialista en Blockchain',
    department: 'Criptografía Aplicada',
    specializations: ['Blockchain', 'Smart Contracts', 'Cryptocurrency'],
    biography:
      'Experta en tecnologías blockchain y contratos inteligentes. Pionera en aplicaciones descentralizadas para supply chain.',
    academicLevel: 'master',
    status: 'active',
    joinDate: '2024-01-15',
    phone: '+51 944 333 222',
    linkedIn: 'https://linkedin.com/in/sofia-blockchain',
    university: 'Stanford University',
    degree: 'Master en Blockchain Technology',
    researchInterests: [
      'Distributed Ledger Technology',
      'Decentralized Applications',
      'Cryptocurrency Economics',
      'Supply Chain Transparency',
    ],
    publications: [
      'Blockchain Applications in Supply Chain Management (2024)',
      'Smart Contracts Security Analysis (2023)',
    ],
    achievements: [
      'Ethereum Foundation Grant 2024',
      'Blockchain Innovation Award 2023',
      'Solidity Expert Certification',
    ],
    currentProjects: ['3'], // Blockchain Supply Chain
    pastProjects: [],
    projectRoles: {
      '3': 'Blockchain Architect',
    },
    projectsCompleted: 4,
    publicationsCount: 7,
    yearsExperience: 3,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-12-20T10:30:00Z',
    createdBy: 'admin',
  },
];

export function ResearcherProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [researchers, setResearchers] =
    useState<Researcher[]>(INITIAL_RESEARCHERS);
  const [isLoading, setIsLoading] = useState(false);

  const addResearcher = useCallback(
    (newResearcher: Omit<Researcher, 'id' | 'createdAt' | 'updatedAt'>) => {
      setIsLoading(true);
      setTimeout(() => {
        const id = Date.now().toString();
        const now = new Date().toISOString();
        setResearchers((prev) => [
          ...prev,
          {
            ...newResearcher,
            id,
            createdAt: now,
            updatedAt: now,
          },
        ]);
        setIsLoading(false);
      }, 500);
    },
    []
  );

  const updateResearcher = useCallback(
    (id: string, updates: Partial<Researcher>) => {
      setIsLoading(true);
      setTimeout(() => {
        setResearchers((prev) =>
          prev.map((researcher) =>
            researcher.id === id
              ? {
                  ...researcher,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : researcher
          )
        );
        setIsLoading(false);
      }, 300);
    },
    []
  );

  const deleteResearcher = useCallback((id: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setResearchers((prev) =>
        prev.filter((researcher) => researcher.id !== id)
      );
      setIsLoading(false);
    }, 200);
  }, []);

  const getResearcher = useCallback(
    (id: string) => {
      return researchers.find((researcher) => researcher.id === id);
    },
    [researchers]
  );

  const getResearchersByProject = useCallback(
    (projectId: string) => {
      return researchers.filter(
        (researcher) =>
          researcher.currentProjects.includes(projectId) ||
          researcher.pastProjects.includes(projectId)
      );
    },
    [researchers]
  );

  const searchResearchers = useCallback(
    (query: string) => {
      if (!query.trim()) return researchers;

      const lowerQuery = query.toLowerCase();
      return researchers.filter(
        (researcher) =>
          researcher.name.toLowerCase().includes(lowerQuery) ||
          researcher.email.toLowerCase().includes(lowerQuery) ||
          researcher.position.toLowerCase().includes(lowerQuery) ||
          researcher.department.toLowerCase().includes(lowerQuery) ||
          researcher.specializations.some((spec) =>
            spec.toLowerCase().includes(lowerQuery)
          ) ||
          researcher.researchInterests.some((interest) =>
            interest.toLowerCase().includes(lowerQuery)
          )
      );
    },
    [researchers]
  );

  const filterByDepartment = useCallback(
    (department: string) => {
      if (!department) return researchers;
      return researchers.filter(
        (researcher) => researcher.department === department
      );
    },
    [researchers]
  );

  const filterByStatus = useCallback(
    (status: Researcher['status']) => {
      return researchers.filter((researcher) => researcher.status === status);
    },
    [researchers]
  );

  const filterByAcademicLevel = useCallback(
    (level: Researcher['academicLevel']) => {
      return researchers.filter(
        (researcher) => researcher.academicLevel === level
      );
    },
    [researchers]
  );

  const filterBySpecialization = useCallback(
    (specialization: string) => {
      if (!specialization) return researchers;
      return researchers.filter((researcher) =>
        researcher.specializations.includes(specialization)
      );
    },
    [researchers]
  );

  const value: ResearcherContextType = {
    researchers,
    addResearcher,
    updateResearcher,
    deleteResearcher,
    getResearcher,
    getResearchersByProject,
    searchResearchers,
    filterByDepartment,
    filterByStatus,
    filterByAcademicLevel,
    filterBySpecialization,
    isLoading,
  };

  return (
    <ResearcherContext.Provider value={value}>
      {children}
    </ResearcherContext.Provider>
  );
}

export function useResearchers() {
  const context = useContext(ResearcherContext);
  if (context === undefined) {
    throw new Error('useResearchers must be used within a ResearcherProvider');
  }
  return context;
}
