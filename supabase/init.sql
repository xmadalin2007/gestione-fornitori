-- Create suppliers table
CREATE TABLE suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  defaultPaymentMethod TEXT NOT NULL CHECK (defaultPaymentMethod IN ('contanti', 'bonifico'))
);

-- Create entries table
CREATE TABLE entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  supplierId UUID REFERENCES suppliers(id),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  paymentMethod TEXT NOT NULL CHECK (paymentMethod IN ('contanti', 'bonifico')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries by date
CREATE INDEX entries_date_idx ON entries(date);

-- Insert default suppliers
INSERT INTO suppliers (name, defaultPaymentMethod) VALUES
  ('Fornitore 1', 'contanti'),
  ('Fornitore 2', 'bonifico'),
  ('Fornitore 3', 'contanti'),
  ('Fornitore 4', 'bonifico'),
  ('Fornitore 5', 'contanti'),
  ('Fornitore 6', 'bonifico'); 