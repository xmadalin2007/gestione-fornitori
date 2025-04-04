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

// Verifica che le variabili d'ambiente siano definite
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variabili d\'ambiente Supabase mancanti:', {
    url: supabaseUrl ? 'presente' : 'mancante',
    key: supabaseAnonKey ? 'presente' : 'mancante',
    env: process.env.NODE_ENV
  });
}

// Test della connessione a Supabase
const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Test immediato della connessione
console.log('Tentativo di connessione a Supabase...', {
  ambiente: process.env.NODE_ENV,
  url: supabaseUrl?.substring(0, 10) + '...'
});

// Funzione per testare la connessione
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('count');

    if (error) {
      console.error('Errore di connessione a Supabase:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      return false;
    }

    console.log('Connessione a Supabase riuscita:', {
      data,
      ambiente: process.env.NODE_ENV
    });
    return true;
  } catch (err) {
    console.error('Errore imprevisto nella connessione a Supabase:', err);
    return false;
  }
};

// Esegui il test di connessione
testSupabaseConnection();

export interface Entry {
  id: string;
  date: string;
  supplierId: string;
  amount: number;
  description: string;
  paymentMethod: 'contanti' | 'bonifico';
  year?: string;
}

export interface DashboardProps {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carica i fornitori da Supabase
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        console.log('Caricamento fornitori da Supabase...');
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('name');

        if (error) {
          console.error('Errore nel caricamento fornitori:', error);
          setError('Errore nel caricamento fornitori');
          // Carica da localStorage come fallback
          const localSuppliers = localStorage.getItem('suppliers');
          if (localSuppliers) {
            console.log('Caricamento fornitori da localStorage come fallback');
            setSuppliers(JSON.parse(localSuppliers));
          }
          return;
        }

        console.log('Fornitori caricati da Supabase:', data);
        const formattedSuppliers = data.map(supplier => ({
          id: supplier.id,
          name: supplier.name,
          defaultPaymentMethod: supplier.default_payment_method as 'contanti' | 'bonifico'
        }));
        setSuppliers(formattedSuppliers);
        // Aggiorna anche localStorage
        localStorage.setItem('suppliers', JSON.stringify(formattedSuppliers));
      } catch (err) {
        console.error('Errore imprevisto nel caricamento fornitori:', err);
        setError('Errore nel caricamento fornitori');
        // Carica da localStorage come fallback
        const localSuppliers = localStorage.getItem('suppliers');
        if (localSuppliers) {
          console.log('Caricamento fornitori da localStorage come fallback');
          setSuppliers(JSON.parse(localSuppliers));
        }
      } finally {
        setLoading(false);
      }
    };

    loadSuppliers();
  }, []);

  // Carica le spese quando il componente viene montato o quando cambia l'anno selezionato
  useEffect(() => {
    loadEntries();
  }, [selectedYear]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      console.log('Caricamento spese da Supabase...');
      
      // Verifica se Supabase è configurato
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configurazione Supabase mancante');
      }

      const { data: entriesData, error: entriesError } = await supabase
        .from('entries')
        .select('*')
        .eq('year', selectedYear)
        .order('date', { ascending: false });

      if (entriesError) {
        throw entriesError;
      }

      console.log('Spese caricate:', entriesData);
      setEntries(entriesData || []);
      setError(null);
    } catch (err) {
      console.error('Errore nel caricamento delle spese:', err);
      setError('Errore nel caricamento delle spese');
      
      // Fallback to localStorage
      const storedEntries = localStorage.getItem('entries');
      if (storedEntries) {
        try {
          const parsedEntries = JSON.parse(storedEntries);
          const filteredEntries = parsedEntries.filter((entry: Entry) => entry.year === selectedYear);
          setEntries(filteredEntries);
        } catch (parseError) {
          console.error('Errore nel parsing delle spese da localStorage:', parseError);
          setEntries([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/');
  };

  const handleNewEntry = async (entry: Entry) => {
    try {
      const currentYear = new Date(entry.date).getFullYear().toString();
      const entryWithYear = { 
        ...entry, 
        year: currentYear,
        // Assicuriamoci che tutti i campi siano nel formato corretto
        amount: Number(entry.amount),
        date: entry.date,
        description: entry.description || '',
        payment_method: entry.paymentMethod,
        supplier_id: entry.supplierId
      };
      
      console.log('Dati spesa preparati per Supabase:', entryWithYear);
      
      if (editingEntry) {
        console.log('Aggiornamento spesa esistente:', entryWithYear);
        const { data: updatedEntry, error: updateError } = await supabase
          .from('entries')
          .update({
            date: entryWithYear.date,
            supplier_id: entryWithYear.supplier_id,
            amount: entryWithYear.amount,
            description: entryWithYear.description,
            payment_method: entryWithYear.payment_method,
            year: entryWithYear.year
          })
          .eq('id', editingEntry.id)
          .select()
          .single();

        if (updateError) {
          console.error('Errore dettagliato Supabase (update):', {
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
            code: updateError.code
          });
          throw updateError;
        }

        console.log('Spesa aggiornata con successo:', updatedEntry);
        setEntries(entries.map(e => e.id === editingEntry.id ? entryWithYear : e));
      } else {
        console.log('Creazione nuova spesa:', entryWithYear);
        const { data: newEntry, error: insertError } = await supabase
          .from('entries')
          .insert([{
            id: crypto.randomUUID(),
            date: entryWithYear.date,
            supplier_id: entryWithYear.supplier_id,
            amount: entryWithYear.amount,
            description: entryWithYear.description,
            payment_method: entryWithYear.payment_method,
            year: entryWithYear.year
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Errore dettagliato Supabase (insert):', {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code
          });
          throw insertError;
        }

        console.log('Nuova spesa creata con successo:', newEntry);
        if (newEntry.year === selectedYear) {
          setEntries([newEntry, ...entries]);
        }
      }

      // Update localStorage as backup
      const allEntries = [...entries];
      if (!editingEntry && entryWithYear.year !== selectedYear) {
        allEntries.push(entryWithYear);
      }
      localStorage.setItem('entries', JSON.stringify(allEntries));
      console.log('Spese salvate in localStorage come backup');
      
      setEditingEntry(null);
      console.log('Form resettato con successo');
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
    try {
      console.log('Tentativo di aggiornamento fornitori:', updatedSuppliers);
      
      // Salva in localStorage come backup
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      console.log('Fornitori salvati in localStorage');

      // Prepara i dati per Supabase
      const suppliersForSupabase = updatedSuppliers.map(supplier => ({
        id: supplier.id,
        name: supplier.name,
        default_payment_method: supplier.defaultPaymentMethod
      }));
      
      console.log('Dati preparati per Supabase:', suppliersForSupabase);

      // Aggiorna i fornitori su Supabase
      const { data, error } = await supabase
        .from('suppliers')
        .upsert(suppliersForSupabase, {
          onConflict: 'id'
        })
        .select();

      if (error) {
        console.error('Errore dettagliato Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert('Errore nel salvare i fornitori su Supabase. I dati sono stati salvati localmente come backup.');
        return;
      }

      console.log('Risposta Supabase:', data);
      
      // Aggiorna lo stato locale con i dati più recenti
      setSuppliers(updatedSuppliers);
      console.log('Stato locale aggiornato con i nuovi fornitori');
    } catch (err) {
      console.error('Errore imprevisto durante l\'aggiornamento dei fornitori:', err);
      alert('Errore imprevisto durante il salvataggio. I dati sono stati salvati localmente come backup.');
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