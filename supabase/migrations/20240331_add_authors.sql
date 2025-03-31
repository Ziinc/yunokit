-- Create supacontent schema
CREATE SCHEMA IF NOT EXISTS supacontent;

-- Add pseudonym field to user_profiles
ALTER TABLE supacontent.user_profiles
ADD COLUMN pseudonym text;

-- Create system_authors table
CREATE TABLE supacontent.system_authors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for system_authors
ALTER TABLE supacontent.system_authors ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read system authors
CREATE POLICY "Allow authenticated users to read system authors"
    ON supacontent.system_authors
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow admins to manage system authors
CREATE POLICY "Allow admins to manage system authors"
    ON supacontent.system_authors
    USING (
        EXISTS (
            SELECT 1 FROM supacontent.user_profiles up
            WHERE up.id = auth.uid()
            AND up.role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION supacontent.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for system_authors
CREATE TRIGGER update_system_authors_updated_at
    BEFORE UPDATE ON supacontent.system_authors
    FOR EACH ROW
    EXECUTE FUNCTION supacontent.update_updated_at_column(); 