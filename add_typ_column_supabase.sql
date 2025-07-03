-- Přidání sloupce 'typ' do tabulky zakazky v Supabase
-- Tento SQL spusťte v Supabase Dashboard > SQL Editor

-- Přidat sloupec typ do tabulky zakazky
ALTER TABLE zakazky ADD COLUMN typ TEXT;

-- Nastavit výchozí hodnotu pro existující záznamy
UPDATE zakazky SET typ = 'byt' WHERE typ IS NULL;

-- Přidat komentář pro dokumentaci
COMMENT ON COLUMN zakazky.typ IS 'Typ objektu: byt, dům, pension, obchod, provozovna, dveře, podlaha';