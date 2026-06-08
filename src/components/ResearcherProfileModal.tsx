'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Mail,
  Linkedin,
  ExternalLink,
  GraduationCap,
  Target,
  BookOpen,
  Award,
  Calendar,
  Building2,
  MessageCircle,
  User,
} from 'lucide-react';

import type { SupabaseResearcher } from '@/hooks/useSupabaseResearchers';

interface ResearcherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  researcher: SupabaseResearcher | null;
}

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

const statusLabels: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  alumni: 'Alumni',
  visiting: 'Visitante',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  inactive: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  alumni: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  visiting: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
};

export default function ResearcherProfileModal({
  isOpen,
  onClose,
  researcher,
}: ResearcherProfileModalProps) {

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.documentElement.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.documentElement.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !researcher) return null;

  const phoneDigits = (researcher.phone || '').replace(/\D/g, '');

  const whatsappLink = phoneDigits
    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
        `Hola ${researcher.name}, te contacto desde Tech Lab.`,
      )}`
    : '';

  const allProjects = [
    ...(researcher.current_projects || []),
    ...(researcher.past_projects || []),
  ].filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      // className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"

    >
      <div
  className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-theme-border modal-no-scrollbar"
  style={{ backgroundColor: 'var(--modal-bg)' }}
>

        {/* top gradient */}
        <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-400" />

        {/* HEADER */}
        <div className="relative px-6 pt-6 pb-4">

          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-theme-secondary hover:bg-theme-secondary/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-5">

            {/* Avatar */}
            <div className="relative flex-shrink-0">

              {researcher.avatar_url ? (
  <img
    src={researcher.avatar_url}
    alt={researcher.name}
    width={80}
    height={80}
    className="rounded-full object-cover w-20 h-20"
    onError={(e) => {
      (e.target as HTMLImageElement).style.display = 'none';
    }}
  />
) : (
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-fuchsia-500/30 bg-fuchsia-500/10">
                  <User className="w-8 h-8 text-fuchsia-500" />
                </div>
              )}

              <span
                className={`absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  statusColors[researcher.status] || statusColors.active
                }`}
              >
                {statusLabels[researcher.status] || researcher.status}
              </span>

            </div>

            {/* INFO */}
            <div className="flex-1 min-w-0 pr-8">

              <h2 className="text-xl font-bold text-theme-text">
                {researcher.name}
              </h2>

              <p className="text-sm font-medium text-fuchsia-500">
                {researcher.position}
              </p>

              <div className="flex items-center gap-1.5 mt-1 text-theme-secondary">
                <Building2 className="w-3.5 h-3.5" />
                <span className="text-xs">{researcher.department}</span>
              </div>

              {researcher.university && (
                <div className="flex items-center gap-1.5 text-theme-secondary">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span className="text-xs">{researcher.university}</span>
                </div>
              )}

              <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-medium border border-cyan-400/40 text-cyan-500 bg-cyan-500/10">
                <GraduationCap className="w-3 h-3" />
                {academicLevelLabels[researcher.academic_level] ||
                  researcher.academic_level}
              </span>

            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-3 mt-5 p-3 rounded-xl border border-theme-border bg-theme-bg">

            {[
              { label: 'Proyectos', value: allProjects.length },
              { label: 'Publicaciones', value: researcher.publications_count },
              { label: 'Años Exp.', value: researcher.years_experience },
            ].map(({ label, value }) => (
              <div key={label} className="text-center py-1">

                <div className="text-2xl font-bold text-theme-text">
                  {value}
                </div>

                <div className="text-xs text-theme-secondary">
                  {label}
                </div>

              </div>
            ))}

          </div>
        </div>

        <div className="mx-6 h-px bg-theme-border" />

        {/* BODY */}
        <div className="px-6 py-4 space-y-5">

          {researcher.biography && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-theme-secondary mb-2">
                Sobre mí
              </h3>

              <p className="text-sm text-theme-text">
                {researcher.biography}
              </p>
            </div>
          )}

          {researcher.research_interests?.length > 0 && (
            <div>

              <h3 className="text-xs font-semibold uppercase tracking-widest text-theme-secondary mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Áreas de Investigación
              </h3>

              <div className="flex flex-wrap gap-2">
                {researcher.research_interests.map((interest, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-500"
                  >
                    {interest}
                  </span>
                ))}
              </div>

            </div>
          )}

          {allProjects.length > 0 && (
            <div>

              <h3 className="text-xs font-semibold uppercase tracking-widest text-theme-secondary mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Proyectos
              </h3>

              <div className="space-y-2">

                {allProjects.map((project) => (

                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-theme-border bg-theme-bg hover:border-cyan-400/40 hover:bg-cyan-400/5 transition"
                  >

                    <span className="text-sm text-theme-text">
                      {project.title}
                    </span>

                    <ExternalLink className="w-3.5 h-3.5 text-theme-secondary group-hover:text-cyan-400" />

                  </Link>

                ))}

              </div>

            </div>
          )}

          {researcher.join_date && (
            <div className="flex items-center gap-2 text-xs text-theme-secondary">
              <Calendar className="w-3.5 h-3.5" />
              Miembro desde{' '}
              {new Date(researcher.join_date).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
              })}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 flex flex-wrap items-center gap-2 border-t border-theme-border">

          {researcher.email && (
            <a
              href={`mailto:${researcher.email}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20"
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </a>
          )}

          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
          )}

          {researcher.linkedin_url && (
            <a
              href={researcher.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-500/10 border border-sky-500/20 text-sky-500 hover:bg-sky-500/20"
            >
              <Linkedin className="w-3.5 h-3.5" />
              LinkedIn
            </a>
          )}

          <Link
            href={`/researchers/${researcher.id}`}
            onClick={onClose}
            className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-fuchsia-500/20 to-cyan-400/20 border border-fuchsia-500/30 text-theme-text hover:opacity-80"
          >
            <User className="w-3.5 h-3.5" />
            Ver perfil completo
          </Link>

        </div>

      </div>
    </div>
  );
}