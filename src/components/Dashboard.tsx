'use client';

import { useState, useEffect } from 'react';
import SupplierForm from '@/components/SupplierForm';
import SupplierTable from '@/components/SupplierTable';
import SupplierManagement from '@/components/SupplierManagement';
import UserManagement from '@/components/UserManagement';
import ExportData from '@/components/ExportData';
import { useRouter } from 'next/navigation';
import type { Supplier } from '@/components/SupplierManagement';
import { createClient } from '@supabase/supabase-js';

export type Entry = {
  id: string;
  date: string;
  supplierId: string;
  amount: number;
  description: string;
  paymentMethod: 'contanti' | 'bonifico';
};

interface DashboardProps {
  initialYear: string;
  username: string;
}

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: '1',
    name: 'Fornitore 1',
    defaultPaymentMethod: 'contanti'
  },
  {
    id: '2',
    name: 'Fornitore 2',
    defaultPaymentMethod: 'bonifico'
  },
  {
    id: '3',
    name: 'Fornitore 3',
    defaultPaymentMethod: 'contanti'
  },
  {
    id: '4',
    name: 'Fornitore 4',
    defaultPaymentMethod: 'bonifico'
  },
  {
    id: '5',
    name: 'Fornitore 5',
    defaultPaymentMethod: 'contanti'
  },
  {
    id: '6',
    name: 'Fornitore 6',
    defaultPaymentMethod: 'bonifico'
  }
];

export default function Dashboard({ initialYear, username }: DashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'spese' | 'fornitori' | 'utenti'>('spese');
  const [suppliers, setSuppliers] = useState<Supplier[]>(DEFAULT_SUPPLIERS);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);
  const [years, setYears] = useState<string[]>(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2024; year--) {
      years.push(year.toString());
    }
    return years;
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Carica i fornitori da Supabase
  const loadSuppliers = async () => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*');
    
    if (error) {
      console.error('Error loading suppliers:', error);
      return;
    }

    if (data && data.length > 0) {
      setSuppliers(data);
    }
  };

  // Carica le spese da Supabase
  const loadEntries = async () => {
    const { data, error } = await supabase
      .from('entries')
      .select('*');
    
    if (error) {
      console.error('Error loading entries:', error);
      return;
    }

    if (data) {
      setEntries(data);
    }
  };

  // Carica i dati iniziali
  useEffect(() => {
    loadSuppliers();
    loadEntries();
  }, []);

  // Imposta il polling ogni 3 secondi
  useEffect(() => {
    const interval = setInterval(() => {
      loadSuppliers();
      loadEntries();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      router.push('/');
    }
  };

  const handleNewEntry = async (entryData: Omit<Entry, 'id'>) => {
    if (editingEntry) {
      // Modifica di una spesa esistente
      const { error } = await supabase
        .from('entries')
        .update({
          date: entryData.date,
          amount: entryData.amount,
          description: entryData.description,
          supplierId: entryData.supplierId,
          paymentMethod: entryData.paymentMethod
        })
        .eq('id', editingEntry.id);

      if (error) {
        console.error('Error updating entry:', error);
        return;
      }

      const updatedEntry = {
        ...entryData,
        id: editingEntry.id
      };

      const updatedEntries = entries.map(e => e.id === editingEntry.id ? updatedEntry : e);
      setEntries(updatedEntries);
      setEditingEntry(null);
    } else {
      // Aggiunta di una nuova spesa
      const newEntry = {
        ...entryData,
        id: crypto.randomUUID()
      };

      const { error } = await supabase
        .from('entries')
        .insert([newEntry]);

      if (error) {
        console.error('Error inserting entry:', error);
        return;
      }

      setEntries([...entries, newEntry]);
    }
  };

  const handleDeleteEntry = async (entryToDelete: Entry) => {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', entryToDelete.id);

    if (error) {
      console.error('Error deleting entry:', error);
      return;
    }

    const updatedEntries = entries.filter(entry => entry.id !== entryToDelete.id);
    setEntries(updatedEntries);
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setActiveTab('spese');
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const handleSupplierUpdate = async (updatedSuppliers: Supplier[]) => {
    // Assicurati che ogni fornitore abbia un ID
    const suppliersWithIds = updatedSuppliers.map(supplier => ({
      ...supplier,
      id: supplier.id || crypto.randomUUID()
    }));

    // Aggiorna i fornitori su Supabase
    const { error } = await supabase
      .from('suppliers')
      .upsert(suppliersWithIds);

    if (error) {
      console.error('Error updating suppliers:', error);
      return;
    }

    setSuppliers(suppliersWithIds);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('spese')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'spese'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Registra Spese
                </button>
                <button
                  onClick={() => setActiveTab('fornitori')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'fornitori'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Gestione Fornitori
                </button>
                <button
                  onClick={() => setActiveTab('utenti')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'utenti'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Gestione Utenti
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <ExportData 
                entries={entries} 
                suppliers={suppliers}
                selectedYear={selectedYear}
              />

              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'spese' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
              <SupplierForm
                suppliers={suppliers}
                onSubmit={handleNewEntry}
                editingEntry={editingEntry}
                onCancelEdit={handleCancelEdit}
                selectedYear={selectedYear}
              />
              <div className="mt-8">
                <SupplierTable
                  entries={entries.filter(entry => entry.date.startsWith(selectedYear))}
                  suppliers={suppliers}
                  onDeleteEntry={handleDeleteEntry}
                  onEditEntry={handleEditEntry}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fornitori' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
              <SupplierManagement
                suppliers={suppliers}
                onUpdateSuppliers={handleSupplierUpdate}
              />
            </div>
          </div>
        )}

        {activeTab === 'utenti' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
              <UserManagement 
                currentUser={username}
                onAdminPasswordChange={(newPassword: string) => {
                  localStorage.setItem('adminPassword', newPassword);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 