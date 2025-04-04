'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
  id: string;
  username: string;
  is_admin: boolean;
  created_at?: string;
}

interface UserManagementProps {
  onPasswordChange: (newPassword: string) => void;
}

export default function UserManagement({ onPasswordChange }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Carica gli utenti da Supabase
  const loadUsers = async () => {
    try {
      console.log('Tentativo di caricamento utenti...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('username');

      if (error) {
        console.error('Errore nel caricamento utenti:', error);
        setError('Errore nel caricamento utenti: ' + error.message);
        return;
      }

      if (data) {
        console.log('Utenti caricati con successo:', data);
        setUsers(data);
      }
    } catch (err) {
      console.error('Errore imprevisto nel caricamento:', err);
      setError('Errore imprevisto nel caricamento utenti');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newUsername || !newPassword) {
      setError('Username e password sono obbligatori');
      return;
    }

    try {
      console.log('Tentativo di aggiunta nuovo utente:', { username: newUsername });
      
      // Verifica che l'utente non esista già
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', newUsername);

      if (checkError) {
        console.error('Errore nella verifica utente:', checkError);
        setError('Errore nella verifica utente: ' + checkError.message);
        return;
      }

      if (existingUsers && existingUsers.length > 0) {
        setError('Username già in uso');
        return;
      }

      // Inserisci il nuovo utente
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: crypto.randomUUID(),
            username: newUsername,
            password: newPassword,
            is_admin: false
          }
        ]);

      if (insertError) {
        console.error('Errore nell\'inserimento utente:', insertError);
        setError('Errore nel salvataggio utente: ' + insertError.message);
        return;
      }

      console.log('Utente creato con successo');
      setSuccess('Utente aggiunto con successo');
      setNewUsername('');
      setNewPassword('');
      loadUsers();

    } catch (err) {
      console.error('Errore imprevisto:', err);
      setError('Errore imprevisto durante il salvataggio');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      console.log('Tentativo di eliminazione utente:', userId);
      
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        console.error('Errore nell\'eliminazione utente:', deleteError);
        setError('Errore nell\'eliminazione utente: ' + deleteError.message);
        return;
      }

      console.log('Utente eliminato con successo');
      setSuccess('Utente eliminato con successo');
      loadUsers();
    } catch (err) {
      console.error('Errore imprevisto:', err);
      setError('Errore nell\'eliminazione utente');
    }
  };

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!adminPassword) {
      setError('La password non può essere vuota');
      return;
    }

    try {
      await onPasswordChange(adminPassword);
      setSuccess('Password amministratore aggiornata con successo');
      setAdminPassword('');
    } catch (err) {
      console.error('Errore nel cambio password:', err);
      setError('Errore nel cambio password');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Aggiungi Nuovo Utente
        </h3>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Aggiungi Utente
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Cambia Password Amministratore
        </h3>
        <form onSubmit={handleChangeAdminPassword} className="space-y-4">
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700">
              Nuova Password
            </label>
            <input
              type="password"
              name="admin-password"
              id="admin-password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Aggiorna Password
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Utenti Registrati
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruolo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.is_admin ? 'Amministratore' : 'Utente'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!user.is_admin && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Elimina
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 