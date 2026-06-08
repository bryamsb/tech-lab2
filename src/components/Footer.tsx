'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/10 py-6">
      <div className="container mx-auto px-6 text-center text-sm text-light-gray/50">
        <p>© {currentYear} OTI UNI Tech Lab. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
