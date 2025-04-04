'use client';

import { useState, useEffect } from 'react';
import SupplierForm from '@/components/SupplierForm';
import SupplierTable from '@/components/SupplierTable';
import SupplierManagement from '@/components/SupplierManagement';
import UserManagement from '@/components/UserManagement';
import ExportData from '@/components/ExportData';
import { useRouter } from 'next/navigation';
import type { Supplier } from '@/components/SupplierManagement';

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

  // Carica i fornitori dal localStorage
  useEffect(() => {
    const loadSuppliers = () => {
      const storedSuppliers = localStorage.getItem('suppliers');
      if (storedSuppliers) {
        setSuppliers(JSON.parse(storedSuppliers));
      }
    };

    loadSuppliers();
  }, []);

  // Carica le spese dal localStorage
  useEffect(() => {
    const loadEntries = () => {
      const storedEntries = localStorage.getItem('entries');
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    };

    loadEntries();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/');
  };

  const handleNewEntry = (entry: Entry) => {
    if (editingEntry) {
      // Modifica di una spesa esistente
      const updatedEntries = entries.map(e => 
        e.id === editingEntry.id ? entry : e
      );
      setEntries(updatedEntries);
      localStorage.setItem('entries', JSON.stringify(updatedEntries));
      setEditingEntry(null);
    } else {
      // Aggiunta di una nuova spesa
      const newEntry = {
        ...entry,
        id: Math.random().toString(36).substr(2, 9)
      };

      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      localStorage.setItem('entries', JSON.stringify(updatedEntries));
    }
  };

  const handleDeleteEntry = (entryToDelete: Entry) => {
    const updatedEntries = entries.filter(entry => entry.id !== entryToDelete.id);
    setEntries(updatedEntries);
    localStorage.setItem('entries', JSON.stringify(updatedEntries));
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setActiveTab('spese');
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  const handleSupplierUpdate = (updatedSuppliers: Supplier[]) => {
    setSuppliers(updatedSuppliers);
    localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
  };

  const handleAdminPasswordChange = (newPassword: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((user: any) => 
      user.username === 'edoardo' ? { ...user, password: newPassword } : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

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
              onCancel={handleCancelEdit}
            />
            <SupplierTable
              entries={entries}
              suppliers={suppliers}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
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