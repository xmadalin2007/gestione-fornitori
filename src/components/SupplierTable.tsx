'use client';

import { useMemo } from 'react';
import type { Supplier } from './SupplierManagement';
import type { Entry } from './Dashboard';

interface SupplierTableProps {
  entries: Entry[];
  suppliers: Supplier[];
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
}

export default function SupplierTable({
  entries,
  suppliers,
  onEdit,
  onDelete
}: SupplierTableProps) {
  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Fornitore non trovato';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Errore nel formato della data:', error);
      return dateString;
    }
  };

  const formatAmount = (amount: number) => {
    try {
      return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
    } catch (error) {
      console.error('Errore nella formattazione dell\'importo:', error);
      return `€${amount.toFixed(2)}`;
    }
  };

  // Calcola il totale delle spese
  const totalAmount = useMemo(() => {
    return entries.reduce((total, entry) => total + (entry.amount || 0), 0);
  }, [entries]);

  return (
    <div className="mt-8 flex flex-col">
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Data
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Fornitore
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Importo
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Descrizione
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Metodo
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Azioni</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {formatDate(entry.date)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {getSupplierName(entry.supplierId)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatAmount(entry.amount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {entry.description}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {entry.paymentMethod === 'contanti' ? 'Contanti' : 'Bonifico'}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => onEdit(entry)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Modifica
                      </button>
                      <button
                        onClick={() => onDelete(entry)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={2} className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Totale
                  </td>
                  <td className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    {formatAmount(totalAmount)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 
