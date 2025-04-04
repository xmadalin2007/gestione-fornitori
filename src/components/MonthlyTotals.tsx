'use client';

import { useMemo, useState } from 'react';
import type { Entry } from './Dashboard';
import type { Supplier } from './SupplierManagement';
import SearchBar from './SearchBar';

interface MonthlyTotalsProps {
  entries: Entry[];
  suppliers: Supplier[];
}

interface MonthlyData {
  [month: string]: {
    contanti: number;
    bonifico: number;
    total: number;
    bySupplier: {
      [supplierId: string]: {
        name: string;
        amount: number;
        entries: Entry[];
      };
    };
  };
}

const monthNames = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

export default function MonthlyTotals({ entries, suppliers }: MonthlyTotalsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Creiamo un dizionario dei fornitori per accesso rapido
  const suppliersMap = useMemo(() => {
    const map: { [key: string]: Supplier } = {};
    suppliers.forEach(supplier => {
      map[supplier.id] = supplier;
    });
    return map;
  }, [suppliers]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery) return entries;

    const query = searchQuery.toLowerCase();
    return entries.filter(entry => {
      const supplier = suppliersMap[entry.supplierId];
      const supplierName = supplier?.name.toLowerCase() || '';
      const description = entry.description.toLowerCase();
      
      return supplierName.includes(query) || description.includes(query);
    });
  }, [entries, suppliersMap, searchQuery]);

  const monthlyData = useMemo(() => {
    const data: MonthlyData = {};
    
    // Inizializza i dati per tutti i mesi
    monthNames.forEach((_, index) => {
      data[index + 1] = {
        contanti: 0,
        bonifico: 0,
        total: 0,
        bySupplier: {}
      };
    });

    // Popola i dati
    filteredEntries.forEach(entry => {
      const month = new Date(entry.date).getMonth() + 1;
      const monthData = data[month];

      // Aggiorna i totali per metodo di pagamento
      if (entry.paymentMethod === 'contanti') {
        monthData.contanti += Number(entry.amount);
      } else if (entry.paymentMethod === 'bonifico') {
        monthData.bonifico += Number(entry.amount);
      }
      monthData.total += Number(entry.amount);

      // Aggiorna i totali per fornitore
      if (!monthData.bySupplier[entry.supplierId]) {
        const supplier = suppliersMap[entry.supplierId];
        monthData.bySupplier[entry.supplierId] = {
          name: supplier ? supplier.name : 'Fornitore non trovato',
          amount: 0,
          entries: []
        };
      }
      monthData.bySupplier[entry.supplierId].amount += Number(entry.amount);
      monthData.bySupplier[entry.supplierId].entries.push(entry);
    });

    return data;
  }, [filteredEntries, suppliersMap]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Totali Mensili</h2>
        <div className="w-96">
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </div>
      
      {monthNames.map((monthName, index) => {
        const monthData = monthlyData[index + 1];
        const hasData = monthData.total > 0;

        if (!hasData) return null;

        return (
          <div key={monthName} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{monthName}</h3>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Contanti</h4>
                  <p className="text-2xl font-bold text-blue-600">{monthData.contanti.toFixed(2)} €</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Bonifico</h4>
                  <p className="text-2xl font-bold text-green-600">{monthData.bonifico.toFixed(2)} €</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Totale Mese</h4>
                  <p className="text-2xl font-bold text-purple-600">{monthData.total.toFixed(2)} €</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Dettaglio per Fornitore</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(monthData.bySupplier).map(([supplierId, data]) => (
                    <div key={supplierId} className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-500">{data.name}</h5>
                      <p className="text-lg font-semibold text-gray-900">{data.amount.toFixed(2)} €</p>
                      {data.entries.map(entry => (
                        <div key={entry.id} className="mt-2 text-sm text-gray-500">
                          {entry.description || 'Nessuna descrizione'} - {new Date(entry.date).toLocaleDateString()} - {entry.paymentMethod}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 