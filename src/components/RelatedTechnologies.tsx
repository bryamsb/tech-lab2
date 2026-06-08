'use client';

import Link from 'next/link';
import { useTechnologies } from '@/hooks/useTechnologies';
import { Zap, ExternalLink } from 'lucide-react';

interface RelatedTechnologiesProps {
  projectId: string;
}

export default function RelatedTechnologies({
  projectId,
}: RelatedTechnologiesProps) {
  const { getTechnologiesByProject } = useTechnologies();
  const relatedTechnologies = getTechnologiesByProject(projectId);

  if (relatedTechnologies.length === 0) {
    return null;
  }

  return (
    <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
      <h2 className="text-xl font-bold text-theme-text mb-4 flex items-center gap-2">
        <Zap className="text-theme-accent" size={24} />
        Tecnologías Vinculadas
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {relatedTechnologies.map((tech) => (
          <Link
            key={tech.id}
            href={`/technologies/${tech.id}`}
            className="p-4 bg-theme-background rounded-lg border border-theme-border hover:border-theme-accent/50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`text-2xl p-2 rounded-lg bg-gradient-to-r ${tech.gradient} text-white`}
              >
                {tech.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-theme-text group-hover:text-theme-accent transition-colors">
                  {tech.name}
                </h3>
                <div className="flex items-center gap-1 text-theme-secondary text-sm">
                  <span>Ver tecnología</span>
                  <ExternalLink size={12} />
                </div>
              </div>
            </div>
            <p className="text-sm text-theme-secondary line-clamp-2">
              {tech.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
