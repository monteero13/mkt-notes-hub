# Arquitectura del Proyecto: mkt-notes-hub

## Tech Stack
- **Framework:** Next.js (App Router) - `[INMOVIBLE]`
- **Lenguaje:** TypeScript
- **Base de Datos:** Supabase (PostgreSQL) - `[INMOVIBLE]`
- **Autenticación:** Supabase Auth
- **Estilos:** TailwindCSS 4
- **Componentes UI:** Radix UI + Componentes personalizados (estética Premium/Dark Mode)
- **Gestión de Estado/Datos:** TanStack Query (React Query)
- **Pagos:** Stripe
- **Internacionalización:** i18next + react-i18next
- **Formularios:** React Hook Form + Zod
- **Despliegue:** Vercel

## Estructura de Directorios
```text
/app             # Rutas y lógica de páginas (App Router)
/components      # Componentes de UI reutilizables
/docs            # Documentación SDD y manuales
/hooks           # Hooks personalizados (auth, team, data fetching)
/lib             # Configuraciones (supabase, stripe, utils)
/scripts         # Scripts de utilidad y mantenimiento
/public          # Activos estáticos
```

## Decisiones Técnicas Clave
1. **Variables de Entorno:** Los nombres actuales de las variables de entorno son inamovibles. `[CONFIRMADO]`
2. **Modelo de Datos:**
   - Cambio de esquema reciente: de booleano `completed` a campo `status` en tareas para mayor flexibilidad.
   - Relación de entidades vinculada a `team_id` para soporte multi-usuario.
3. **Seguridad:** Uso de Row Level Security (RLS) en Supabase para proteger datos por equipo/usuario. `[INFERIDO]`
4. **Diseño:** Enfoque en estética profesional con "cards de acceso premium" y micro-animaciones para mejorar la percepción de valor.

## Infraestructura
- **Base de Datos:** Hosting gestionado en Supabase.
- **Hosting Web:** Vercel con integración continua desde GitHub.
- **Storage:** Supabase Storage para recursos de la biblioteca.
