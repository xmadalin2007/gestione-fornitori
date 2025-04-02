'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Supplier, Entry } from '@/types';

interface SupplierFormProps {
  suppliers: Supplier[];
  onSubmit: (entry: Entry) => void;
  editingEntry: Entry | null;
  onCancelEdit: () => void;
  selectedYear: string;
}

export default function SupplierForm({ suppliers, onSubmit, editingEntry, onCancelEdit, selectedYear }: SupplierFormProps) {
  const today = new Date();
  const formattedToday = today.toLocaleDateString('it-IT').split('/').join('-');
  const [date, setDate] = useState(formattedToday);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'contanti' | 'bonifico'>('contanti');

  // Quando editingEntry cambia, popola il form con i suoi dati
  useEffect(() => {
    if (editingEntry) {
      const [year, month, day] = editingEntry.date.split('-');
      setDate(`${day}-${month}-${year}`);
      setAmount(editingEntry.amount.toString());
      setDescription(editingEntry.description);
      setSupplierId(editingEntry.supplierId);
      setPaymentMethod(editingEntry.paymentMethod);
    }
  }, [editingEntry]);

  const selectedSupplier = useMemo(() => {
    return suppliers.find(s => s.id === supplierId);
  }, [supplierId, suppliers]);

  // Ordina i fornitori per nome
  const sortedSuppliers = useMemo(() => {
    return [...suppliers].sort((a, b) => a.name.localeCompare(b.name));
  }, [suppliers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !amount || !selectedSupplier) return;

    // Converti la data dal formato italiano (dd-mm-yyyy) al formato ISO (yyyy-mm-dd)
    const [day, month, year] = date.split('-');
    const isoDate = `${year}-${month}-${day}`;

    const newEntry: Omit<Entry, 'id'> = {
      date: isoDate,
      amount: parseFloat(amount),
      description: description,
      supplierId,
      paymentMethod
    };

    onSubmit(newEntry as Entry);

    // Reset form solo se non stiamo modificando
    if (!editingEntry) {
      setSupplierId('');
      setAmount('');
      setDescription('');
      setPaymentMethod('contanti');
    }
  };

  return (
    <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
              Fornitore
            </label>
            <select
              id="supplier"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              required
            >
              <option value="">Seleziona fornitore</option>
              {sortedSuppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.defaultPaymentMethod === 'contanti' ? 'Contanti' : 'Bonifico'}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Data
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              required
            />
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Importo
            </label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              required
            />
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descrizione
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              required
            />
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
              Metodo Pagamento
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'contanti' | 'bonifico')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="contanti">Contanti</option>
              <option value="bonifico">Bonifico</option>
            </select>
          </div>

          <div className="sm:col-span-1 flex items-end space-x-2">
            <button
              type="submit"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Salva
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 