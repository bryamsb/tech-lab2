'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Model3DViewer from '@/components/Model3DViewer';
import Link from 'next/link';
import { useTechnologies } from '@/hooks/useTechnologies';
import { BookOpen } from 'lucide-react';

export default function Home() {
  const { technologies } = useTechnologies();

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-theme-bg text-theme-text font-roboto overflow-hidden transition-colors duration-300">
      <Header />

      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
            <div className="grid grid-cols-1 gap-8 lg:gap-0 lg:grid-cols-2 items-center w-full max-w-none relative">
              {/* Hero Content */}
              <div className="flex flex-col justify-center order-2 lg:order-1 z-10 relative">
                <div className="p-8">
                  <h1 className="font-bebas text-5xl font-bold tracking-wider text-theme-text md:text-7xl">
                    Gestión de Proyectos Tech Lab
                  </h1>
                  <p className="mt-6 text-lg text-theme-secondary">
                    Plataforma integral para la gestión y seguimiento de
                    proyectos tecnológicos innovadores. Desde LoRa y Blockchain
                    hasta ESP32, IA y gestión de inventario. Explora nuestro
                    ecosistema de tecnologías de vanguardia en un entorno 3D
                    interactivo.
                  </p>

                  {/* Statistics Cards */}
                  <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="p-6 text-center bg-theme-card border border-theme-border rounded-xl">
                      <p className="font-poppins text-sm font-medium text-theme-secondary">
                        Proyectos Activos
                      </p>
                      <p className="mt-2 font-montserrat text-4xl font-bold text-theme-text">
                        12
                      </p>
                    </div>
                    <div className="p-6 text-center bg-theme-card border border-theme-border rounded-xl">
                      <p className="font-poppins text-sm font-medium text-theme-secondary">
                        Tecnologías Integradas
                      </p>
                      <p className="mt-2 font-montserrat text-4xl font-bold text-bright-blue">
                        8
                      </p>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="mt-12 flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/projects"
                      className="inline-block rounded-md bg-gradient-to-r from-bright-blue to-neon-pink px-8 py-3 text-lg font-bold text-white shadow-lg shadow-bright-blue/40 transition-all hover:scale-105 hover:shadow-bright-blue"
                    >
                      Explorar Proyectos
                    </Link>
                    <Link
                      href="/inventory"
                      className="inline-block rounded-md bg-neon-pink px-8 py-3 text-lg font-bold text-white shadow-lg shadow-neon-pink/40 transition-all hover:scale-105 hover:shadow-neon-pink"
                    >
                      Explorar Inventario
                    </Link>
                  </div>
                </div>
              </div>

              {/* 3D Model Viewer - Hidden on mobile for better performance */}
              <div className="hidden lg:flex justify-center items-center order-1 lg:order-2 lg:-ml-8">
                <div className="w-full max-w-2xl h-[700px]">
                  <Model3DViewer />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Animated Technologies Section */}
      <section className="relative py-16 bg-gradient-to-r from-neon-pink/10 via-bright-blue/5 to-neon-pink/10 border-t border-theme-border overflow-hidden">
        <div className="absolute inset-0 bg-theme-card/60 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-bebas text-3xl md:text-4xl font-bold text-theme-text tracking-wider mb-4">
              Tecnologías Implementadas
            </h2>
            <p className="text-theme-secondary font-poppins max-w-2xl mx-auto">
              Explora las tecnologías de vanguardia que impulsan nuestros
              proyectos
            </p>
          </div>

          {/* Animated Tech List */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll whitespace-nowrap">
              {/* Primera serie de tecnologías */}
              <div className="flex items-center space-x-8 text-lg font-poppins">
                {technologies.map((tech, index) => (
                  <Link
                    key={`home-tech-1-${tech.id}`}
                    href={`/technologies/${tech.id}`}
                    className={`bg-gradient-to-r ${index % 2 === 0 ? 'from-neon-pink to-bright-blue border-neon-pink/30 hover:border-neon-pink/60 hover:shadow-neon-pink/20' : 'from-bright-blue to-neon-pink border-bright-blue/30 hover:border-bright-blue/60 hover:shadow-bright-blue/20'} bg-clip-text text-transparent font-bold px-6 py-3 border rounded-full backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer`}
                  >
                    {tech.name}
                  </Link>
                ))}
              </div>

              {/* Segunda serie de tecnologías (duplicado para loop infinito) */}
              <div className="flex items-center space-x-8 text-lg font-poppins ml-8">
                {technologies.map((tech, index) => (
                  <Link
                    key={`home-tech-2-${tech.id}`}
                    href={`/technologies/${tech.id}`}
                    className={`bg-gradient-to-r ${index % 2 === 0 ? 'from-neon-pink to-bright-blue border-neon-pink/30 hover:border-neon-pink/60 hover:shadow-neon-pink/20' : 'from-bright-blue to-neon-pink border-bright-blue/30 hover:border-bright-blue/60 hover:shadow-bright-blue/20'} bg-clip-text text-transparent font-bold px-6 py-3 border rounded-full backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer`}
                  >
                    {tech.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Button to see all technologies */}
          <div className="text-center mt-12">
            <Link
              href="/technologies"
              className="inline-block rounded-md bg-gradient-to-r from-bright-blue to-neon-pink px-8 py-3 text-lg font-bold text-white shadow-lg shadow-bright-blue/40 transition-all hover:scale-105 hover:shadow-bright-blue"
            >
              Ver Todas las Tecnologías
            </Link>
          </div>
        </div>
      </section>

      <Link
        href="/docs"
        aria-label="Abrir guía de usuario"
        title="Guía de usuario"
        className="fixed bottom-6 left-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-theme-card border border-theme-border text-theme-text shadow-lg transition-colors hover:bg-theme-accent/10 hover:border-theme-accent"
      >
        <BookOpen className="h-5 w-5" />
      </Link>

      <Footer />
    </div>
  );
}
