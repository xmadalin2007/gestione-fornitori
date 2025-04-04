'use client';

import { useState, useEffect } from 'react';
import SupplierForm from '@/components/SupplierForm';
import SupplierTable from '@/components/SupplierTable';
import SupplierManagement from '@/components/SupplierManagement';
import UserManagement from '@/components/UserManagement';
import ExportData from '@/components/ExportData';
import { useRouter } from 'next/navigation';
import type { Supplier } from '@/components/SupplierManagement';
import { supabase } from '@/lib/supabase';

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

export default function Dashboard({ initialYear, username }: DashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'spese' | 'fornitori' | 'utenti'>('spese');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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

  // Carica i fornitori da Supabase
  useEffect(() => {
    const loadSuppliers = async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error loading suppliers:', error);
        return;
      }

      setSuppliers(data.map(supplier => ({
        id: supplier.id,
        name: supplier.name,
        defaultPaymentMethod: supplier.default_payment_method
      })));
    };

    loadSuppliers();
  }, []);

  // Carica le spese da Supabase
  useEffect(() => {
    const loadEntries = async () => {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error loading entries:', error);
        return;
      }

      setEntries(data.map(entry => ({
        id: entry.id,
        date: entry.date,
        supplierId: entry.supplier_id,
        amount: entry.amount,
        description: entry.description,
        paymentMethod: entry.payment_method
      })));
    };

    loadEntries();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/');
  };

  const handleNewEntry = async (entry: Entry) => {
    if (editingEntry) {
      // Modifica di una spesa esistente
      const { error } = await supabase
        .from('entries')
        .update({
          date: entry.date,
          supplier_id: entry.supplierId,
          amount: entry.amount,
          description: entry.description,
          payment_method: entry.paymentMethod
        })
        .eq('id', editingEntry.id);

      if (error) {
        console.error('Error updating entry:', error);
        return;
      }

      const updatedEntries = entries.map(e => 
        e.id === editingEntry.id ? entry : e
      );
      setEntries(updatedEntries);
      setEditingEntry(null);
    } else {
      // Aggiunta di una nuova spesa
      const { data, error } = await supabase
        .from('entries')
        .insert([{
          date: entry.date,
          supplier_id: entry.supplierId,
          amount: entry.amount,
          description: entry.description,
          payment_method: entry.paymentMethod
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating entry:', error);
        return;
      }

      const newEntry = {
        id: data.id,
        date: data.date,
        supplierId: data.supplier_id,
        amount: data.amount,
        description: data.description,
        paymentMethod: data.payment_method
      };

      setEntries([newEntry, ...entries]);
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

    setSuppliers(updatedSuppliers);
  };

  const handleAdminPasswordChange = async (newPassword: string) => {
    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('username', 'edoardo');

    if (error) {
      console.error('Error updating admin password:', error);
    }
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
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Registra Spese
                </button>
                <button
                  onClick={() => setActiveTab('fornitori')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'fornitori'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Gestione Fornitori
                </button>
                <button
                  onClick={() => setActiveTab('utenti')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'utenti'
                      ? 'border-indigo-500 text-gray-900'
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
                className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <ExportData 
                entries={entries.filter(entry => entry.date.startsWith(selectedYear))}
                suppliers={suppliers}
                selectedYear={selectedYear}
              />

              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                onAdminPasswordChange={handleAdminPasswordChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 