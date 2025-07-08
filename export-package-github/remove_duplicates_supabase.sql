-- SQL pro odstranění duplicitních zakázek v Supabase
-- Ponechá pouze jeden záznam z každé skupiny duplicit

-- Najděte duplicity podle klíčových polí (datum, klient, castka)
-- a smažte všechny kromě nejstarší záznamu (nejmenší ID)

DELETE FROM zakazky 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM zakazky 
    GROUP BY datum, klient, castka, druh, adresa
);

-- Alternativně, pokud chcete ponechat nejnovější záznamy (největší ID):
-- DELETE FROM zakazky 
-- WHERE id NOT IN (
--     SELECT MAX(id) 
--     FROM zakazky 
--     GROUP BY datum, klient, castka, druh, adresa
-- );