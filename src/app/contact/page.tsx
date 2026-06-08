'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // En una app real, esto enviaría los datos a una API
    alert(
      `Mensaje enviado correctamente.\nNombre: ${formData.name}\nEmail: ${formData.email}\nMensaje: ${formData.message}`
    );
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-theme-bg text-theme-text font-roboto">
      <Header />

      <main className="flex flex-1 flex-col items-center py-10 pt-36 md:py-16 md:pt-40">
        <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight font-montserrat text-theme-text sm:text-5xl lg:text-6xl">
              Contáctanos
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-theme-secondary font-poppins">
              Si tienes alguna pregunta o necesitas ayuda, no dudes en ponerte
              en contacto con nosotros.{' '}
              <Link
                href="/maps"
                aria-label="Acceso oculto a mapas"
                className="text-inherit hover:text-inherit"
              >
                Estamos aquí para ayudarte.
              </Link>
            </p>
          </div>

          {/* Content Grid */}
          <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            {/* Contact Form */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold font-montserrat text-theme-text">
                Formulario de Contacto
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-theme-text font-poppins"
                  >
                    Nombre
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-lg border border-theme-border bg-theme-card p-3 text-theme-text placeholder-theme-secondary/60 shadow-sm focus:border-bright-blue focus:ring-bright-blue font-poppins"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                </div>
                {/* Email Field */}
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-theme-text font-poppins"
                  >
                    Correo electrónico
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-lg border border-theme-border bg-theme-card p-3 text-theme-text placeholder-theme-secondary/60 shadow-sm focus:border-bright-blue focus:ring-bright-blue font-poppins"
                      placeholder="tu.email@ejemplo.com"
                    />
                  </div>
                </div>{' '}
                {/* Message Field */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-theme-text font-poppins"
                  >
                    Mensaje
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="message"
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-lg border border-theme-border bg-theme-card p-3 text-theme-text placeholder-theme-secondary/60 shadow-sm focus:border-bright-blue focus:ring-bright-blue font-poppins"
                      placeholder="Escribe tu mensaje aquí..."
                    />
                  </div>
                </div>
                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-lg bg-neon-pink px-4 py-3 text-base font-bold text-white shadow-lg shadow-neon-pink/40 transition-all hover:scale-105 hover:shadow-neon-pink focus:outline-none focus:ring-2 focus:ring-neon-pink focus:ring-offset-2 focus:ring-offset-dark-bg font-montserrat"
                  >
                    Enviar Mensaje
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold font-montserrat text-theme-text">
                Información de Contacto
              </h2>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-neon-pink"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-base text-theme-secondary font-poppins">
                      Correo electrónico
                    </p>
                    <a
                      href="mailto:soporte@unitechlab.com"
                      className="text-base font-medium text-theme-text hover:text-bright-blue transition-colors font-poppins"
                    >
                      soporte@unitechlab.com
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-neon-pink"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-base text-theme-secondary font-poppins">
                      Teléfono
                    </p>
                    <a
                      href="tel:+51014256789"
                      className="text-base font-medium text-theme-text hover:text-bright-blue transition-colors font-poppins"
                    >
                      +51 (01) 425-6789
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-neon-pink"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-base text-theme-secondary font-poppins">
                      Dirección
                    </p>
                    <p className="text-base font-medium text-theme-text font-poppins">
                      Av. Túpac Amaru 210
                      <br />
                      Rímac, Lima 15333
                      <br />
                      Perú
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-neon-pink"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-base text-theme-secondary font-poppins">
                      Horarios de atención
                    </p>
                    <p className="text-base font-medium text-theme-text font-poppins">
                      Lunes a Viernes: 8:00 AM - 6:00 PM
                      <br />
                      Sábados: 9:00 AM - 1:00 PM
                      <br />
                      Domingos: Cerrado
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info Card */}
              <div className="rounded-lg bg-theme-card p-6 backdrop-blur-xl border border-theme-border">
                <h3 className="text-lg font-semibold font-montserrat text-theme-text mb-3">
                  ¿Necesitas ayuda inmediata?
                </h3>
                <p className="text-sm text-theme-secondary mb-4 font-poppins">
                  Para consultas urgentes sobre equipos o préstamos, puedes
                  contactarnos directamente por teléfono durante nuestros
                  horarios de atención.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="mailto:soporte@unitechlab.com"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-bright-blue text-dark-bg text-sm font-medium hover:bg-white transition-colors font-poppins"
                  >
                    Enviar Email
                  </a>
                  <a
                    href="tel:+51014256789"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-theme-border text-theme-text text-sm font-medium hover:bg-theme-card/50 transition-colors font-poppins"
                  >
                    Llamar Ahora
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
