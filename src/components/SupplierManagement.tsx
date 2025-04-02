'use client';

import { useState } from 'react';
import type { Supplier } from '@/components/Dashboard';

interface SupplierManagementProps {
  suppliers: Supplier[];
  onUpdateSuppliers: (suppliers: Supplier[]) => void;
}

export default function SupplierManagement({ suppliers, onUpdateSuppliers }: SupplierManagementProps) {
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [name, setName] = useState('');
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<'contanti' | 'bonifico'>('contanti');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (editingSupplier) {
      // Modifica fornitore esistente
      const updatedSuppliers = suppliers.map(s => 
        s.id === editingSupplier.id 
          ? { ...s, name, defaultPaymentMethod }
          : s
      );
      onUpdateSuppliers(updatedSuppliers);
      setEditingSupplier(null);
    } else {
      // Aggiungi nuovo fornitore
      const newSupplier: Supplier = {
        name,
        defaultPaymentMethod,
        id: crypto.randomUUID() // Generiamo un ID temporaneo
      };
      onUpdateSuppliers([...suppliers, newSupplier]);
    }

    // Reset form
    setName('');
    setDefaultPaymentMethod('contanti');
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setName(supplier.name);
    setDefaultPaymentMethod(supplier.defaultPaymentMethod);
  };

  const handleDelete = (supplierId: string) => {
    const updatedSuppliers = suppliers.filter(s => s.id !== supplierId);
    onUpdateSuppliers(updatedSuppliers);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Gestione Fornitori
        </h3>
        <div className="mt-5">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="defaultPaymentMethod" className="block text-sm font-medium text-gray-700">
                  Metodo di Pagamento Predefinito
                </label>
                <select
                  id="defaultPaymentMethod"
                  value={defaultPaymentMethod}
                  onChange={(e) => setDefaultPaymentMethod(e.target.value as 'contanti' | 'bonifico')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="contanti">Contanti</option>
                  <option value="bonifico">Bonifico</option>
                </select>
              </div>

              {error && (
                <div className="sm:col-span-6">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="sm:col-span-6">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingSupplier ? 'Modifica' : 'Aggiungi'} Fornitore
                </button>
              </div>
            </div>
          </form>

          <div className="mt-8">
            <h4 className="text-sm font-medium text-gray-900">Fornitori Esistenti</h4>
            <div className="mt-4">
              <ul className="divide-y divide-gray-200">
                {suppliers.map((supplier) => (
                  <li key={supplier.id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{supplier.name}</p>
                      <p className="text-sm text-gray-500">
                        Pagamento: {supplier.defaultPaymentMethod === 'contanti' ? 'Contanti' : 'Bonifico'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(supplier)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Modifica
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(supplier.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Elimina
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 