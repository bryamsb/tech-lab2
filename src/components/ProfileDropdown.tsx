'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Pencil, LogOut, User } from 'lucide-react';

interface Props {
  displayName: string;
  avatarUrl: string;
  email: string;
  onLogout: () => void;
}

interface ProfileFormData {
  full_name: string;
  avatar_url: string;
  phone: string;
  linkedin_url: string;
  bio: string;
  academic_level: string;
  university: string;
  degree: string;
}

export default function ProfileDropdown({ displayName, avatarUrl, email, onLogout }: Props) {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    full_name: '',
    avatar_url: '',
    phone: '',
    linkedin_url: '',
    bio: '',
    academic_level: 'bachelor',
    university: 'Universidad Nacional de Ingeniería',
    degree: '',
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
  if (showModal) {
    document.documentElement.style.overflow = 'hidden';
  } else {
    document.documentElement.style.overflow = '';
  }
  return () => { document.documentElement.style.overflow = ''; };
}, [showModal]);

  const showMenu = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setShowDropdown(true);
  };

  const hideMenu = () => {
    hideTimeout.current = setTimeout(() => setShowDropdown(false), 150);
  };

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('user_profiles')
      .select('full_name, avatar_url, phone, linkedin_url, bio, academic_level, university, degree')
      .eq('id', user.id)
      .single();
    if (data) {
      setProfileData({
        full_name: data.full_name ?? '',
        avatar_url: data.avatar_url ?? '',
        phone: data.phone ?? '',
        linkedin_url: data.linkedin_url ?? '',
        bio: data.bio ?? '',
        academic_level: data.academic_level ?? 'bachelor',
        university: data.university ?? 'Universidad Nacional de Ingeniería',
        degree: data.degree ?? '',
      });
    }
    setLoading(false);
  };

  const handleOpenModal = () => {
    setShowDropdown(false);
    setMessage(null);
    fetchProfile();
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from('user_profiles')
      .update({
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        phone: profileData.phone,
        linkedin_url: profileData.linkedin_url,
        bio: profileData.bio,
        academic_level: profileData.academic_level,
        university: profileData.university,
        degree: profileData.degree,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
  setMessage({ type: 'error', text: 'Error al guardar: ' + error.message });
} else {
  setMessage({ type: 'success', text: '¡Perfil actualizado correctamente!' });
  setTimeout(() => {
  setShowModal(false);
  window.dispatchEvent(new Event('profile-updated'));
}, 900);
}
    setSaving(false);
  };

  return (
    <>
      {/* ── Wrapper que activa el hover sobre avatar + nombre + logout ── */}
      <div
        ref={wrapperRef}
        className="relative flex items-center gap-2 text-theme-text cursor-pointer"
        onMouseEnter={showMenu}
        onMouseLeave={hideMenu}
      >
        {/* Avatar */}
        <div className="relative">
          {avatarUrl ? (
  <img
    src={avatarUrl}
    alt={displayName}
    width={32}
    height={32}
    className="rounded-full object-cover w-8 h-8"
    onError={(e) => {
      (e.target as HTMLImageElement).style.display = 'none';
    }}
  />
) : (
  <User size={20} />
)}
        </div>

        {/* Nombre */}
        <div className="hidden md:block">
          <span className="text-sm font-medium">{displayName}</span>
        </div>

        {/* Logout icon (decorativo, el click real está en el dropdown) */}
        <LogOut className="hidden md:block w-4 h-4 text-theme-secondary" />

        {/* ── Dropdown panel ── */}
        {showDropdown && (
          <div
            className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-theme-border shadow-2xl z-[100] overflow-hidden"
style={{ backgroundColor: 'var(--dropdown-bg)' }}
            onMouseEnter={showMenu}
            onMouseLeave={hideMenu}
          >
            {/* Email */}
            <div className="px-4 py-2.5 border-b border-theme-border">
              <p className="text-xs font-medium text-theme-text truncate">{displayName}</p>
              <p className="text-xs text-theme-secondary truncate">{email}</p>
            </div>


            {user && (
  <a
    href={`/researchers/${user.id}`}
    className="w-full text-left px-4 py-2.5 text-sm text-theme-text hover:bg-orange-500/10 hover:text-orange-400 transition-colors flex items-center gap-2.5 cursor-pointer"

  >
    <User className="w-4 h-4 shrink-0" />
    Ver Página Perfil
  </a>
)}

            {/* Editar Perfil */}
          
            <button
              onClick={handleOpenModal}
              className="w-full text-left px-4 py-2.5 text-sm text-theme-text hover:bg-orange-500/10 hover:text-orange-400 transition-colors flex items-center gap-2.5 cursor-pointer"

            >
              <Pencil className="w-4 h-4 shrink-0" />
              Editar Perfil
            </button>

            {/* Cerrar sesión */}
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-theme-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-2.5 cursor-pointer"

            >
              <LogOut className="w-4 h-4 shrink-0" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      {/* ── Modal via portal ── */}
      {showModal && typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <div
              className="border border-theme-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto modal-no-scrollbar"

style={{ backgroundColor: 'var(--modal-bg)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header modal */}
              <div 
              className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-theme-border sticky top-0 z-10"
style={{ backgroundColor: 'var(--modal-bg)' }}>
                <div>
                  <h2 className="text-xl font-semibold text-theme-text">Editar Perfil</h2>
                  <p className="text-sm text-theme-secondary mt-0.5">{email}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-theme-secondary hover:bg-theme-accent/10 hover:text-theme-text transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-theme-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
                  <Field label="Nombre completo">
                    <input name="full_name" value={profileData.full_name} onChange={handleChange}
                      placeholder="Tu nombre completo" className={inputClass} />
                  </Field>
                  <Field label="URL de avatar">
                    <input name="avatar_url" value={profileData.avatar_url} onChange={handleChange}
                      placeholder="https://..." className={inputClass} />
                  </Field>
                  <Field label="Nivel académico">
                    <select name="academic_level" value={profileData.academic_level} onChange={handleChange} className={inputClass}>
                      <option value="student">Estudiante</option>
                      <option value="technician">Técnico</option>
                      <option value="bachelor">Licenciado / Bachiller</option>
                      <option value="master">Maestría</option>
                      <option value="phd">Doctorado</option>
                      
                      
                    </select>
                  </Field>
                  <Field label="Universidad">
                    <input name="university" value={profileData.university} onChange={handleChange}
                      placeholder="Nombre de la universidad" className={inputClass} />
                  </Field>
                  <Field label="Carrera / Grado">
                    <input name="degree" value={profileData.degree} onChange={handleChange}
                      placeholder="Ej: Ingeniería de Sistemas" className={inputClass} />
                  </Field>
                  <Field label="Teléfono">
                    <input name="phone" value={profileData.phone} onChange={handleChange}
                      placeholder="+51 999 999 999" className={inputClass} />
                  </Field>
                  <Field label="LinkedIn URL">
                    <input name="linkedin_url" value={profileData.linkedin_url} onChange={handleChange}
                      placeholder="https://linkedin.com/in/..." className={inputClass} />
                  </Field>
                  <Field label="Biografía">
                    <textarea name="bio" value={profileData.bio} onChange={handleChange}
                      rows={3} placeholder="Cuéntanos sobre ti..."
                      className={inputClass + ' resize-none'} />
                  </Field>

                  {message && (
                    <div className={`rounded-lg px-4 py-3 text-sm font-medium border ${
                      message.type === 'success'
                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2 pb-1">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-red-500/50 text-sm font-medium transition-colors text-red-400 hover:bg-red-500/10 cursor-pointer"


>
                      Cancelar
                    </button>
                    <button type="submit" disabled={saving}
                      className="rounded-md bg-gradient-to-r from-bright-blue to-neon-pink px-8 py-3 text-lg font-bold text-white shadow-lg shadow-bright-blue/40 transition-all hover:scale-105 hover:shadow-bright-blue disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"

>
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Guardando...
                        </>
                      ) : 'Guardar cambios'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )
      }
    </>
  );
}

const inputClass =
  'w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg hover:border-theme-accent/40';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-theme-secondary uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
