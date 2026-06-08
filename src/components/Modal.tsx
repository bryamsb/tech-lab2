"use client";

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const sizeMap: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
};

export default function Modal({ isOpen, onClose, title, size = 'md', children, footer, className = '' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className={`${sizeMap[size] || sizeMap.md} rounded-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-sm ${className}`}>
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-theme-secondary hover:text-theme-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>

        {footer && <div className="p-4 border-t">{footer}</div>}
      </div>
    </div>
  );
}
