'use client';

import { useState, useEffect } from 'react';
import type { Supplier } from './SupplierManagement';
import type { Entry } from './Dashboard';

interface SupplierFormProps {
  suppliers: Supplier[];
  onSubmit: (entry: Entry) => void;
  editingEntry: Entry | null;
  onCancel: () => void;
}

export default function SupplierForm({
  suppliers,
  onSubmit,
  editingEntry,
  onCancel
}: SupplierFormProps) {
  const [date, setDate] = useState(editingEntry?.date || new Date().toISOString().split('T')[0]);
  const [supplierId, setSupplierId] = useState(editingEntry?.supplierId || '');
  const [amount, setAmount] = useState(editingEntry?.amount?.toString() || '');
  const [description, setDescription] = useState(editingEntry?.description || '');
  const [paymentMethod, setPaymentMethod] = useState<'contanti' | 'bonifico'>(
    editingEntry?.paymentMethod || 'contanti'
  );

  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date);
      setSupplierId(editingEntry.supplierId);
      setAmount(editingEntry.amount.toString());
      setDescription(editingEntry.description);
      setPaymentMethod(editingEntry.paymentMethod);
    }
  }, [editingEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supplierId) {
      alert('Seleziona un fornitore');
      return;
    }

    const entry: Entry = {
      id: editingEntry?.id || '',
      date,
      supplierId,
      amount: parseFloat(amount),
      description,
      paymentMethod
    };

    onSubmit(entry);

    if (!editingEntry) {
      // Reset form only for new entries
      setDate(new Date().toISOString().split('T')[0]);
      setSupplierId('');
      setAmount('');
      setDescription('');
      setPaymentMethod('contanti');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Data
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
            Fornitore
          </label>
          <select
            id="supplier"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="">Seleziona un fornitore</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Importo
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descrizione
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
            Metodo di Pagamento
          </label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as 'contanti' | 'bonifico')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="contanti">Contanti</option>
            <option value="bonifico">Bonifico</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {editingEntry && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Annulla
          </button>
        )}
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {editingEntry ? 'Salva Modifiche' : 'Aggiungi Spesa'}
        </button>
      </div>
    </form>
  );
} 