-- ======================================
-- SUPABASE SQL SCRIPT
-- Přidání sloupců doba_realizace a poznamky
-- ======================================

-- Krok 1: Přidání sloupců do tabulky zakazky
ALTER TABLE zakazky ADD COLUMN IF NOT EXISTS doba_realizace INTEGER DEFAULT 1;
ALTER TABLE zakazky ADD COLUMN IF NOT EXISTS poznamky TEXT DEFAULT '';

-- Krok 2: Ověření že sloupce byly přidány
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'zakazky' 
  AND column_name IN ('doba_realizace', 'poznamky')
ORDER BY column_name;

-- Krok 3: Test INSERT s novými sloupci
INSERT INTO zakazky (
    profile_id, 
    datum, 
    druh, 
    klient, 
    id_zakazky, 
    castka, 
    fee, 
    fee_off, 
    palivo, 
    material, 
    pomocnik, 
    zisk, 
    adresa, 
    doba_realizace, 
    poznamky, 
    soubory
) VALUES (
    '24787d4a-0139-407c-93c0-b4f369e913a9',
    '28. 8. 2025',
    'SQL Test Nových Sloupců',
    'SQL Test Klient', 
    'SQL-TEST-001',
    25000, 
    6525, 
    0, 
    600, 
    2000, 
    1200, 
    14675,
    'SQL test adresa pro nové sloupce',
    2,
    'Toto je test poznámka pro nové sloupce v Supabase',
    '[]'::jsonb
);

-- Krok 4: Ověření že test záznam byl přidán s novými daty
SELECT 
    id,
    klient, 
    doba_realizace, 
    poznamky,
    created_at
FROM zakazky 
WHERE klient = 'SQL Test Klient'
ORDER BY created_at DESC
LIMIT 1;

-- Krok 5: Test UPDATE s novými sloupci
UPDATE zakazky 
SET 
    doba_realizace = 5,
    poznamky = 'Aktualizovaná poznámka přes SQL'
WHERE klient = 'SQL Test Klient';

-- Krok 6: Zobrazení všech sloupců tabulky zakazky
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'zakazky'
ORDER BY ordinal_position;

-- Krok 7: Smazání test záznamu (spusťte po ověření)
-- DELETE FROM zakazky WHERE klient = 'SQL Test Klient';

-- Krok 8: Finální test - zobrazení posledních 3 záznamů
SELECT 
    id,
    klient,
    castka,
    doba_realizace,
    poznamky,
    created_at
FROM zakazky 
ORDER BY created_at DESC 
LIMIT 3;