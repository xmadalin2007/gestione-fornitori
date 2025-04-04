'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  username: string;
  is_admin: boolean;
  created_at?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Errore nel caricamento utenti:', error);
        setError('Errore nel caricamento degli utenti');
        return;
      }

      setUsers(data || []);
    } catch (err) {
      console.error('Errore imprevisto:', err);
      setError('Errore imprevisto durante il caricamento');
    } finally {
      setLoading(false);
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
      // Verifica che l'utente non sia admin
      const userToDelete = users.find(u => u.id === userId);
      if (userToDelete?.is_admin) {
        setError('Non è possibile eliminare un utente admin');
        return;
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Errore nella cancellazione:', error);
        setError('Errore durante l\'eliminazione dell\'utente');
        return;
      }

      setSuccess('Utente eliminato con successo');
      loadUsers();
    } catch (err) {
      console.error('Errore imprevisto:', err);
      setError('Errore imprevisto durante l\'eliminazione');
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Aggiungi Nuovo Utente</h2>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Aggiungi Utente
          </button>
        </form>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-md ${error ? 'bg-red-50' : 'bg-green-50'}`}>
          <p className={`text-sm ${error ? 'text-red-700' : 'text-green-700'}`}>
            {error || success}
          </p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Utenti Esistenti</h2>
        {loading ? (
          <p>Caricamento utenti...</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-gray-500">
                    {user.is_admin ? 'Amministratore' : 'Utente standard'}
                  </p>
                </div>
                {!user.is_admin && (
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Elimina
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 