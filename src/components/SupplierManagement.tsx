'use client';

import { useState } from 'react';

export interface Supplier {
  id: string;
  name: string;
  defaultPaymentMethod: 'contanti' | 'bonifico';
}

export interface SupplierManagementProps {
  suppliers: Supplier[];
  onUpdate: (updatedSuppliers: Supplier[]) => Promise<void>;
}

export default function SupplierManagement({ suppliers = [], onUpdate }: SupplierManagementProps) {
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [name, setName] = useState('');
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<'contanti' | 'bonifico'>('contanti');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form with:', { name, defaultPaymentMethod });

    if (!name.trim()) {
      alert('Inserisci il nome del fornitore');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (editingSupplier) {
        console.log('Modificando fornitore esistente:', editingSupplier.id);
        const updatedSuppliers = suppliers.map(supplier =>
          supplier.id === editingSupplier.id
            ? { ...supplier, name, defaultPaymentMethod }
            : supplier
        );
        console.log('Lista fornitori aggiornata:', updatedSuppliers);
        await onUpdate(updatedSuppliers);
      } else {
        console.log('Aggiungendo nuovo fornitore');
        const newSupplier: Supplier = {
          id: crypto.randomUUID(),
          name: name.trim(),
          defaultPaymentMethod
        };
        console.log('Nuovo fornitore:', newSupplier);
        const newSuppliers = [...suppliers, newSupplier];
        console.log('Lista fornitori aggiornata:', newSuppliers);
        await onUpdate(newSuppliers);
      }

      // Reset form
      setName('');
      setDefaultPaymentMethod('contanti');
      setEditingSupplier(null);
      console.log('Form resettato con successo');
    } catch (error) {
      console.error('Errore nel salvare il fornitore:', error);
      alert('Errore nel salvare il fornitore. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    console.log('Modificando fornitore:', supplier);
    setEditingSupplier(supplier);
    setName(supplier.name);
    setDefaultPaymentMethod(supplier.defaultPaymentMethod);
  };

  const handleDelete = async (supplierId: string) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo fornitore?')) {
      return;
    }

    try {
      console.log('Eliminando fornitore:', supplierId);
      const updatedSuppliers = suppliers.filter(supplier => supplier.id !== supplierId);
      console.log('Lista fornitori aggiornata dopo eliminazione:', updatedSuppliers);
      await onUpdate(updatedSuppliers);
    } catch (error) {
      console.error('Errore nell\'eliminazione del fornitore:', error);
      alert('Errore nell\'eliminazione del fornitore. Riprova.');
    }
  };

  const handleCancel = () => {
    console.log('Annullando modifiche');
    setEditingSupplier(null);
    setName('');
    setDefaultPaymentMethod('contanti');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 sm:p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome Fornitore
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-lg border-0 py-3 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-base"
              placeholder="Inserisci nome fornitore"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="defaultPaymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
              Metodo di Pagamento Predefinito
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDefaultPaymentMethod('contanti')}
                className={`py-3 px-3 rounded-lg text-base font-medium text-center ${
                  defaultPaymentMethod === 'contanti'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={isSubmitting}
              >
                Contanti
              </button>
              <button
                type="button"
                onClick={() => setDefaultPaymentMethod('bonifico')}
                className={`py-3 px-3 rounded-lg text-base font-medium text-center ${
                  defaultPaymentMethod === 'bonifico'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={isSubmitting}
              >
                Bonifico
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:space-x-3 mt-4">
          {editingSupplier && (
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto py-3 px-4 rounded-lg border border-gray-300 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isSubmitting}
            >
              Annulla
            </button>
          )}
          <button
            type="submit"
            className="w-full sm:w-auto py-3 px-4 rounded-lg border border-transparent bg-blue-600 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Salvataggio in corso...' 
              : (editingSupplier ? 'Salva Modifiche' : 'Aggiungi Fornitore')
            }
          </button>
        </div>
      </form>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Fornitori</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(suppliers) && suppliers.length > 0 ? (
              suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">{supplier.name}</h3>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          supplier.defaultPaymentMethod === 'contanti'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {supplier.defaultPaymentMethod === 'contanti' ? 'Contanti' : 'Bonifico'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                        disabled={isSubmitting}
                        aria-label="Modifica"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                        disabled={isSubmitting}
                        aria-label="Elimina"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-4 text-gray-500">
                Nessun fornitore presente. Aggiungi il tuo primo fornitore!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 