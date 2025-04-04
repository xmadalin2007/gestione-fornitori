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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export interface Entry {
  id: string;
  date: string;
  supplierId: string;
  amount: number;
  description: string;
  paymentMethod: 'contanti' | 'bonifico';
  year?: string;
}

interface DashboardProps {
  initialYear: string;
  username: string;
  suppliers: Supplier[];
  onUpdate?: () => void;
}

export default function Dashboard({ initialYear, username, suppliers, onUpdate }: DashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'spese' | 'fornitori' | 'utenti'>('spese');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);
  const [years] = useState<string[]>(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2024; year--) {
      years.push(year.toString());
    }
    return years;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      console.log('Caricamento spese da Supabase...');
      const { data: entriesData, error: entriesError } = await supabase
        .from('entries')
        .select('*')
        .order('date', { ascending: false });

      if (entriesError) {
        throw entriesError;
      }

      console.log('Spese caricate:', entriesData);
      setEntries(entriesData || []);
      setLoading(false);
    } catch (err) {
      console.error('Errore nel caricamento delle spese:', err);
      setError('Errore nel caricamento delle spese');
      setLoading(false);
      
      // Fallback to localStorage
      const storedEntries = localStorage.getItem('entries');
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/');
  };

  const handleNewEntry = async (entry: Entry) => {
    try {
      const currentYear = new Date(entry.date).getFullYear().toString();
      const entryWithYear = { ...entry, year: currentYear };
      
      if (editingEntry) {
        console.log('Aggiornamento spesa esistente:', entryWithYear);
        const { error: updateError } = await supabase
          .from('entries')
          .update(entryWithYear)
          .eq('id', editingEntry.id);

        if (updateError) {
          throw updateError;
        }

        setEntries(entries.map(e => e.id === editingEntry.id ? entryWithYear : e));
      } else {
        console.log('Creazione nuova spesa:', entryWithYear);
        const { data: newEntry, error: insertError } = await supabase
          .from('entries')
          .insert([entryWithYear])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        setEntries([newEntry, ...entries]);
      }

      // Update localStorage as backup
      localStorage.setItem('entries', JSON.stringify(entries));
      
      setEditingEntry(null);
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Errore nel salvare la spesa:', err);
      alert('Errore nel salvare la spesa. Riprova.');
    }
  };

  const handleDelete = async (entry: Entry) => {
    try {
      const { error: deleteError } = await supabase
        .from('entries')
        .delete()
        .eq('id', entry.id);

      if (deleteError) {
        throw deleteError;
      }

      setEntries(entries.filter(e => e.id !== entry.id));
      localStorage.setItem('entries', JSON.stringify(entries.filter(e => e.id !== entry.id)));
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Errore nell\'eliminazione della spesa:', err);
      alert('Errore nell\'eliminazione della spesa. Riprova.');
    }
  };

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry);
  };

  const handleCancel = () => {
    setEditingEntry(null);
  };

  const handleSupplierUpdate = async (updatedSuppliers: Supplier[]) => {
    // Aggiorna i fornitori su Supabase
    const { error } = await supabase
      .from('suppliers')
      .upsert(
        updatedSuppliers.map(supplier => ({
          id: supplier.id,
          name: supplier.name,
          default_payment_method: supplier.defaultPaymentMethod
        }))
      );

    if (error) {
      console.error('Error updating suppliers:', error);
      return;
    }

    if (onUpdate) {
      onUpdate();
    }
  };

  const handleAdminPasswordChange = async (newPassword: string) => {
    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('username', 'edoardo');

    if (error) {
      console.error('Error updating admin password:', error);
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((user: any) => 
      user.username === 'edoardo' ? { ...user, password: newPassword } : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  if (loading) {
    return <div>Caricamento...</div>;
  }

  if (error) {
    return <div>Errore: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Gestione Fornitori</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('spese')}
                  className={`${
                    activeTab === 'spese'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Spese
                </button>
                <button
                  onClick={() => setActiveTab('fornitori')}
                  className={`${
                    activeTab === 'fornitori'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Fornitori
                </button>
                {username === 'edoardo' && (
                  <button
                    onClick={() => setActiveTab('utenti')}
                    className={`${
                      activeTab === 'utenti'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Gestione Utenti
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ExportData entries={entries} suppliers={suppliers} />
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'spese' && (
          <div className="space-y-6">
            <SupplierForm
              suppliers={suppliers}
              onSubmit={handleNewEntry}
              editingEntry={editingEntry}
              onCancel={handleCancel}
            />
            <SupplierTable
              entries={entries}
              suppliers={suppliers}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
        {activeTab === 'fornitori' && (
          <SupplierManagement
            suppliers={suppliers}
            onUpdate={handleSupplierUpdate}
          />
        )}
        {activeTab === 'utenti' && username === 'edoardo' && (
          <UserManagement onPasswordChange={handleAdminPasswordChange} />
        )}
      </div>
    </div>
  );
} 