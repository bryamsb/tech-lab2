



















'use client';

import Header from '@/components/Header';
import LoansCalendar from '@/components/LoansCalendar';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { useAuth as useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface Loan {
  id: string;
  equipment: string;
  loanDate: string;
  returnDate: string;
  status: 'En Préstamo' | 'Devuelto' | 'Vencido';
  userId: string;
  userName: string;
}

const loansData: Loan[] = [
  {
    id: '1',
    equipment: 'Osciloscopio Digital',
    loanDate: '15 de mayo de 2024',
    returnDate: '22 de mayo de 2024',
    status: 'En Préstamo',
    userId: '001',
    userName: 'Ana García',
  },
  {
    id: '2',
    equipment: 'Generador de Señales',
    loanDate: '10 de mayo de 2024',
    returnDate: '17 de mayo de 2024',
    status: 'En Préstamo',
    userId: '002',
    userName: 'Carlos Mendoza',
  },
  {
    id: '3',
    equipment: 'Fuente de Alimentación',
    loanDate: '5 de mayo de 2024',
    returnDate: '12 de mayo de 2024',
    status: 'Devuelto',
    userId: '003',
    userName: 'María López',
  },
  {
    id: '4',
    equipment: 'Multímetro Digital',
    loanDate: '1 de mayo de 2024',
    returnDate: '8 de mayo de 2024',
    status: 'Devuelto',
    userId: '004',
    userName: 'Juan Pérez',
  },
  {
    id: '5',
    equipment: 'Espectrofotómetro',
    loanDate: '25 de abril de 2024',
    returnDate: '2 de mayo de 2024',
    status: 'Vencido',
    userId: '005',
    userName: 'Laura Ruiz',
  },
  {
    id: '6',
    equipment: 'Centrífuga',
    loanDate: '20 de abril de 2024',
    returnDate: '27 de abril de 2024',
    status: 'Devuelto',
    userId: '006',
    userName: 'Roberto Silva',
  },
];

export default function LoansPage() {
  const { user: sbUser, profile } = useSupabaseAuth();
  const isAuthenticated = !!sbUser;
  const user = { role: profile?.role } as { role?: string };
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Variables disponibles para futuras funcionalidades
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isAdmin = isAuthenticated && user.role === 'admin';

  const filteredLoans = loansData.filter((loan) => {
    return statusFilter === 'Todos' || loan.status === statusFilter;
  });

  const currentLoans = filteredLoans.filter(
    (loan) => loan.status === 'En Préstamo' || loan.status === 'Vencido'
  );
  const loanHistory = filteredLoans.filter(
    (loan) => loan.status === 'Devuelto'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En Préstamo':
        return 'bg-neon-pink/20 text-neon-pink';
      case 'Devuelto':
        return 'bg-green-500/20 text-green-400';
      case 'Vencido':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-theme-bg text-theme-text font-roboto">
      <Header />

      <main className="flex-1 px-4 py-8 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-montserrat text-theme-text">
              Gestión de Préstamos
            </h1>
          </div>

            {/* Calendar */}
            <LoansCalendar />

          {/* Filter */}
          <div className="mb-6">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-theme-border bg-theme-card px-4 py-2 text-sm text-theme-text focus:border-bright-blue focus:ring-bright-blue"
            >
              <option value="Todos">Todos los estados</option>
              <option value="En Préstamo">En Préstamo</option>
              <option value="Devuelto">Devuelto</option>
              <option value="Vencido">Vencido</option>
            </select>
          </div>

          {/* Current Loans Section */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold font-montserrat text-theme-text mb-6">
              Préstamos Actuales
            </h2>

            <div className="overflow-x-auto rounded-lg border border-theme-border bg-theme-card backdrop-blur-xl">
              <table className="min-w-full divide-y divide-theme-border">
                <thead className="bg-theme-bg">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-theme-text font-poppins">
                      Equipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-theme-text font-poppins">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-theme-text font-poppins">
                      Fecha de Préstamo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-theme-text font-poppins">
                      Fecha de Devolución
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-theme-text font-poppins">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border bg-theme-card">
                  {currentLoans.map((loan) => (
                    <tr
                      key={loan.id}
                      className="hover:bg-theme-bg transition-colors"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-theme-text font-poppins">
                        {loan.equipment}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-theme-text font-poppins">
                        {loan.userName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-theme-text font-poppins">
                        {loan.loanDate}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-theme-text font-poppins">
                        {loan.returnDate}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-5 font-poppins ${getStatusColor(loan.status)}`}
                        >
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {currentLoans.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-light-gray/70 font-poppins">
                    No hay préstamos actuales.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Loan History Section */}
          <div>
            <h2 className="text-xl font-semibold font-montserrat text-theme-text mb-6">
              Historial de Préstamos
            </h2>

            <div className="overflow-x-auto rounded-lg border border-theme-border bg-theme-card backdrop-blur-xl">
              <table className="min-w-full divide-y divide-theme-border">
                <thead className="bg-theme-bg">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-theme-text font-poppins">
                      Equipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-theme-text font-poppins">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-theme-text font-poppins">
                      Fecha de Préstamo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-theme-text font-poppins">
                      Fecha de Devolución
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-theme-text font-poppins">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border bg-theme-card">
                  {loanHistory.map((loan) => (
                    <tr
                      key={loan.id}
                      className="hover:bg-theme-bg transition-colors"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-theme-text font-poppins">
                        {loan.equipment}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-theme-text font-poppins">
                        {loan.userName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-theme-text font-poppins">
                        {loan.loanDate}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-theme-text font-poppins">
                        {loan.returnDate}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-5 font-poppins ${getStatusColor(loan.status)}`}
                        >
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {loanHistory.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-light-gray/70 font-poppins">
                    No hay historial de préstamos.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
