'use client';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Header from '@/components/Header';

export default function PublicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pubId = params.id as string;

  const [pub, setPub] = useState<{
    id: string;
    title: string;
    description: string;
    image_url: string;
    image_urls: string[];
    created_at: string;
    user_id: string;
  } | null>(null);

  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [sliding, setSliding] = useState(false);

  useEffect(() => {
    if (!pubId) return;
    supabase
      .from('publications')
      .select('*')
      .eq('id', pubId)
      .single()
      .then(async ({ data }) => {
        if (data) {
          setPub(data);
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', data.user_id)
            .single();
          if (profile) setAuthorName(profile.full_name);
        }
        setLoading(false);
      });
  }, [pubId]);

  useEffect(() => {
    if (!pub) return;
    const urls = (pub.image_urls?.filter(u => u) || []);
    if (!urls.length && pub.image_url) urls.push(pub.image_url);
    if (urls.length <= 1) return;
    const interval = setInterval(() => {
      setSliding(true);
      setTimeout(() => {
        setCurrentImageIdx(prev => (prev + 1) % urls.length);
        setSliding(false);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [pub]);

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-theme-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!pub) {
    return (
      <div className="min-h-screen bg-theme-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-theme-secondary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-theme-text mb-2">Publicación no encontrada</h1>
            <button onClick={() => router.back()}
              className="flex items-center gap-2 text-theme-secondary hover:text-theme-text transition-colors mt-4 mx-auto cursor-pointer">
              <ArrowLeft className="w-4 h-4" />Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fecha = new Date(pub.created_at).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const imageUrls = (pub.image_urls?.filter(u => u) || []);
  if (!imageUrls.length && pub.image_url) imageUrls.push(pub.image_url);

  return (
    <div className="min-h-screen bg-theme-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 pt-20 pb-10">

        <div className="flex items-start justify-between gap-4 mb-8">
          <h1 className="text-4xl font-bold text-theme-text leading-tight">
            {pub.title}
          </h1>
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-theme-secondary hover:text-theme-text transition-colors cursor-pointer text-sm font-medium flex-shrink-0 mt-2">
            <ArrowLeft className="w-4 h-4" />Volver a Página Perfil
          </button>
        </div>

        <div className="bg-theme-card border border-theme-border rounded-2xl p-6">
          {imageUrls.length > 0 && (
            <div
              className="float-right ml-6 mb-4 rounded-2xl border border-theme-border overflow-hidden flex-shrink-0"
              style={{ maxWidth: '45%', width: '380px', marginTop: '10%' }}
            >
              <img
                key={currentImageIdx}
                src={imageUrls[currentImageIdx]}
                alt={pub.title}
                className="w-full object-cover rounded-2xl"
                style={{
                  transition: 'opacity 0.4s ease, transform 0.4s ease',
                  opacity: sliding ? 0 : 1,
                  transform: sliding ? 'translateX(20px)' : 'translateX(0)',
                }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              {imageUrls.length > 1 && (
                <div className="flex justify-center gap-1.5 py-2 bg-theme-card/80">
                  {imageUrls.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentImageIdx ? 'bg-theme-accent w-3' : 'bg-theme-border w-1.5'
                    }`} />
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="text-theme-text leading-relaxed whitespace-pre-wrap">
            {pub.description}
          </p>
          <div className="clear-both" />
          <p className="text-theme-secondary text-sm mt-6 pt-4 border-t border-theme-border">
            Publicado por <span className="text-theme-text font-medium">{authorName || 'X'}</span>, {fecha}
          </p>
        </div>

      </main>
    </div>
  );
}