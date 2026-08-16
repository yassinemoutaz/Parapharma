-- Enable the trigram index extension, used for fast
-- ILIKE '%term%' product-name search.
create extension if not exists pg_trgm;