'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  status: 'available' | 'in-use' | 'maintenance' | 'damaged';
  description?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  lastMaintenance?: string;
  assignedTo?: string;
  notes?: string;
}

interface InventoryContextType {
  items: InventoryItem[];
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  getItem: (id: string) => InventoryItem | undefined;
  searchItems: (query: string) => InventoryItem[];
  filterByCategory: (category: string) => InventoryItem[];
  filterByStatus: (status: InventoryItem['status']) => InventoryItem[];
  isLoading: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

// Datos hardcodeados para demostración
const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'MacBook Pro 16"',
    category: 'Laptops',
    quantity: 3,
    location: 'Lab Principal',
    status: 'available',
    description: 'MacBook Pro 16 pulgadas para desarrollo',
    brand: 'Apple',
    model: 'MacBook Pro M2',
    serialNumber: 'MBP001',
    purchaseDate: '2024-01-15',
    lastMaintenance: '2024-11-01',
  },
  {
    id: '2',
    name: 'Arduino Uno R3',
    category: 'Microcontroladores',
    quantity: 15,
    location: 'Estante A-2',
    status: 'available',
    description: 'Placa de desarrollo Arduino para prototipado',
    brand: 'Arduino',
    model: 'Uno R3',
    serialNumber: 'ARD001-015',
  },
  {
    id: '3',
    name: 'Raspberry Pi 4',
    category: 'Single Board Computers',
    quantity: 8,
    location: 'Gabinete B-1',
    status: 'available',
    description: 'Computadora de placa única para proyectos IoT',
    brand: 'Raspberry Pi Foundation',
    model: 'Pi 4 Model B',
    serialNumber: 'RPI001-008',
  },
  {
    id: '4',
    name: 'Monitor 4K Dell',
    category: 'Monitores',
    quantity: 2,
    location: 'Escritorio 1',
    status: 'in-use',
    description: 'Monitor 4K de 27 pulgadas',
    brand: 'Dell',
    model: 'U2720Q',
    serialNumber: 'MON001',
    assignedTo: 'Proyecto Smart Parking',
  },
  {
    id: '5',
    name: 'Sensor Ultrasónico HC-SR04',
    category: 'Sensores',
    quantity: 25,
    location: 'Cajón C-3',
    status: 'available',
    description: 'Sensor de distancia ultrasónico',
    brand: 'Generic',
    model: 'HC-SR04',
    serialNumber: 'SENS001-025',
  },
  {
    id: '6',
    name: 'Impresora 3D Ender 3',
    category: 'Impresión 3D',
    quantity: 1,
    location: 'Mesa de Impresión',
    status: 'maintenance',
    description: 'Impresora 3D para prototipado rápido',
    brand: 'Creality',
    model: 'Ender 3 V2',
    serialNumber: '3DP001',
    lastMaintenance: '2024-12-01',
    notes: 'Requiere calibración del extrusor',
  },
  {
    id: '7',
    name: 'Multímetro Digital',
    category: 'Instrumentos de Medición',
    quantity: 4,
    location: 'Gabinete A-1',
    status: 'available',
    description: 'Multímetro digital para mediciones eléctricas',
    brand: 'Fluke',
    model: '117',
    serialNumber: 'MULT001-004',
  },
  {
    id: '8',
    name: 'Cámara ESP32-CAM',
    category: 'Cámaras',
    quantity: 6,
    location: 'Estante B-3',
    status: 'available',
    description: 'Módulo de cámara con ESP32 integrado',
    brand: 'Espressif',
    model: 'ESP32-CAM',
    serialNumber: 'CAM001-006',
  },
  {
    id: '9',
    name: 'Protoboard Grande',
    category: 'Componentes',
    quantity: 12,
    location: 'Cajón A-4',
    status: 'available',
    description: 'Protoboard de 830 puntos',
    brand: 'Generic',
    model: 'MB-102',
    serialNumber: 'PROTO001-012',
  },
  {
    id: '10',
    name: 'Tablet Samsung Galaxy',
    category: 'Tablets',
    quantity: 1,
    location: 'Escritorio 2',
    status: 'damaged',
    description: 'Tablet para interfaces móviles',
    brand: 'Samsung',
    model: 'Galaxy Tab A8',
    serialNumber: 'TAB001',
    notes: 'Pantalla agrietada, pendiente de reparación',
  },
];

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [isLoading, setIsLoading] = useState(false);

  const addItem = useCallback((newItem: Omit<InventoryItem, 'id'>) => {
    setIsLoading(true);
    // Simular delay de red
    setTimeout(() => {
      const id = Date.now().toString();
      setItems((prev) => [...prev, { ...newItem, id }]);
      setIsLoading(false);
    }, 300);
  }, []);

  const updateItem = useCallback(
    (id: string, updates: Partial<InventoryItem>) => {
      setIsLoading(true);
      setTimeout(() => {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
        );
        setIsLoading(false);
      }, 200);
    },
    []
  );

  const deleteItem = useCallback((id: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setIsLoading(false);
    }, 200);
  }, []);

  const getItem = useCallback(
    (id: string) => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  const searchItems = useCallback(
    (query: string) => {
      if (!query.trim()) return items;

      const lowerQuery = query.toLowerCase();
      return items.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerQuery) ||
          item.category.toLowerCase().includes(lowerQuery) ||
          item.brand?.toLowerCase().includes(lowerQuery) ||
          item.model?.toLowerCase().includes(lowerQuery) ||
          item.description?.toLowerCase().includes(lowerQuery) ||
          item.location.toLowerCase().includes(lowerQuery)
      );
    },
    [items]
  );

  const filterByCategory = useCallback(
    (category: string) => {
      if (!category) return items;
      return items.filter((item) => item.category === category);
    },
    [items]
  );

  const filterByStatus = useCallback(
    (status: InventoryItem['status']) => {
      return items.filter((item) => item.status === status);
    },
    [items]
  );

  const value: InventoryContextType = {
    items,
    addItem,
    updateItem,
    deleteItem,
    getItem,
    searchItems,
    filterByCategory,
    filterByStatus,
    isLoading,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
