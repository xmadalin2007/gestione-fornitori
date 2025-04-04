-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing users table if it exists
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can be created by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can be updated by admins" ON public.users;
DROP POLICY IF EXISTS "Users can be deleted by admins" ON public.users;

-- Create policies
CREATE POLICY "Users are viewable by everyone" 
ON public.users FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Users can be created by everyone" 
ON public.users FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Users can be updated by admins" 
ON public.users FOR UPDATE 
TO public 
USING (is_admin = true);

CREATE POLICY "Users can be deleted by admins" 
ON public.users FOR DELETE 
TO public 
USING (is_admin = true);

-- Elimina tutti gli utenti esistenti
TRUNCATE TABLE public.users;

-- Insert default admin user
INSERT INTO public.users (id, username, password, is_admin, created_at)
VALUES (
    uuid_generate_v4(),
    'edoardo',
    'edoardO2024',
    true,
    timezone('utc'::text, now())
); 