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
  const [expandedSuppliers, setExpandedSuppliers] = useState<{[key: string]: boolean}>({});

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

    // Debug
    console.log('Elaborazione entries per totali mensili:', filteredEntries);

    // Popola i dati
    filteredEntries.forEach(entry => {
      // Assicuriamoci che la data sia in formato valido
      const dateObj = new Date(entry.date);
      if (isNaN(dateObj.getTime())) {
        console.error('Data non valida:', entry.date, 'per entry:', entry);
        return; // Salta questa entry
      }

      const month = dateObj.getMonth() + 1;
      console.log(`Entry ${entry.id}: data=${entry.date}, mese=${month}`);
      
      const monthData = data[month];
      if (!monthData) {
        console.error('Mese non trovato:', month, 'per data:', entry.date);
        return; // Salta questa entry
      }

      // Convertiamo l'importo in numero per sicurezza
      const amount = Number(entry.amount);
      if (isNaN(amount)) {
        console.error('Importo non valido:', entry.amount, 'per entry:', entry);
        return; // Salta questa entry
      }

      // Aggiorna i totali per metodo di pagamento
      if (entry.paymentMethod === 'contanti') {
        monthData.contanti += amount;
      } else if (entry.paymentMethod === 'bonifico') {
        monthData.bonifico += amount;
      }
      monthData.total += amount;

      // Aggiorna i totali per fornitore
      if (!monthData.bySupplier[entry.supplierId]) {
        const supplier = suppliersMap[entry.supplierId];
        monthData.bySupplier[entry.supplierId] = {
          name: supplier ? supplier.name : 'Fornitore non trovato',
          amount: 0,
          entries: []
        };
      }
      monthData.bySupplier[entry.supplierId].amount += amount;
      monthData.bySupplier[entry.supplierId].entries.push(entry);
    });

    filteredEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return data;
  }, [filteredEntries, suppliersMap]);

  const annualTotals = useMemo(() => {
    const totals: {[key: string]: {contanti: number, bonifico: number, total: number, name: string}} = {};
    
    filteredEntries.forEach(entry => {
      if (!totals[entry.supplierId]) {
        totals[entry.supplierId] = {
          contanti: 0,
          bonifico: 0,
          total: 0,
          name: suppliersMap[entry.supplierId]?.name || 'Fornitore non trovato'
        };
      }
      
      const amount = Number(entry.amount);
      if (entry.paymentMethod === 'contanti') {
        totals[entry.supplierId].contanti += amount;
      } else if (entry.paymentMethod === 'bonifico') {
        totals[entry.supplierId].bonifico += amount;
      }
      totals[entry.supplierId].total += amount;
    });
    
    return totals;
  }, [filteredEntries, suppliersMap]);

  const toggleSupplier = (supplierId: string) => {
    setExpandedSuppliers(prev => ({
      ...prev,
      [supplierId]: !prev[supplierId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Totali Mensili</h2>
        <div className="w-full sm:w-96">
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Totali Annuali per Fornitore</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Object.entries(annualTotals).map(([supplierId, data]) => (
              <div key={supplierId} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h4 className="text-base font-medium text-gray-900 mb-2">{data.name}</h4>
                <div className="space-y-2">
                  <div className="bg-blue-50 p-2 rounded">
                    <span className="text-sm text-gray-600">Contanti:</span>
                    <span className="float-right font-semibold text-blue-600">{data.contanti.toFixed(2)} €</span>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <span className="text-sm text-gray-600">Bonifico:</span>
                    <span className="float-right font-semibold text-green-600">{data.bonifico.toFixed(2)} €</span>
                  </div>
                  <div className="bg-purple-50 p-2 rounded">
                    <span className="text-sm text-gray-600">Totale:</span>
                    <span className="float-right font-semibold text-purple-600">{data.total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {[...monthNames].reverse().map((monthName, reversedIndex) => {
        const index = 11 - reversedIndex; // Trasformiamo l'indice (11=dicembre, 0=gennaio)
        const monthData = monthlyData[index + 1];
        const hasData = monthData.total > 0;

        if (!hasData) return null;

        return (
          <div key={monthName} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{monthName}</h3>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Contanti</h4>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{monthData.contanti.toFixed(2)} €</p>
                </div>
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Bonifico</h4>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{monthData.bonifico.toFixed(2)} €</p>
                </div>
                <div className="bg-purple-50 p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1">
                  <h4 className="text-sm font-medium text-gray-500">Totale Mese</h4>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">{monthData.total.toFixed(2)} €</p>
                </div>
              </div>

              <div className="mt-6">
                <button 
                  onClick={() => Object.keys(monthData.bySupplier).forEach(id => toggleSupplier(`${monthName}-${id}`))}
                  className="w-full text-left flex items-center justify-between text-base sm:text-lg font-medium text-gray-900 mb-4 hover:text-gray-700"
                >
                  <span>Dettaglio per Fornitore</span>
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4`}>
                  {Object.entries(monthData.bySupplier).map(([supplierId, data]) => {
                    const supplierKey = `${monthName}-${supplierId}`;
                    const isExpanded = expandedSuppliers[supplierKey];
                    
                    return (
                      <div key={supplierId} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <button 
                          onClick={() => toggleSupplier(supplierKey)}
                          className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2"
                        >
                          <h5 className="text-sm font-medium text-gray-700">{data.name}</h5>
                          <p className="text-base sm:text-lg font-semibold text-gray-900">{data.amount.toFixed(2)} €</p>
                        </button>
                        <div className={`space-y-2 ${isExpanded ? '' : 'hidden'}`}>
                          {data.entries.map(entry => (
                            <div key={entry.id} className="text-sm text-gray-600 bg-white rounded p-2 shadow-sm">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <span className="font-medium">{entry.description || 'Nessuna descrizione'}</span>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="bg-gray-100 px-2 py-1 rounded">
                                    {new Date(entry.date).toLocaleDateString()}
                                  </span>
                                  <span className={`px-2 py-1 rounded ${
                                    entry.paymentMethod === 'contanti' 
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    {entry.paymentMethod}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 