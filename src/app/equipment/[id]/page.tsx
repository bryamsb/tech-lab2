'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

interface Equipment {
  id: string;
  name: string;
  category: string;
  status: 'Disponible' | 'En Préstamo';
  brand: string;
  imageUrl: string;
  description: string;
  specifications: {
    [key: string]: string;
  };
}

// Datos de equipos (en una app real vendría de una API)
const equipmentData: Equipment[] = [
  {
    id: '1',
    name: 'Microscopio Avanzado',
    category: 'Microscopía',
    status: 'Disponible',
    brand: 'Nikon',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDMwOrDUmgLzAORBcJtc4FPdhlv_TIa6uI4Y0bpsZejlcre5uSCTWjmGPN17Sz7ENJkhQCsbD-8BANQjbvBEMw7jz_rTtZxIRLALDdOKTPRxRH-GGJQ1p-AtiBf1i7KHNPnUOQDaLGuWNg1k4SnS_f3TOYKMc8vBUytYD7TnzWIbuO6-jzRsbE68-JvBOH8-OQIp4f_JN4C2HzSTteSOjttKwSdCIEVzxPNR0G7DCVSWAvLNNewolWMN355V5U4kZPcPCpL131tXowC',
    description:
      'Microscopio óptico avanzado con sistema de iluminación LED y objetivos de alta resolución. Ideal para observaciones detalladas en investigación biológica y análisis de materiales.',
    specifications: {
      Aumentos: '40x - 1000x',
      Resolución: '0.2 μm',
      Iluminación: 'LED',
      Tipo: 'Binocular',
      Marca: 'Nikon',
    },
  },
  {
    id: '2',
    name: 'Espectrofotómetro',
    category: 'Análisis',
    status: 'En Préstamo',
    brand: 'Thermo Fisher',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB7Jg59L5Y-hfAhp4Dy6_h9zvWklQcdTjfLOWoZhjXdtgY8bYw7ejqR0dhXplLLTN3U3DX7iAS3wiqZ9G02fmGC5z0TvHnqwNJ4TWpGTMR2EDI44LxJF-bpkAuBY6YNq_AUOPOLHZBWLDzuIqUtPuO-IlMvyxM7adt1DOvB4tuvxk3WaKF0w37V3JnjqQpYUa9lX-eqq36yeXgttQ47DxYhABTJwpDduFhoWMj1M5bOy77Ylg3DfL6quVjKjFKkGXZI8PDUlIxwgY2n',
    description:
      'Espectrofotómetro UV-Vis de alta precisión para análisis cuantitativos y cualitativos de muestras líquidas. Equipado con detectores de fotodiodos y software avanzado.',
    specifications: {
      'Rango de longitud de onda': '190-1100 nm',
      'Ancho de banda': '2 nm',
      Precisión: '±0.3 nm',
      Detector: 'Fotodiodo silicio',
      Marca: 'Thermo Fisher',
    },
  },
  {
    id: '3',
    name: 'Centrífuga',
    category: 'Preparación',
    status: 'Disponible',
    brand: 'Eppendorf',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDiv7bI6QKlRUT7YO-E4Q7dKsLhc70zQyxkm8SRIx4q9rwCRVKUZDSULfPBgYqekKFDKPUSnrEJetB2OMOJXN2LHMYruhdJvyJIA4qXwitE_xHf_tXwywO2QpUjwFq3t-Bm7yvrbEFXJdVRjrzxP00O2RIfaPTY28t3j47gRE8dfMY8P7NE9BmRo9blPG83uPH0Ez_RKzuW3__OK__8P2GmQu_Z5WFZwBpGpP3UK4QvtJ7VeBuPMKyEKWAOpkU8BDd7CD7o8hrXA7AA',
    description:
      'Centrífuga de alta velocidad con control digital de temperatura y velocidad. Perfecta para separación de muestras biológicas y preparación de especímenes.',
    specifications: {
      'Velocidad máxima': '15,000 rpm',
      Capacidad: '24 tubos x 1.5 ml',
      'Control temperatura': '4°C - 40°C',
      'Aceleración/Desaceleración': 'Automática',
      Marca: 'Eppendorf',
    },
  },
  {
    id: '4',
    name: 'Autoclave Digital',
    category: 'Esterilización',
    status: 'Disponible',
    brand: 'Tuttnauer',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAS9_joCX9hP2_yXEqrERYnFxmCg2Y54tfH7B16vwJ6e2-lHkMo6u_KDgS-uZbjQQejbGrWTKxxJMG4GfuAxaTxfFfLhzcj-SXvJS1IGk-rUbWQXuw8EL4Z4xXtomJIVAZNr04nl-LxYDOgG5uFwno25WpDAoKr2hUj9JTYXKyGDx3jdvMr-4GhLRNDB-ZB6RYDo7-k2RFWF6Pcti1PcgipXexOaII2oOyQLPewARs-fEvSR6DPQiYMA0-_LNme3faBGmgivwW3iPYa',
    description:
      'Autoclave de vapor con control digital para esterilización de instrumentos de laboratorio. Sistema de seguridad avanzado y ciclos preconfigurados.',
    specifications: {
      Capacidad: '23 litros',
      Temperatura: '121°C - 134°C',
      'Presión máxima': '2.2 bar',
      'Tiempo de ciclo': '15-60 min',
      Marca: 'Tuttnauer',
    },
  },
  {
    id: '5',
    name: 'Balanza Analítica',
    category: 'Medición',
    status: 'Disponible',
    brand: 'Sartorius',
    imageUrl:
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80',
    description:
      'Balanza analítica de precisión con pantalla táctil y conectividad USB. Ideal para mediciones exactas en análisis químicos y control de calidad.',
    specifications: {
      Precisión: '0.1 mg',
      Capacidad: '220 g',
      Calibración: 'Interna automática',
      Interface: 'Pantalla táctil',
      Marca: 'Sartorius',
    },
  },
  {
    id: '6',
    name: 'PCR Thermal Cycler',
    category: 'Biología Molecular',
    status: 'En Préstamo',
    brand: 'Bio-Rad',
    imageUrl:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    description:
      'Termociclador PCR de alta precisión para amplificación de ADN. Con gradiente de temperatura y múltiples bloques para diferentes volúmenes de muestra.',
    specifications: {
      'Capacidad de muestras': '96 pozos',
      'Rango de temperatura': '4°C - 100°C',
      Precisión: '±0.2°C',
      'Velocidad de rampa': '5°C/segundo',
      Marca: 'Bio-Rad',
    },
  },
];

interface EquipmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EquipmentDetailPage({
  params,
}: EquipmentDetailPageProps) {
  const { theme } = useTheme();
  const [id, setId] = React.useState<string>('');

  React.useEffect(() => {
    params.then((resolved) => setId(resolved.id));
  }, [params]);

  const equipment = equipmentData.find((eq) => eq.id === id);

  if (!id) {
    return <div>Cargando...</div>;
  }

  if (!equipment) {
    notFound();
  }

  const handleLoanRequest = () => {
    // En una app real, esto haría una petición a la API
    alert(`Solicitud de préstamo enviada para: ${equipment.name}`);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-theme-bg text-theme-text font-roboto">
      <Header />

      <main className="flex flex-1 justify-center py-10 px-4 pt-28 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          {/* Breadcrumb */}
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="text-theme-secondary hover:text-theme-text transition-colors"
              >
                Inicio
              </Link>
              <span className="text-theme-secondary/50">/</span>
              <Link
                href="/inventory"
                className="text-theme-secondary hover:text-theme-text transition-colors"
              >
                Inventario
              </Link>
              <span className="text-theme-secondary/50">/</span>
              <span className="text-theme-text font-medium">
                {equipment.name}
              </span>
            </nav>
          </div>

          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold font-montserrat text-theme-text">
              Equipo: {equipment.name}
            </h2>
          </div>

          {/* Equipment Details Grid */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {/* Equipment Image and Description */}
            <div className="lg:col-span-3">
              {/* Image */}
              <div className="mb-8 aspect-[4/3] w-full overflow-hidden rounded-lg bg-theme-card">
                <div className="h-full w-full relative">
                  <Image
                    src={equipment.imageUrl}
                    alt={equipment.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-2xl font-bold font-montserrat text-theme-text mb-4">
                  Descripción
                </h3>
                <p className="text-base text-theme-secondary leading-relaxed font-poppins">
                  {equipment.description}
                </p>
              </div>
            </div>

            {/* Equipment Info Panel */}
            <div className="lg:col-span-2">
              <div className="rounded-lg bg-theme-card p-6 backdrop-blur-xl border border-theme-border">
                {/* Status */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold font-montserrat text-theme-text mb-4">
                    Estado
                  </h3>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        equipment.status === 'Disponible'
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }`}
                    />
                    <p
                      className={`text-base font-medium font-poppins ${
                        equipment.status === 'Disponible'
                          ? 'text-green-400'
                          : 'text-yellow-400'
                      }`}
                    >
                      {equipment.status}
                    </p>
                  </div>
                </div>

                {/* Specifications */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold font-montserrat text-theme-text mb-4">
                    Especificaciones
                  </h3>
                  <div className="space-y-4 text-sm">
                    {Object.entries(equipment.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className={`flex justify-between border-b pb-3 ${
                            theme === 'dark'
                              ? 'border-white/20 bg-white/5'
                              : 'border-gray-200 bg-gray-50/50'
                          } rounded px-3 py-2`}
                        >
                          <p
                            className={`font-medium ${
                              theme === 'dark'
                                ? 'text-gray-300'
                                : 'text-gray-700'
                            } font-poppins`}
                          >
                            {key}
                          </p>
                          <p
                            className={`font-bold ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            } font-poppins`}
                          >
                            {value}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {equipment.status === 'Disponible' ? (
                  <button
                    onClick={handleLoanRequest}
                    className="w-full rounded-md bg-neon-pink px-6 py-3 text-lg font-bold text-white shadow-lg shadow-neon-pink/40 transition-all hover:scale-105 hover:shadow-neon-pink font-montserrat"
                  >
                    Solicitar Préstamo
                  </button>
                ) : (
                  <div className="w-full rounded-md bg-theme-secondary/30 px-6 py-3 text-lg font-bold text-theme-secondary text-center">
                    No Disponible
                  </div>
                )}

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t border-theme-border">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-theme-secondary font-poppins">
                        Categoría
                      </span>
                      <span className="text-theme-text font-poppins">
                        {equipment.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-secondary font-poppins">
                        Marca
                      </span>
                      <span className="text-theme-text font-poppins">
                        {equipment.brand}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <Link
              href="/inventory"
              className="inline-flex items-center gap-2 rounded-md bg-theme-card px-4 py-2 text-sm font-medium text-theme-secondary transition-all hover:bg-theme-border hover:text-theme-text"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver al Inventario
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
