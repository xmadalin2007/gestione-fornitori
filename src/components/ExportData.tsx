'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import type { Supplier } from './SupplierManagement';
import type { Entry } from '@/app/dashboard/page';

type ExportDataProps = {
  entries: Entry[];
  suppliers: Supplier[];
  selectedYear?: string;
};

export default function ExportData({ entries, suppliers, selectedYear }: ExportDataProps) {
  const [showOptions, setShowOptions] = useState(false);

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

  const exportToExcel = (type: 'dettaglio' | 'riepilogo') => {
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
    } else {
      // Esporta riepilogo
      const totals = calculateTotals(filteredEntries);
      const supplierTotals = calculateSupplierTotals(filteredEntries);

      // Crea foglio riepilogo generale
      const summaryData = [
        ['Riepilogo Totali', ''],
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
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Riepilogo');
      XLSX.writeFile(wb, `Riepilogo_Spese_${selectedYear || 'Completo'}.xlsx`);
    }

    setShowOptions(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Esporta Excel
      </button>

      {showOptions && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <button
              onClick={() => exportToExcel('dettaglio')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Esporta Dettaglio
            </button>
            <button
              onClick={() => exportToExcel('riepilogo')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Esporta Riepilogo
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 