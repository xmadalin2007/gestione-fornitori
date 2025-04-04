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

  // Formatta la data in formato italiano
  const formatDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year.substring(2)}`;
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Versione desktop della tabella (nascosta su mobile) */}
      <div className="hidden md:block">
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
                    {formatDate(entry.date)}
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

      {/* Versione mobile con card (visibile solo su mobile) */}
      <div className="md:hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <h3 className="text-base font-semibold text-gray-900">Spese</h3>
            <div className="bg-blue-50 px-3 py-1.5 rounded-full">
              <span className="text-base font-bold text-blue-800">Totale: {total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {entries.map((entry) => {
            const supplier = suppliersMap[entry.supplierId];
            const isContanti = entry.paymentMethod === 'contanti';
            
            return (
              <div key={entry.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-gray-900">{supplier?.name || 'Fornitore non trovato'}</div>
                    <div className="flex items-center gap-1">
                      <span className={`text-base font-bold ${isContanti ? 'text-blue-700' : 'text-green-700'}`}>
                        {entry.amount.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {entry.description || '-'}
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {formatDate(entry.date)}
                      </span>
                      <span className={`text-xs ${
                        isContanti 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      } px-2 py-1 rounded-full`}>
                        {isContanti ? 'Contanti' : 'Bonifico'}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(entry)}
                        className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                        aria-label="Modifica"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(entry)}
                        className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                        aria-label="Elimina"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 
