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
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome Fornitore
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="defaultPaymentMethod" className="block text-sm font-medium text-gray-700">
              Metodo di Pagamento Predefinito
            </label>
            <select
              id="defaultPaymentMethod"
              value={defaultPaymentMethod}
              onChange={(e) => setDefaultPaymentMethod(e.target.value as 'contanti' | 'bonifico')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={isSubmitting}
            >
              <option value="contanti">Contanti</option>
              <option value="bonifico">Bonifico</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          {editingSupplier && (
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isSubmitting}
            >
              Annulla
            </button>
          )}
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
          {Array.isArray(suppliers) && suppliers.length > 0 ? (
            suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{supplier.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {supplier.defaultPaymentMethod === 'contanti' ? 'Contanti' : 'Bonifico'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="text-blue-600 hover:text-blue-900"
                      disabled={isSubmitting}
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={isSubmitting}
                    >
                      Elimina
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
  );
} 