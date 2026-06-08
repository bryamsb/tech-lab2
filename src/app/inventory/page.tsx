'use client';

import { useState, useEffect } from 'react';

import Image from 'next/image';
import {
  Plus,
  Edit3,
  Trash2,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench,
} from 'lucide-react';
import { useAuth as useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import {
  useSupabaseEquipment,
  SupabaseEquipment,
} from '@/hooks/useSupabaseEquipment';
import { useRef } from 'react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import Header from '@/components/Header';
import useDebounce from '@/hooks/useDebounce';
import SearchBar from '@/components/SearchBar';

export default function InventoryPage() {
  const { user: sbUser, profile } = useSupabaseAuth();
  const isAuthenticated = !!sbUser;
  const user = { role: profile?.role } as { role?: string };
  const { redirectToLogin } = useAuthRedirect();
  const {
    equipment: items,
    createEquipment: addItem,
    updateEquipment: updateItem,
    deleteEquipment: deleteItem,
    loading: isLoading,
    fetchEquipment,
  } = useSupabaseEquipment({ autoFetch: false });

  // Estados del componente
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<
    SupabaseEquipment['condition'] | ''
  >('');
  const [locationQuery, setLocationQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SupabaseEquipment | null>(
    null
  );
  const [filteredItems, setFilteredItems] =
    useState<SupabaseEquipment[]>(items);
  const [currentPage, setCurrentPage] = useState(1);
  const lastFetchKey = useRef<string | null>(null);
  const ITEMS_PER_PAGE = 9;
  const MAX_VISIBLE_PAGES = 5;

  // Funciones auxiliares para filtros
  const filterByCondition = (condition: SupabaseEquipment['condition']) => {
    return items.filter((item) => item.condition === condition);
  };

  const getAvailableItems = () => {
    return items.filter((item) => item.available_quantity > 0);
  };

  const getUnavailableItems = () => {
    return items.filter((item) => item.available_quantity === 0);
  };

  // Función para manejar la redirección al login
  const handleLoginRedirect = (e?: React.MouseEvent) => {
    e?.preventDefault();
    redirectToLogin();
  };

  // Debounce search to avoid filtering on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedLocationQuery = useDebounce(locationQuery, 300);

  // Efecto para pedir datos al servidor cuando cambian filtros/búsqueda
  useEffect(() => {
    const filters = {
      condition: selectedCondition || undefined,
      category: selectedCategory || undefined,
      location: debouncedLocationQuery || undefined,
      available_only: availableOnly || undefined,
    };

    const key = JSON.stringify({ filters, search: debouncedSearchQuery });
    if (lastFetchKey.current === key) {
      return;
    }
    lastFetchKey.current = key;

    let didCancel = false;

    fetchEquipment(filters, debouncedSearchQuery).catch((err) => {
      if (!didCancel) {
        console.error('Error fetching equipment', err);
      }
    });

    return () => {
      didCancel = true;
    };
  }, [debouncedSearchQuery, selectedCategory, selectedCondition, debouncedLocationQuery, availableOnly, fetchEquipment]);

  // Mantener filteredItems sincronizado con items que vienen del servidor
  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, debouncedLocationQuery, selectedCategory, selectedCondition, availableOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const halfWindow = Math.floor(MAX_VISIBLE_PAGES / 2);
  const startPage = Math.max(1, Math.min(currentPage - halfWindow, totalPages - MAX_VISIBLE_PAGES + 1));
  const endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Datos para filtros
  const categories = [...new Set(items.map((item) => item.category))];
  const conditions: SupabaseEquipment['condition'][] = [
    'excellent',
    'good',
    'fair',
    'poor',
    'damaged',
    'broken',
  ];

  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Funciones para íconos y colores según condición
  const getConditionIcon = (condition: SupabaseEquipment['condition']) => {
    switch (condition) {
      case 'excellent':
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />;
      case 'good':
        return <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-500" />;
      case 'fair':
        return <Clock className="w-4 h-4 text-amber-600 dark:text-yellow-500" />;
      case 'poor':
        return <Wrench className="w-4 h-4 text-orange-600 dark:text-orange-500" />;
      case 'damaged':
        return <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-500" />;
      case 'broken':
        return <AlertCircle className="w-4 h-4 text-red-700 dark:text-red-600" />;
    }
  };

  const getConditionColor = (condition: SupabaseEquipment['condition']) => {
    switch (condition) {
      case 'excellent':
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20';
      case 'good':
        return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'fair':
        return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20';
      case 'poor':
        return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20';
      case 'damaged':
        return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
      case 'broken':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-600/10 dark:text-red-500 dark:border-red-600/20';
    }
  };

  const conditionLabels = {
    excellent: 'Excelente',
    good: 'Bueno',
    fair: 'Regular',
    poor: 'Malo',
    damaged: 'Dañado',
    broken: 'Roto',
  };

  // Función para agregar nuevo equipo
  const handleAddItem = async (
    formData: Omit<SupabaseEquipment, 'id' | 'created_at' | 'updated_at'>
  ) => {
    await addItem(formData);
    setShowAddModal(false);
  };

  // Función para editar equipo
  const handleEditItem = async (
    formData: Omit<SupabaseEquipment, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (!selectedItem) return;
    await updateItem(selectedItem.id, formData);
    setShowEditModal(false);
    setSelectedItem(null);
  };

  // Función para eliminar equipo
  const handleDeleteItem = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
      await deleteItem(id);
    }
  };

  return (
    <div className="min-h-screen bg-theme-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-text mb-2">
            {isAdmin ? 'Gestión de Inventario' : 'Inventario del Tech Lab'}
          </h1>
          <p className="text-theme-secondary">
            {isAdmin
              ? 'Administra el inventario del Tech Lab'
              : isAuthenticated
                ? 'Consulta el inventario y solicita préstamos de equipos'
                : 'Explora el inventario de equipos disponibles en el Tech Lab'}
          </p>
          {!isAdmin && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-sm">
                {isAuthenticated ? (
                  <>
                    <strong>Modo Usuario:</strong> Puedes ver detalles de
                    equipos y solicitar préstamos. Solo los administradores
                    pueden modificar el inventario.
                  </>
                ) : (
                  <>
                    <strong>Modo Visitante:</strong> Puedes explorar el
                    inventario.{' '}
                    <button
                      onClick={handleLoginRedirect}
                      className="underline hover:text-blue-300 cursor-pointer"
                    >
                      Inicia sesión
                    </button>{' '}
                    para solicitar préstamos de equipos.
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="bg-theme-card rounded-lg p-6 border border-theme-border mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Búsqueda */}
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              locationQuery={locationQuery}
              setLocationQuery={setLocationQuery}
              availableOnly={availableOnly}
              setAvailableOnly={setAvailableOnly}
            />

            {/* Filtros */}
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={selectedCondition}
                onChange={(e) =>
                  setSelectedCondition(
                    e.target.value as SupabaseEquipment['condition'] | ''
                  )
                }
                className="w-full sm:w-auto px-4 py-2 bg-theme-background border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent text-theme-text"
              >
                <option value="">Todas las condiciones</option>
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {conditionLabels[condition]}
                  </option>
                ))}
              </select>

              {/* Botón Agregar - Solo para administradores */}
              {isAdmin && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-neon-pink to-bright-blue text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Equipo
                </button>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-theme-text">
                {items.length}
              </div>
              <div className="text-sm text-theme-secondary">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {getAvailableItems().length}
              </div>
              <div className="text-sm text-theme-secondary">Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getUnavailableItems().length}
              </div>
              <div className="text-sm text-theme-secondary">No Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600 dark:text-yellow-400">
                {filterByCondition('damaged').length}
              </div>
              <div className="text-sm text-theme-secondary">Dañados</div>
            </div>
          </div>
        </div>

        {/* Lista de Equipos */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="text-center text-theme-secondary col-span-full">
              Cargando inventario...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center text-theme-secondary py-8 col-span-full">
              {searchQuery || selectedCategory || selectedCondition
                ? 'No se encontraron equipos con los filtros aplicados.'
                : 'No hay equipos en el inventario.'}
            </div>
          ) : (
            paginatedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setShowViewModal(true);
                }}
                className="bg-theme-card border border-theme-border rounded-2xl p-4 hover:border-theme-accent/60 hover:-translate-y-0.5 transition-all h-full cursor-pointer"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-theme-accent flex-shrink-0 mt-0.5" />
                        <h3 className="text-lg font-semibold text-theme-text leading-tight line-clamp-2">
                          {item.name}
                        </h3>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getConditionColor(item.condition)}`}
                        >
                          {getConditionIcon(item.condition)}
                          {conditionLabels[item.condition]}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${item.available_quantity > 0
                            ? 'text-green-700 border-green-300 bg-green-100 dark:text-green-400 dark:border-green-500/30 dark:bg-green-500/10'
                            : 'text-red-700 border-red-300 bg-red-100 dark:text-red-400 dark:border-red-500/30 dark:bg-red-500/10'
                            }`}
                        >
                          {item.available_quantity > 0
                            ? 'Disponible'
                            : 'No disponible'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      {/* Botón Pedir Prestado - Solo usuarios autenticados no admin */}
                      {isAuthenticated &&
                        !isAdmin &&
                        item.available_quantity > 0 &&
                        item.is_loanable && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              alert('Funcionalidad de préstamo en desarrollo');
                            }}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Pedir prestado"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}

                      {/* Botón Login para visitantes */}
                      {!isAuthenticated &&
                        item.available_quantity > 0 &&
                        item.is_loanable && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleLoginRedirect();
                            }}
                            className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-500/10 rounded-lg transition-colors"
                            title="Inicia sesión para solicitar préstamo"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}

                      {/* Botones Editar y Eliminar - Solo administradores */}
                      {isAdmin && (
                        <>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedItem(item);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-theme-secondary hover:text-theme-text hover:bg-theme-accent/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteItem(item.id);
                            }}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-theme-border/70 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-theme-secondary">Categoría</span>
                      <span className="text-theme-text font-medium truncate text-right">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-theme-secondary">Cantidad</span>
                      <span className="text-theme-text font-medium">
                        {item.available_quantity}/{item.quantity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-theme-secondary">Ubicación</span>
                      <span className="text-theme-text font-medium truncate text-right">
                        {item.location || 'No especificada'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-theme-secondary">Marca</span>
                      <span className="text-theme-text font-medium truncate text-right">
                        {item.brand || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && filteredItems.length > 0 && totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-theme-card border border-theme-border rounded-lg p-3">
            <p className="text-sm text-theme-secondary">
              Mostrando {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} de {filteredItems.length} equipos
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md border border-theme-border text-theme-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-theme-accent/10 transition-colors"
              >
                Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: endPage - startPage + 1 }, (_, index) => {
                  const page = startPage + index;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-md text-sm border transition-colors ${currentPage === page
                        ? 'bg-theme-accent text-theme-background border-theme-accent shadow-lg shadow-theme-accent/30 ring-2 ring-theme-accent/30 font-semibold cursor-pointer'
                        : 'border-theme-border text-theme-secondary hover:text-theme-text hover:bg-theme-accent/10 cursor-pointer'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-md border border-theme-border text-theme-text disabled:opacity-40 disabled:cursor-not-allowed hover:bg-theme-accent/10 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Modal para Ver Detalles */}
        {showViewModal && selectedItem && (
          <ViewItemModal
            item={selectedItem}
            onClose={() => {
              setShowViewModal(false);
              setSelectedItem(null);
            }}
          />
        )}

        {/* Modal para Agregar */}
        {showAddModal && (
          <AddItemModal
            onAdd={handleAddItem}
            onClose={() => setShowAddModal(false)}
          />
        )}

        {/* Modal para Editar */}
        {showEditModal && selectedItem && (
          <EditItemModal
            item={selectedItem}
            onEdit={handleEditItem}
            onClose={() => {
              setShowEditModal(false);
              setSelectedItem(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

// Modal para ver detalles
function ViewItemModal({
  item,
  onClose,
}: {
  item: SupabaseEquipment;
  onClose: () => void;
}) {
  const parseSpecifications = () => {
    const raw = item.specifications as unknown;

    if (!raw) {
      return { entries: [] as Array<[string, string]>, plainText: '' };
    }

    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) {
        return { entries: [] as Array<[string, string]>, plainText: '' };
      }

      try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const entries = Object.entries(parsed).map(([key, value]) => [
            key,
            String(value ?? ''),
          ] as [string, string]);
          return { entries, plainText: '' };
        }
      } catch {
        return { entries: [] as Array<[string, string]>, plainText: trimmed };
      }

      return { entries: [] as Array<[string, string]>, plainText: trimmed };
    }

    if (typeof raw === 'object' && !Array.isArray(raw)) {
      const entries = Object.entries(raw as Record<string, unknown>).map(
        ([key, value]) => [key, String(value ?? '')] as [string, string]
      );
      return { entries, plainText: '' };
    }

    return { entries: [] as Array<[string, string]>, plainText: String(raw) };
  };

  const specificationsView = parseSpecifications();

  const getConditionIcon = (condition: SupabaseEquipment['condition']) => {
    switch (condition) {
      case 'excellent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'good':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'fair':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'poor':
        return <Wrench className="w-4 h-4 text-orange-500" />;
      case 'damaged':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'broken':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const conditionLabels = {
    excellent: 'Excelente',
    good: 'Bueno',
    fair: 'Regular',
    poor: 'Malo',
    damaged: 'Dañado',
    broken: 'Roto',
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-theme-card rounded-2xl p-0 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-theme-border shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="sticky top-0 z-40 relative isolate border-b border-theme-border px-6 py-4 flex justify-between items-center shadow-sm"
          style={{ backgroundColor: 'var(--theme-bg)' }}
        >
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-theme-text">
              Detalles del Equipo
            </h2>
            <p className="text-sm text-theme-secondary">{item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-theme-bg border border-theme-border text-theme-secondary hover:text-theme-text hover:border-theme-accent/50 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {item.image_url && (
            <div className="mb-6">
              <Image
                src={item.image_url}
                alt={item.name}
                width={600}
                height={280}
                className="w-full h-52 object-cover rounded-xl border border-theme-border"
              />
            </div>
          )}

          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-theme-border bg-theme-bg text-theme-text">
                {getConditionIcon(item.condition)}
                {conditionLabels[item.condition]}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${item.available_quantity > 0
                  ? 'text-green-700 border-green-300 bg-green-100 dark:text-green-400 dark:border-green-500/30 dark:bg-green-500/10'
                  : 'text-red-700 border-red-300 bg-red-100 dark:text-red-400 dark:border-red-500/30 dark:bg-red-500/10'
                  }`}
              >
                {item.available_quantity > 0 ? 'Disponible' : 'No disponible'}
              </span>
            </div>

            {item.description && (
              <div className="rounded-xl border border-theme-border bg-theme-bg p-4">
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Descripción
                </label>
                <p className="text-theme-text leading-relaxed">{item.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-theme-border bg-theme-bg p-3">
                <label className="block text-xs font-medium text-theme-secondary mb-1">
                  Categoría
                </label>
                <p className="text-theme-text font-medium">{item.category}</p>
              </div>

              <div className="rounded-xl border border-theme-border bg-theme-bg p-3">
                <label className="block text-xs font-medium text-theme-secondary mb-1">
                  Disponibilidad
                </label>
                <p className="text-theme-text font-medium">
                  {item.available_quantity} de {item.quantity} disponibles
                </p>
              </div>

              {item.brand && (
                <div className="rounded-xl border border-theme-border bg-theme-bg p-3">
                  <label className="block text-xs font-medium text-theme-secondary mb-1">
                    Marca
                  </label>
                  <p className="text-theme-text font-medium">{item.brand}</p>
                </div>
              )}

              {item.model && (
                <div className="rounded-xl border border-theme-border bg-theme-bg p-3">
                  <label className="block text-xs font-medium text-theme-secondary mb-1">
                    Modelo
                  </label>
                  <p className="text-theme-text font-medium">{item.model}</p>
                </div>
              )}

              {item.serial_number && (
                <div className="rounded-xl border border-theme-border bg-theme-bg p-3">
                  <label className="block text-xs font-medium text-theme-secondary mb-1">
                    Número de Serie
                  </label>
                  <p className="text-theme-text font-medium">{item.serial_number}</p>
                </div>
              )}

              {item.location && (
                <div className="rounded-xl border border-theme-border bg-theme-bg p-3">
                  <label className="block text-xs font-medium text-theme-secondary mb-1">
                    Ubicación
                  </label>
                  <p className="text-theme-text font-medium">{item.location}</p>
                </div>
              )}

              {item.purchase_date && (
                <div className="rounded-xl border border-theme-border bg-theme-bg p-3">
                  <label className="block text-xs font-medium text-theme-secondary mb-1">
                    Fecha de Compra
                  </label>
                  <p className="text-theme-text font-medium">{item.purchase_date}</p>
                </div>
              )}

              {item.purchase_price !== null && item.purchase_price !== undefined && (
                <div className="rounded-xl border border-theme-border bg-theme-bg p-3">
                  <label className="block text-xs font-medium text-theme-secondary mb-1">
                    Precio de Compra
                  </label>
                  <p className="text-theme-text font-medium">${item.purchase_price}</p>
                </div>
              )}
            </div>

            {(specificationsView.entries.length > 0 || specificationsView.plainText) && (
              <div className="rounded-xl border border-theme-border bg-theme-bg p-4">
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Especificaciones
                </label>
                {specificationsView.entries.length > 0 ? (
                  <div className="bg-theme-card border border-theme-border rounded-lg p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {specificationsView.entries.map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-xs font-medium text-theme-secondary mb-1 capitalize">
                            {key.replace(/_/g, ' ')}
                          </label>
                          <p className="text-sm text-theme-text break-words">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-theme-card border border-theme-border rounded-lg p-3">
                    <p className="text-sm text-theme-text whitespace-pre-wrap break-words">
                      {specificationsView.plainText}
                    </p>
                  </div>
                )}
              </div>
            )}

            {item.notes && (
              <div className="rounded-xl border border-theme-border bg-theme-bg p-4">
                <label className="block text-sm font-medium text-theme-secondary mb-1">
                  Notas
                </label>
                <p className="text-theme-text whitespace-pre-wrap">{item.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal para agregar nuevo equipo
function AddItemModal({ onAdd, onClose }: {
  onAdd: (item: Omit<SupabaseEquipment, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '', category: '', description: '',
    quantity: 1, available_quantity: 1,
    condition: 'good' as SupabaseEquipment['condition'],
    location: '', brand: '', model: '', serial_number: '',
    purchase_date: '', purchase_price: 0,
    specifications: '', image_url: '', notes: '', is_loanable: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: formData.name, category: formData.category,
      description: formData.description || undefined,
      quantity: formData.quantity, available_quantity: formData.available_quantity,
      condition: formData.condition, location: formData.location || undefined,
      brand: formData.brand || undefined, model: formData.model || undefined,
      serial_number: formData.serial_number || undefined,
      purchase_date: formData.purchase_date || undefined,
      purchase_price: formData.purchase_price || undefined,
      specifications: formData.specifications || null,
      image_url: formData.image_url || undefined,
      notes: formData.notes || undefined, is_loanable: formData.is_loanable,
    });
  };

  const inputClass = "w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg";
  const labelClass = "block text-xs font-semibold text-theme-secondary uppercase tracking-wide mb-1.5";
  useEffect(() => {
  document.documentElement.style.overflow = 'hidden';
  return () => {
    document.documentElement.style.overflow = '';
  };
}, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="border border-theme-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-container"
        style={{ backgroundColor: 'var(--modal-bg)' }}
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-theme-border sticky top-0 z-10"
          style={{ backgroundColor: 'var(--modal-bg)' }}>
          <h2 className="text-xl font-semibold text-theme-text">Agregar Nuevo Equipo</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-theme-secondary hover:bg-theme-accent/10 hover:text-theme-text transition-colors">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre *</label>
              <input type="text" required value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Categoría *</label>
              <input type="text" required value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Descripción</label>
            <textarea value={formData.description} rows={3}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={inputClass + ' resize-none'} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Cantidad Total *</label>
              <input type="number" required min="1" value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value), available_quantity: Math.min(formData.available_quantity, parseInt(e.target.value)) })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cantidad Disponible *</label>
              <input type="number" required min="0" max={formData.quantity} value={formData.available_quantity}
                onChange={(e) => setFormData({ ...formData, available_quantity: parseInt(e.target.value) })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Condición *</label>
              <select value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as SupabaseEquipment['condition'] })}
                className={inputClass}>
                <option value="excellent">Excelente</option>
                <option value="good">Bueno</option>
                <option value="fair">Regular</option>
                <option value="poor">Malo</option>
                <option value="damaged">Dañado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Ubicación</label>
              <input type="text" value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Marca</label>
              <input type="text" value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Modelo</label>
              <input type="text" value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Número de Serie</label>
              <input type="text" value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Fecha de Compra</label>
              <input type="date" value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Precio de Compra</label>
              <input type="number" step="0.01" min="0" value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) })}
                className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>URL de Imagen</label>
            <input type="url" value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Especificaciones (JSON)</label>
            <textarea value={formData.specifications} rows={3}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              placeholder='{"campo": "valor","otro_campo":"otro_valor"}'
              className={inputClass + ' resize-none'} />
          </div>

          <div>
            <label className={labelClass}>Notas</label>
            <textarea value={formData.notes} rows={3}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={inputClass + ' resize-none'} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_loanable" checked={formData.is_loanable}
              onChange={(e) => setFormData({ ...formData, is_loanable: e.target.checked })}
              className="rounded border-theme-border" />
            <label htmlFor="is_loanable" className="text-sm text-theme-secondary">Disponible para préstamo</label>
          </div>

          <div className="flex gap-3 pt-2 pb-1 border-t border-theme-border">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-red-500/50 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-bright-blue to-neon-pink py-2.5 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-opacity cursor-pointer">
              Agregar Equipo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditItemModal({ item, onEdit, onClose }: {
  item: SupabaseEquipment;
  onEdit: (item: Omit<SupabaseEquipment, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: item.name, category: item.category,
    description: item.description || '',
    quantity: item.quantity, available_quantity: item.available_quantity,
    condition: item.condition, location: item.location || '',
    brand: item.brand || '', model: item.model || '',
    serial_number: item.serial_number || '',
    purchase_date: item.purchase_date || '',
    purchase_price: item.purchase_price || 0,
    specifications: typeof item.specifications === 'string'
      ? item.specifications
      : JSON.stringify(item.specifications || {}, null, 2),
    image_url: item.image_url || '', notes: item.notes || '',
    is_loanable: item.is_loanable,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit({
      name: formData.name, category: formData.category,
      description: formData.description || undefined,
      quantity: formData.quantity, available_quantity: formData.available_quantity,
      condition: formData.condition, location: formData.location || undefined,
      brand: formData.brand || undefined, model: formData.model || undefined,
      serial_number: formData.serial_number || undefined,
      purchase_date: formData.purchase_date || undefined,
      purchase_price: formData.purchase_price || undefined,
      specifications: formData.specifications || null,
      image_url: formData.image_url || undefined,
      notes: formData.notes || undefined, is_loanable: formData.is_loanable,
    });
  };

  const inputClass = "w-full rounded-lg border border-theme-border px-3 py-2.5 text-sm text-theme-text placeholder-theme-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all bg-theme-bg";
  const labelClass = "block text-xs font-semibold text-theme-secondary uppercase tracking-wide mb-1.5";
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="border border-theme-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-container"
        style={{ backgroundColor: 'var(--modal-bg)' }}
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-theme-border sticky top-0 z-10"
          style={{ backgroundColor: 'var(--modal-bg)' }}>
          <h2 className="text-xl font-semibold text-theme-text">Editar Equipo</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-theme-secondary hover:bg-theme-accent/10 hover:text-theme-text transition-colors">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre *</label>
              <input type="text" required value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Categoría *</label>
              <input type="text" required value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Descripción</label>
            <textarea value={formData.description} rows={3}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={inputClass + ' resize-none'} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Cantidad Total *</label>
              <input type="number" required min="1" value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value), available_quantity: Math.min(formData.available_quantity, parseInt(e.target.value)) })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cantidad Disponible *</label>
              <input type="number" required min="0" max={formData.quantity} value={formData.available_quantity}
                onChange={(e) => setFormData({ ...formData, available_quantity: parseInt(e.target.value) })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Condición *</label>
              <select value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as SupabaseEquipment['condition'] })}
                className={inputClass}>
                <option value="excellent">Excelente</option>
                <option value="good">Bueno</option>
                <option value="fair">Regular</option>
                <option value="poor">Malo</option>
                <option value="damaged">Dañado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Ubicación</label>
              <input type="text" value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Marca</label>
              <input type="text" value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Modelo</label>
              <input type="text" value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Número de Serie</label>
              <input type="text" value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Fecha de Compra</label>
              <input type="date" value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Precio de Compra</label>
              <input type="number" step="0.01" min="0" value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) })}
                className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>URL de Imagen</label>
            <input type="url" value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Especificaciones (JSON)</label>
            <textarea value={formData.specifications} rows={3}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              placeholder='{"campo": "valor"}'
              className={inputClass + ' resize-none'} />
          </div>

          <div>
            <label className={labelClass}>Notas</label>
            <textarea value={formData.notes} rows={3}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={inputClass + ' resize-none'} />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_loanable_edit" checked={formData.is_loanable}
              onChange={(e) => setFormData({ ...formData, is_loanable: e.target.checked })}
              className="rounded border-theme-border" />
            <label htmlFor="is_loanable_edit" className="text-sm text-theme-secondary">Disponible para préstamo</label>
          </div>

          <div className="flex gap-3 pt-2 pb-1 border-t border-theme-border">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-red-500/50 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-bright-blue to-neon-pink py-2.5 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-opacity cursor-pointer">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}