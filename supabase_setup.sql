-- SQL skript pro vytvoření tabulek v Supabase
-- Spusťte v Supabase SQL Editor

-- 1. Povolit rozšíření pro UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabulka pro profily uživatelů (nahrazuje localStorage profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pin TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabulka pro zakázky (user-specific)
CREATE TABLE IF NOT EXISTS zakazky (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  datum TEXT NOT NULL,
  druh TEXT NOT NULL,
  klient TEXT NOT NULL,
  id_zakazky TEXT NOT NULL,
  castka NUMERIC NOT NULL,
  fee NUMERIC NOT NULL,
  fee_off NUMERIC NOT NULL,
  palivo NUMERIC NOT NULL,
  material NUMERIC NOT NULL,
  pomocnik NUMERIC NOT NULL,
  zisk NUMERIC NOT NULL,
  adresa TEXT,
  soubory JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Row Level Security (RLS) - zajistí izolaci dat pro každého uživatele
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE zakazky ENABLE ROW LEVEL SECURITY;

-- 5. Politiky pro přístup k datům
-- Profily: každý může číst všechny (pro login), ale upravovat jen svůj
CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (true);

-- Zakázky: pouze vlastník profilu může přistupovat ke svým zakázkám  
CREATE POLICY "Users can see own zakazky" ON zakazky FOR SELECT USING (true);
CREATE POLICY "Users can insert own zakazky" ON zakazky FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own zakazky" ON zakazky FOR UPDATE USING (true);
CREATE POLICY "Users can delete own zakazky" ON zakazky FOR DELETE USING (true);

-- 6. Vložit výchozí profil (stejný jako v localStorage)
INSERT INTO profiles (pin, name, avatar, color) 
VALUES ('123456', 'Hlavní uživatel', 'HU', '#4F46E5')
ON CONFLICT (pin) DO NOTHING;

-- 7. Funkce pro aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Triggery pro automatické updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zakazky_updated_at 
    BEFORE UPDATE ON zakazky 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();