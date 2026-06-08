"use client";
"use client";

import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth as useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseEquipment, SupabaseEquipment } from '@/hooks/useSupabaseEquipment';
import Modal from '@/components/Modal';

type LoanEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  equipment_id: string;
};

type Loan = {
  id: string;
  item_id?: string | null;
  equipment_id?: string | null;
  item_name?: string | null;
  borrower_name?: string | null;
  user_name?: string | null;
  loan_date?: string | null;
  expected_return_date?: string | null;
  [key: string]: unknown;
};

// reuse SupabaseEquipment type from hook

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function LoansCalendar({ onSelectEvent }: { onSelectEvent?: (event: LoanEvent) => void }) {
  const [events, setEvents] = useState<LoanEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { user: sbUser, profile } = useSupabaseAuth();
  const { equipment } = useSupabaseEquipment();
  const [loansList, setLoansList] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Modal / form state
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/loans');
      const json = (await res.json()) as { loans?: Loan[] };
      if (json.loans) {
        setLoansList(json.loans);

        const mapped = json.loans.map((l) => ({
          id: l.id,
          title: `${l.borrower_name || l.user_name || 'Usuario'} — ${l.item_name || ''}`.trim(),
          start: l.loan_date ? new Date(l.loan_date) : new Date(),
          end: l.expected_return_date ? new Date(l.expected_return_date) : new Date(),
          equipment_id: (l.item_id as string) || l.equipment_id || '',
        } as LoanEvent));

        setEvents(mapped);
      }
    } catch (err) {
      console.error('Error fetching loans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const openCreateModal = () => {
    setErrorMsg(null);
    setSelectedEquipmentId(equipment[0]?.id || '');
    setStartDate('');
    setEndDate('');
    setShowModal(true);
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!selectedEquipmentId || !startDate || !endDate) {
      setErrorMsg('Completa todos los campos');
      return;
    }

    const payload = {
      item_id: selectedEquipmentId,
      borrower_id: sbUser?.id || null,
      user_name: profile?.full_name || profile?.username || 'Usuario',
      loan_date: new Date(startDate).toISOString(),
      expected_return_date: new Date(endDate).toISOString(),
    };

    try {
      setSubmitting(true);
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        setShowModal(false);
        await fetchLoans();
      } else if (res.status === 409) {
        const json = await res.json();
        setErrorMsg('Conflict: la reserva se solapa con otra existente');
        console.warn('Conflicts:', json.conflicts);
      } else {
        const json = await res.json();
        setErrorMsg(json.error || 'Error al crear reserva');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error de red');
    } finally {
      setSubmitting(false);
    }
  };

  const createDemoReservations = async () => {
    if (!equipment || equipment.length === 0) {
      setErrorMsg('No hay equipos disponibles para demo');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);
    try {
      const demoPromises: Promise<Response>[] = [];
      const today = new Date();

      for (let i = 0; i < Math.min(3, equipment.length); i++) {
        const eq = equipment[i];
        const start = new Date(today);
        start.setDate(today.getDate() + i * 2 + 1);
        start.setHours(9, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 1);
        end.setHours(17, 0, 0, 0);

        const payload = {
          item_id: eq.id,
          borrower_id: sbUser?.id || null,
          user_name: profile?.full_name || profile?.username || 'Demo Usuario',
          loan_date: start.toISOString(),
          expected_return_date: end.toISOString(),
        };

        demoPromises.push(
          fetch('/api/loans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        );
      }

      const results = await Promise.all(demoPromises);
      const hasErrors = results.some((r) => r.status !== 201);
      if (hasErrors) {
        const msgs = await Promise.all(results.map((r) => r.json().catch(() => ({}))));
        console.warn('Demo creation results', msgs);
        setErrorMsg('Algunos demos no pudieron crearse. Revisa la consola.');
      }

      await fetchLoans();
    } catch (err) {
      console.error('Error creating demo reservations', err);
      setErrorMsg('Error creando demos');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-theme-card border border-theme-border rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-theme-text mb-3">Calendario de Reservas</h3>
      <div style={{ height: 500 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={(e: LoanEvent) => {
            // Try to find the full loan object from the fetched loans list
            const loan = loansList.find((l) => String(l.id) === String(e.id));
            if (loan) {
              setSelectedLoan(loan);
              setShowDetailsModal(true);
            } else {
              // Fallback: construct a minimal loan-like object from the event
              const fallback = {
                id: e.id,
                item_id: e.equipment_id,
                item_name: e.title?.split('—')?.slice(-1)[0]?.trim(),
                borrower_name: e.title?.split('—')?.[0]?.trim(),
                loan_date: e.start ? new Date(e.start).toISOString() : undefined,
                expected_return_date: e.end ? new Date(e.end).toISOString() : undefined,
              };
              setSelectedLoan(fallback as Loan);
              setShowDetailsModal(true);
            }

            if (onSelectEvent) onSelectEvent(e);
          }}
          views={{ month: true, week: true, day: true }}
          defaultView={'month'}
          popup
          rtl={false}
          style={{ height: '100%' }}
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={openCreateModal}
          className="px-3 py-2 bg-theme-accent/10 text-theme-accent rounded-md text-sm"
        >
          Crear reserva
        </button>

        <button
          onClick={async () => {
            await createDemoReservations();
          }}
          disabled={!equipment || equipment.length === 0 || submitting}
          className="px-3 py-2 bg-theme-accent text-white rounded-md text-sm"
        >
          Generar demo
        </button>

        {loading && <div className="text-sm text-theme-secondary">Cargando...</div>}
      </div>

      {/* Loans list */}
      <div className="mt-6">
        <h4 className="text-md font-semibold text-theme-text mb-2">Préstamos</h4>
        <div className="overflow-x-auto rounded-lg border border-theme-border bg-theme-card">
          <table className="min-w-full divide-y divide-theme-border">
            <thead className="bg-theme-bg">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-theme-text">Equipo</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-theme-text">Usuario</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-theme-text">Inicio</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-theme-text">Fin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border bg-theme-card">
              {loansList.map((l) => (
                <tr key={l.id} className="hover:bg-theme-bg">
                  <td className="px-4 py-3 text-sm text-theme-text">{l.item_name || (equipment.find((eq: SupabaseEquipment) => eq.id === l.item_id)?.name) || '—'}</td>
                  <td className="px-4 py-3 text-sm text-theme-text">
                    {l.borrower_name || l.user_name ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLoan(l);
                          setShowDetailsModal(true);
                        }}
                        className="text-theme-accent underline hover:text-theme-accent/80"
                      >
                        {l.borrower_name || l.user_name}
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-theme-text">{l.loan_date ? new Date(l.loan_date).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3 text-sm text-theme-text">{l.expected_return_date ? new Date(l.expected_return_date).toLocaleString() : '—'}</td>
                </tr>
              ))}
              {loansList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-theme-secondary">No hay reservas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Create reservation modal (uses shared Modal component) */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Crear Reserva" size="md">
        <form onSubmit={handleCreateReservation} className="space-y-3">
          <div>
            <label className="block text-sm text-theme-secondary mb-1">Equipo</label>
            <select
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(e.target.value)}
              className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg text-theme-text"
            >
              <option value="">Selecciona un equipo</option>
              {equipment.map((eq: SupabaseEquipment) => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-theme-secondary mb-1">Inicio</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg text-theme-text"
              />
            </div>
            <div>
              <label className="block text-sm text-theme-secondary mb-1">Fin</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-theme-background border border-theme-border rounded-lg text-theme-text"
              />
            </div>
          </div>

          {errorMsg && <div className="text-sm text-red-400">{errorMsg}</div>}

          <div className="flex items-center justify-end gap-2 mt-3">
            <button type="button" onClick={() => setShowModal(false)} className="px-3 py-2 rounded-md bg-gray-600/10 text-theme-secondary">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-md bg-theme-accent text-white">{submitting ? 'Enviando...' : 'Reservar'}</button>
          </div>
        </form>
      </Modal>
      {/* Details modal for a selected loan (shared Modal) */}
      <Modal
        isOpen={showDetailsModal && !!selectedLoan}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLoan(null);
        }}
        title="Detalle de la Reserva"
        size="md"
      >
        {selectedLoan && (
          <div className="text-sm text-theme-secondary space-y-2 mb-4">
            <div>
              <div className="text-xs text-theme-secondary">Equipo</div>
              <div className="text-theme-text">{selectedLoan.item_name || (equipment.find((eq: SupabaseEquipment) => eq.id === selectedLoan.item_id)?.name) || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-theme-secondary">Usuario</div>
              <div className="text-theme-text">{selectedLoan.borrower_name || selectedLoan.user_name || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-theme-secondary">Inicio</div>
              <div className="text-theme-text">{selectedLoan.loan_date ? new Date(selectedLoan.loan_date).toLocaleString() : '—'}</div>
            </div>
            <div>
              <div className="text-xs text-theme-secondary">Fin</div>
              <div className="text-theme-text">{selectedLoan.expected_return_date ? new Date(selectedLoan.expected_return_date).toLocaleString() : '—'}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

