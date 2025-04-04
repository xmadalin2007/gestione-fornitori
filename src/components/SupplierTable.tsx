'use client';

import { useMemo } from 'react';
import type { Supplier } from './SupplierManagement';
import type { Entry } from '@/components/Dashboard';

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
  // Raggruppa le spese per fornitore
  const entriesBySupplier = useMemo(() => {
    return entries.reduce((acc, entry) => {
      const supplier = suppliers.find(s => s.id === entry.supplierId);
      if (!supplier) return acc;

      if (!acc[supplier.id]) {
        acc[supplier.id] = {
          supplier,
          entries: [],
          total: 0
        };
      }

      acc[supplier.id].entries.push(entry);
      acc[supplier.id].total += entry.amount;

      return acc;
    }, {} as Record<string, { supplier: Supplier; entries: Entry[]; total: number }>);
  }, [entries, suppliers]);

  // Calcola il totale generale
  const totalAmount = useMemo(() => {
    return Object.values(entriesBySupplier).reduce((total, { total: supplierTotal }) => total + supplierTotal, 0);
  }, [entriesBySupplier]);

  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fornitore
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Importo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metodo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrizione
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Azioni</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.values(entriesBySupplier).map(({ supplier, entries }) => (
                  entries.map((entry, index) => (
                    <tr key={`${entry.date}-${entry.supplierId}-${entry.amount}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {supplier.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString('it-IT')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        €{entry.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.paymentMethod === 'contanti' ? 'Contanti' : 'Bonifico'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => onEdit(entry)}
                          className="text-blue-600 hover:text-blue-900"
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
                  ))
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Totale
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    €{totalAmount.toFixed(2)}
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