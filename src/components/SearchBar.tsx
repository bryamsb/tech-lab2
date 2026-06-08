 'use client';

import React from 'react';
import { Search } from 'lucide-react';

type Props = {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  locationQuery: string;
  setLocationQuery: (v: string) => void;
  availableOnly: boolean;
  setAvailableOnly: (v: boolean) => void;
};

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  locationQuery,
  setLocationQuery,
  availableOnly,
  setAvailableOnly,
}: Props) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-4">
      <div className="flex-1 min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-secondary w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar equipos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              title="Limpiar búsqueda"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-theme-secondary hover:text-theme-text"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Ubicación"
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          className="px-3 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
        />

        <label className="inline-flex items-center gap-2 text-theme-secondary">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="accent-theme-accent"
          />
          <span className="text-theme-text">Solo disponibles</span>
        </label>
      </div>
    </div>
  );
}
