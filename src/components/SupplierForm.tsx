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

export default function SupplierForm({ suppliers, onSubmit, editingEntry, onCancel }: SupplierFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierId, setSupplierId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'contanti' | 'bonifico'>('contanti');

  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date);
      setSupplierId(editingEntry.supplierId);
      setAmount(editingEntry.amount.toString());
      setDescription(editingEntry.description || '');
      setPaymentMethod(editingEntry.paymentMethod);
    }
  }, [editingEntry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !supplierId || !amount) {
      alert('Per favore compila tutti i campi obbligatori');
      return;
    }

    const entry: Entry = {
      id: editingEntry?.id || crypto.randomUUID(),
      date,
      supplierId,
      amount: parseFloat(amount),
      description: description.trim(),
      paymentMethod
    };

    onSubmit(entry);

    // Reset form
    if (!editingEntry) {
      setAmount('');
      setDescription('');
      // Mantieni il fornitore e il metodo di pagamento selezionati per comodità
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
      <div className="px-4 py-6 sm:p-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">
              Data *
            </label>
            <div className="mt-2">
              <input
                type="date"
                name="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                required
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="supplier" className="block text-sm font-medium leading-6 text-gray-900">
              Fornitore *
            </label>
            <div className="mt-2">
              <select
                id="supplier"
                name="supplier"
                value={supplierId}
                onChange={(e) => {
                  setSupplierId(e.target.value);
                  const supplier = suppliers.find(s => s.id === e.target.value);
                  if (supplier) {
                    setPaymentMethod(supplier.defaultPaymentMethod);
                  }
                }}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-xs sm:text-sm sm:leading-6"
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
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="amount" className="block text-sm font-medium leading-6 text-gray-900">
              Importo *
            </label>
            <div className="mt-2">
              <input
                type="number"
                name="amount"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                required
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="payment-method" className="block text-sm font-medium leading-6 text-gray-900">
              Metodo di Pagamento *
            </label>
            <div className="mt-2">
              <select
                id="payment-method"
                name="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'contanti' | 'bonifico')}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-xs sm:text-sm sm:leading-6"
                required
              >
                <option value="contanti">Contanti</option>
                <option value="bonifico">Bonifico</option>
              </select>
            </div>
          </div>

          <div className="col-span-full">
            <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
              Descrizione
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="description"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
        {editingEntry && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Annulla
          </button>
        )}
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {editingEntry ? 'Salva Modifiche' : 'Aggiungi Spesa'}
        </button>
      </div>
    </form>
  );
} 