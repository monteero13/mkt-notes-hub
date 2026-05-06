-- REPARACIÓN DE LA TABLA TASKS
-- Asegurar que las columnas existan (por si la tabla se creó antes de añadirlas al esquema)

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assignees UUID[] DEFAULT '{}';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS category_color TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS category_name TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS due_date DATE;

-- Forzar refresco de la caché del esquema de Supabase (PostgREST)
NOTIFY pgrst, 'reload schema';
