'use client';

import { useState } from 'react';

export interface Supplier {
  id: string;
  name: string;
  defaultPaymentMethod: 'contanti' | 'bonifico';
}

export interface SupplierManagementProps {
  suppliers: Supplier[];
  onUpdate: (updatedSuppliers: Supplier[]) => Promise<void>;
}

export default function SupplierManagement({ suppliers, onUpdate }: SupplierManagementProps) {
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [name, setName] = useState('');
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<'contanti' | 'bonifico'>('contanti');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verifica che non ci siano fornitori con lo stesso nome (escluso quello in modifica)
    const isDuplicate = suppliers.some(
      supplier => 
        supplier.name.toLowerCase() === name.toLowerCase() && 
        (!editingSupplier || supplier.id !== editingSupplier.id)
    );

    if (isDuplicate) {
      setError('Esiste già un fornitore con questo nome');
      return;
    }

    if (editingSupplier) {
      // Modifica fornitore esistente
      const updatedSuppliers = suppliers.map(supplier =>
        supplier.id === editingSupplier.id
          ? { ...supplier, name, defaultPaymentMethod }
          : supplier
      );
      onUpdate(updatedSuppliers);
    } else {
      // Aggiungi nuovo fornitore
      const newSupplier: Supplier = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        defaultPaymentMethod
      };
      onUpdate([...suppliers, newSupplier]);
    }

    // Reset form
    setName('');
    setDefaultPaymentMethod('contanti');
    setEditingSupplier(null);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setName(supplier.name);
    setDefaultPaymentMethod(supplier.defaultPaymentMethod);
  };

  const handleDelete = (supplierId: string) => {
    const updatedSuppliers = suppliers.filter(supplier => supplier.id !== supplierId);
    onUpdate(updatedSuppliers);
  };

  const handleCancel = () => {
    setEditingSupplier(null);
    setName('');
    setDefaultPaymentMethod('contanti');
    setError('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome Fornitore
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="defaultPaymentMethod" className="block text-sm font-medium text-gray-700">
            Metodo di Pagamento Predefinito
          </label>
          <select
            id="defaultPaymentMethod"
            value={defaultPaymentMethod}
            onChange={(e) => setDefaultPaymentMethod(e.target.value as 'contanti' | 'bonifico')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="contanti">Contanti</option>
            <option value="bonifico">Bonifico</option>
          </select>
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex space-x-2">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {editingSupplier ? 'Salva Modifiche' : 'Aggiungi Fornitore'}
          </button>
          {editingSupplier && (
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annulla
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {supplier.name}
              </p>
              <p className="text-sm text-gray-500">
                {supplier.defaultPaymentMethod === 'contanti' ? 'Contanti' : 'Bonifico'}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(supplier)}
                className="text-blue-600 hover:text-blue-900"
              >
                Modifica
              </button>
              <button
                onClick={() => handleDelete(supplier.id)}
                className="text-red-600 hover:text-red-900"
              >
                Elimina
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 