-- ELIMINAR LA RESTRICCIÓN ANTIGUA
-- Esta restricción bloqueaba los nuevos estados como 'review'
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

-- CREAR LA NUEVA RESTRICCIÓN (Opcional pero recomendado para mantener la integridad)
-- Añadimos los 4 estados que estamos usando ahora
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('pending', 'in_progress', 'review', 'completed'));

-- Refrescar la caché por si acaso
NOTIFY pgrst, 'reload schema';
