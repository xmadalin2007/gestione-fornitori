'use client';

import React, { useState } from 'react';

type User = {
  id: string;
  username: string;
  password: string;
  isAdmin: boolean;
};

type UserManagementProps = {
  currentUser: string;
  onAdminPasswordChange: (newPassword: string) => void;
};

export default function UserManagement({ currentUser, onAdminPasswordChange }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'edoardo', password: 'edoardO2024', isAdmin: true }
  ]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validazione
    if (newUsername.length < 3) {
      setError('Il nome utente deve essere di almeno 3 caratteri');
      return;
    }
    if (newPassword.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      return;
    }
    if (users.some(user => user.username === newUsername)) {
      setError('Questo nome utente esiste già');
      return;
    }

    // Aggiungi nuovo utente
    setUsers([
      ...users,
      {
        id: Math.random().toString(36).substr(2, 9),
        username: newUsername,
        password: newPassword,
        isAdmin: false
      }
    ]);

    // Reset form
    setNewUsername('');
    setNewPassword('');
  };

  const handleDeleteUser = (userId: string) => {
    // Non permettere di eliminare l'utente corrente o l'admin principale
    if (users.find(u => u.id === userId)?.username === currentUser) {
      setError('Non puoi eliminare il tuo account');
      return;
    }
    if (users.find(u => u.id === userId)?.username === 'edoardo') {
      setError('Non puoi eliminare l\'account amministratore');
      return;
    }

    setUsers(users.filter(user => user.id !== userId));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    // Verifica la password corrente (usa quella memorizzata nel localStorage)
    const storedPassword = localStorage.getItem('adminPassword');
    if (currentPassword !== storedPassword) {
      setError('Password corrente non valida');
      return;
    }

    // Aggiorna la password
    localStorage.setItem('adminPassword', newPassword);
    setSuccess('Password aggiornata con successo');
    
    // Pulisci i campi
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Gestione Utenti</h3>
            <p className="mt-1 text-sm text-gray-500">
              Gestisci gli utenti del sistema e le loro autorizzazioni.
            </p>
            {currentUser === 'edoardo' && (
              <div className="space-y-6">
                {!isChangingPassword ? (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Modifica Password Admin
                  </button>
                ) : (
                  <div className="max-w-md mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                          Password Corrente
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          Nuova Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Conferma Nuova Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                      {error && (
                        <div className="text-red-600 text-sm">{error}</div>
                      )}
                      {success && (
                        <div className="text-green-600 text-sm">{success}</div>
                      )}
                      <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cambia Password
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleAddUser}>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Nome utente
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-4">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Aggiungi Utente
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Utenti Registrati
          </h3>
          <div className="mt-4">
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Username
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ruolo
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Azioni</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.isAdmin ? 'Amministratore' : 'Utente'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {user.username !== 'edoardo' && (
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 