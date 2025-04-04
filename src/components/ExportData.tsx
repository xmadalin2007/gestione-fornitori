'use client';

import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import type { Supplier } from './SupplierManagement';
import type { Entry } from '@/components/Dashboard';

type ExportDataProps = {
  entries: Entry[];
  suppliers: Supplier[];
  selectedYear?: string;
};

export default function ExportData({ entries, suppliers, selectedYear }: ExportDataProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  // Ottiene i mesi disponibili con dati dalle entries
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    const filteredEntries = selectedYear 
      ? entries.filter(entry => entry.date.startsWith(selectedYear))
      : entries;
    
    filteredEntries.forEach(entry => {
      const date = new Date(entry.date);
      if (!isNaN(date.getTime())) {
        const month = date.getMonth() + 1; // 1-12
        months.add(month.toString());
      }
    });
    
    return Array.from(months).map(m => parseInt(m, 10)).sort((a, b) => a - b);
  }, [entries, selectedYear]);

  const formatDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split('-');
    return `${day}-${month}-${year}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculateTotals = (entries: Entry[]) => {
    return entries.reduce(
      (acc, entry) => {
        if (entry.paymentMethod === 'contanti') {
          acc.contanti += entry.amount;
        } else {
          acc.bonifico += entry.amount;
        }
        acc.total += entry.amount;
        return acc;
      },
      { contanti: 0, bonifico: 0, total: 0 }
    );
  };

  const calculateSupplierTotals = (entries: Entry[]) => {
    const supplierTotals: Record<string, { contanti: number; bonifico: number; total: number }> = {};
    
    entries.forEach(entry => {
      if (!supplierTotals[entry.supplierId]) {
        supplierTotals[entry.supplierId] = { contanti: 0, bonifico: 0, total: 0 };
      }
      
      if (entry.paymentMethod === 'contanti') {
        supplierTotals[entry.supplierId].contanti += entry.amount;
      } else {
        supplierTotals[entry.supplierId].bonifico += entry.amount;
      }
      supplierTotals[entry.supplierId].total += entry.amount;
    });
    
    return supplierTotals;
  };

  // Raggruppa le spese per mese
  const groupEntriesByMonth = (entries: Entry[]) => {
    const groupedEntries: Record<string, Entry[]> = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.date);
      if (isNaN(date.getTime())) {
        console.error('Data non valida:', entry.date);
        return;
      }
      
      const month = date.getMonth() + 1; // 1-12
      const year = date.getFullYear();
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
      
      if (!groupedEntries[monthKey]) {
        groupedEntries[monthKey] = [];
      }
      
      groupedEntries[monthKey].push(entry);
    });
    
    return groupedEntries;
  };

  // Filtra le entries per un mese specifico
  const filterEntriesByMonth = (entries: Entry[], month: number) => {
    return entries.filter(entry => {
      const date = new Date(entry.date);
      if (isNaN(date.getTime())) return false;
      return date.getMonth() + 1 === month;
    });
  };

  // Ottieni il nome del mese in italiano
  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    return new Date(parseInt(year), monthIndex).toLocaleString('it-IT', { month: 'long' });
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    exportMonthlyData(month);
    setShowMonthSelector(false);
    setShowOptions(false);
  };

  const exportMonthlyData = (month: number) => {
    const filteredEntries = selectedYear 
      ? entries.filter(entry => entry.date.startsWith(selectedYear))
      : entries;
    
    const monthEntries = filterEntriesByMonth(filteredEntries, month);
    
    if (monthEntries.length === 0) {
      alert(`Nessuna spesa trovata per ${monthNames[month - 1]}`);
      return;
    }
    
    const wb = XLSX.utils.book_new();
    const year = selectedYear || new Date().getFullYear().toString();
    const monthName = monthNames[month - 1];
    
    // Calcola i totali per il mese
    const totals = calculateTotals(monthEntries);
    const supplierTotals = calculateSupplierTotals(monthEntries);
    
    // Crea foglio riepilogo per il mese
    const summaryData = [
      [`Riepilogo ${monthName} ${year}`, ''],
      ['Totale Contanti', totals.contanti],
      ['Totale Bonifici', totals.bonifico],
      ['Totale Complessivo', totals.total],
      ['', ''],
      ['Riepilogo per Fornitore', '']
    ];
    
    Object.entries(supplierTotals).forEach(([supplierId, totals]) => {
      const supplier = suppliers.find(s => s.id === supplierId);
      if (supplier) {
        summaryData.push(
          [supplier.name, ''],
          ['Contanti', totals.contanti],
          ['Bonifici', totals.bonifico],
          ['Totale', totals.total],
          ['', '']
        );
      }
    });
    
    // Aggiungi dettaglio spese
    summaryData.push(['', '']);
    summaryData.push(['Dettaglio Spese', '']);
    summaryData.push(['Data', 'Fornitore', 'Importo', 'Metodo', 'Descrizione']);
    
    monthEntries.forEach(entry => {
      const supplier = suppliers.find(s => s.id === entry.supplierId);
      summaryData.push([
        formatDate(entry.date),
        supplier?.name || 'Fornitore sconosciuto',
        entry.amount,
        entry.paymentMethod === 'contanti' ? 'Contanti' : 'Bonifico',
        entry.description || ''
      ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws, `${monthName} ${year}`);
    XLSX.writeFile(wb, `Riepilogo_${monthName}_${year}.xlsx`);
  };

  const exportToExcel = (type: 'dettaglio' | 'riepilogo', period: 'mensile' | 'annuale') => {
    const filteredEntries = selectedYear 
      ? entries.filter(entry => entry.date.startsWith(selectedYear))
      : entries;

    if (type === 'dettaglio') {
      // Esporta dettaglio spese
      const data = filteredEntries.map(entry => {
        const supplier = suppliers.find(s => s.id === entry.supplierId);
        return {
          'Data': formatDate(entry.date),
          'Fornitore': supplier?.name || '',
          'Importo': entry.amount,
          'Metodo Pagamento': entry.paymentMethod === 'contanti' ? 'Contanti' : 'Bonifico',
          'Descrizione': entry.description
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dettaglio Spese');
      XLSX.writeFile(wb, `Dettaglio_Spese_${selectedYear || 'Completo'}.xlsx`);
      setShowOptions(false);
    } else if (period === 'mensile') {
      // Mostra selettore mese
      setShowMonthSelector(true);
    } else {
      // Riepilogo annuale
      const wb = XLSX.utils.book_new();
      const totals = calculateTotals(filteredEntries);
      const supplierTotals = calculateSupplierTotals(filteredEntries);

      // Crea foglio riepilogo generale
      const summaryData = [
        ['Riepilogo Totali Annuali', ''],
        ['Totale Contanti', totals.contanti],
        ['Totale Bonifici', totals.bonifico],
        ['Totale Complessivo', totals.total],
        ['', ''],
        ['Riepilogo per Fornitore', '']
      ];

      Object.entries(supplierTotals).forEach(([supplierId, totals]) => {
        const supplier = suppliers.find(s => s.id === supplierId);
        if (supplier) {
          summaryData.push(
            [supplier.name, ''],
            ['Contanti', totals.contanti],
            ['Bonifici', totals.bonifico],
            ['Totale', totals.total],
            ['', '']
          );
        }
      });

      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws, 'Riepilogo');
      XLSX.writeFile(wb, `Riepilogo_Annuale_${selectedYear || 'Completo'}.xlsx`);
      setShowOptions(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Esporta Excel
      </button>

      {showOptions && !showMonthSelector && (
        <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
              Dettaglio Spese
            </div>
            <button
              onClick={() => exportToExcel('dettaglio', 'annuale')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Esporta Dettaglio Completo
            </button>
            
            <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-t">
              Riepilogo
            </div>
            <button
              onClick={() => exportToExcel('riepilogo', 'mensile')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Esporta Riepilogo Mensile
            </button>
            <button
              onClick={() => exportToExcel('riepilogo', 'annuale')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Esporta Riepilogo Annuale
            </button>
          </div>
        </div>
      )}

      {showMonthSelector && (
        <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-2 px-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">Seleziona Mese</h3>
          </div>
          <div className="py-1 max-h-60 overflow-auto" role="menu" aria-orientation="vertical">
            {availableMonths.length > 0 ? (
              availableMonths.map((month) => (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(month)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  {monthNames[month - 1]}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                Nessun mese disponibile con dati
              </div>
            )}
          </div>
          <div className="py-1 border-t border-gray-200">
            <button
              onClick={() => {
                setShowMonthSelector(false);
                setShowOptions(true);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Indietro
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 