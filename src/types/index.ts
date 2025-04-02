export type Supplier = {
  id: string;
  name: string;
  defaultPaymentMethod: 'contanti' | 'bonifico';
};

export type Entry = {
  id?: string;  // ID opzionale per le nuove spese
  date: string;
  supplierId: string;
  amount: number;
  description: string;
  paymentMethod: 'contanti' | 'bonifico';
}; 