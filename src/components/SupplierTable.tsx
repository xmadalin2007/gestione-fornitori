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

export default function SupplierTable({ entries, suppliers, onEdit, onDelete }: SupplierTableProps) {
  // Creiamo un dizionario dei fornitori per accesso rapido
  const suppliersMap = useMemo(() => {
    return suppliers.reduce((acc, supplier) => {
      acc[supplier.id] = supplier;
      return acc;
    }, {} as Record<string, Supplier>);
  }, [suppliers]);

  // Calcola il totale
  const total = useMemo(() => {
    return entries.reduce((sum, entry) => sum + entry.amount, 0);
  }, [entries]);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fornitore
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Importo
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descrizione
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Metodo
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Azioni</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.map((entry) => {
            const supplier = suppliersMap[entry.supplierId];
            return (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {supplier?.name || 'Fornitore non trovato'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.amount.toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {entry.paymentMethod === 'contanti' ? 'Contanti' : 'Bonifico'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
            );
          })}
          <tr className="bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
              Totale
            </td>
            <td></td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
              {total.toFixed(2)} €
            </td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
} 
