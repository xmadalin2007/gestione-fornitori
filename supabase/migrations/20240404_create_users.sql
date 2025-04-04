-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON public.users;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.users
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for all users" ON public.users
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update for admins" ON public.users
    FOR UPDATE
    USING (is_admin = true)
    WITH CHECK (is_admin = true);

CREATE POLICY "Enable delete for admins" ON public.users
    FOR DELETE
    USING (is_admin = true);

-- Insert default admin user if not exists
INSERT INTO public.users (username, password, is_admin)
VALUES (
    'admin',
    'admin123', -- Cambia questa password in produzione!
    true
)
ON CONFLICT (username) DO NOTHING; 