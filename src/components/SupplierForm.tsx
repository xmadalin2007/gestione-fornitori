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
    <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="date" className="block text-sm font-medium text-gray-900 mb-1.5">
              Data *
            </label>
            <div>
              <input
                type="date"
                name="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full rounded-lg border-0 py-3 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-base"
                required
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-900 mb-1.5">
              Fornitore *
            </label>
            <div>
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
                className="block w-full rounded-lg border-0 py-3 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-base"
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

          <div className="col-span-1 sm:col-span-3">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-900 mb-1.5">
              Importo *
            </label>
            <div>
              <input
                type="number"
                inputMode="decimal"
                name="amount"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="block w-full rounded-lg border-0 py-3 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-base"
                required
              />
            </div>
          </div>

          <div className="col-span-1 sm:col-span-3">
            <label htmlFor="payment-method" className="block text-sm font-medium text-gray-900 mb-1.5">
              Metodo di Pagamento *
            </label>
            <div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('contanti')}
                  className={`py-3 px-3 rounded-lg text-base font-medium text-center ${
                    paymentMethod === 'contanti'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Contanti
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bonifico')}
                  className={`py-3 px-3 rounded-lg text-base font-medium text-center ${
                    paymentMethod === 'bonifico'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bonifico
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-1 sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1.5">
              Descrizione
            </label>
            <div>
              <input
                type="text"
                name="description"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrizione (opzionale)"
                className="block w-full rounded-lg border-0 py-3 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-base"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-4 bg-gray-50 px-4 py-4 sm:px-6">
        {editingEntry && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-100"
          >
            Annulla
          </button>
        )}
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-base font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 w-full sm:w-auto"
        >
          {editingEntry ? 'Salva Modifiche' : 'Aggiungi Spesa'}
        </button>
      </div>
    </form>
  );
} 