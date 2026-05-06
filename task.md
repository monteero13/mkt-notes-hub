# Roadmap de Sincronización y Excelencia Visual (SaaS Control Panel)

## 🔄 Fase 1: Sincronización e Integridad de Base de Datos (Robustez Total)
- `[x]` **Crear Server Action de Creación de Workspaces robusta**
  - Implementada `createWorkspace` en `actions/workspace.ts` usando un cliente de administración (`createSupabaseAdminClient`) para saltarse el RLS del lado del cliente.
  - Asegura que el perfil del usuario creador en la tabla `profiles` exista **antes** de intentar insertar el registro del miembro, previniendo fallos por clave foránea.
  - Inserta atómicamente la suscripción `free` inicial en la tabla `subscriptions`.
- `[x]` **Crear Server Action de Auto-Reparación de Membresías huérfanas**
  - Implementada `repairWorkspacesMembership` en `actions/workspace.ts` para auto-detectar si un usuario es dueño legítimo de un workspace (`owner_id`) pero no tiene registros de miembro creados en `workspace_members` (por fallos o falta de triggers SQL remotos).
  - Restaura de forma silenciosa el perfil del usuario, asocia la membresía como `'owner'` e inserta la suscripción por defecto.
- `[x]` **Integrar lógica de auto-curado transparente**
  - Modificado `/onboarding` para auto-detectar y restaurar la membresía de workspaces del usuario de manera asíncrona al cargar, evitando redirecciones vacías o bucles infinitos hacia `/dashboard`.
- `[ ]` **Verificación de query cache en useWorkspace**
  - Asegurar que tras la creación de un workspace o la auto-reparación, la query global `['auth-user']` e `['workspace-members']` se invaliden inmediatamente en React Query para reflejar la sincronización de miembros de forma instantánea en la interfaz `/team` sin necesidad de recargar la página.

---

## 🎨 Fase 2: Choque de Accesibilidad, Ergonomía y Legibilidad Global (Letra Ilegible)
- `[ ]` **Saneamiento General de Tamaños de Fuente (Erradicación del micro-texto)**
  - Reemplazar sistemáticamente todas las clases de fuente ilegibles (como `text-[7px]`, `text-[8px]`, `text-[9px]` y `text-[10px]`) que provocan las quejas de los usuarios.
  - El tamaño mínimo absoluto para cualquier etiqueta o indicador de metadatos secundario será `text-xs` (12px), asegurando un peso seminegrito (`font-semibold`) y un contraste óptimo.
  - Los títulos de sección dentro de las tarjetas (como "Campañas activas", "Acciones Pendientes", etc.) pasarán de `text-[11px]` a un tamaño de `text-sm font-semibold tracking-tight text-foreground` o `text-base` para delimitar claramente los módulos de la página.
- `[ ]` **Escalado de Fuentes y Controles en Páginas Clave**
  - **Ajustes en [Settings Page](file:///home/alberto/Documentos/Proyectos/mkt-notes-hub/app/[locale]/(app)/settings/page.tsx):**
    - Subir el tamaño de las descripciones de cuenta, indicadores de planes, etiquetas de campos de formulario y botones de configuración de `text-[10px]` o `text-[11px]` a un cómodo `text-xs` (12px) o `text-sm` (14px).
  - **Ajustes en [Team Page](file:///home/alberto/Documentos/Proyectos/mkt-notes-hub/app/[locale]/(app)/team/page.tsx):**
    - Aumentar el tamaño de las etiquetas de rol de equipo, fecha de ingreso, estado de la invitación, avatares secundarios y metadatos de miembros de `text-[8px]` o `text-[9px]` a `text-xs` (12px) con peso seminegrito.
  - **Ajustes en [Campaigns Page](file:///home/alberto/Documentos/Proyectos/mkt-notes-hub/app/[locale]/(app)/campaigns/page.tsx):**
    - Ampliar los badges de plataforma (ej. "YOUTUBE", "TIKTOK"), fechas de entrega, estados y filtros de búsqueda de `text-[9px]` a `text-xs` o `text-[11px]` de alto contraste.
  - **Ajustes en [Content Page](file:///home/alberto/Documentos/Proyectos/mkt-notes-hub/app/[locale]/(app)/content/page.tsx):**
    - Aumentar el tamaño de los títulos de contenido, fechas del calendario, badges de canales y filtros de contenido a `text-xs` o `text-sm`.
- `[ ]` **Optimización Global de Botones (Accesibilidad y Ergonomía)**
  - Aumentar el tamaño de los textos de todos los botones (`Button`) de la aplicación en general, reemplazando `text-[10px]` o `text-[11px]` por un mínimo de `text-xs` o `text-sm` con peso seminegrito (`font-semibold`) y paddings proporcionales.
- `[ ]` **Rediseño de Tarjetas de KPI (DashboardStats)**
  - Aumentar el tamaño del número principal de la métrica (`stat.value`) a `text-4xl font-light tracking-tight` para que sea perfectamente visible.
  - Ampliar el texto descriptivo (`stat.label`) de `text-[9px]` a `text-xs font-semibold text-muted-foreground/80` con un tono de contraste optimizado.
  - Subir la etiqueta del porcentaje de cambio (`stat.change`) de `text-[8px]` a `text-[11px]` o `text-xs font-semibold px-2 py-0.5`.
- `[ ]` **Rediseño de Tablas y Listas del Dashboard (Live Operations & TasksOverview)**
  - Las cabeceras de tabla (Campañas, Responsable, Estado, Progreso) pasarán de `text-[9px]` a `text-xs font-semibold text-muted-foreground` con espaciado de padding holgado.
  - Los títulos de las campañas y tareas de lista pasarán a un tamaño legible de `text-sm font-medium text-foreground`.
  - Los badges de prioridad de las tareas pasarán de un minúsculo `text-[7px]` a `text-[10px]` o `text-xs font-semibold px-2 py-0.5`.
  - Los botones de cabecera de las tarjetas ("Auditar todo", "Ver todas") pasarán de un enano `text-[9px]` a un cómodo `text-xs font-medium`.
- `[ ]` **Ajuste Ergonómico de la Sidebar (Navegación Fluida)**
  - Aumentar el tamaño de fuente de los enlaces del menú principal de la barra lateral de `text-xs` (12px) o inferiores a `text-sm` (14px) con peso medio (`font-medium`) y un interlineado/padding más holgado (`py-2.5 px-3` en lugar de paddings apretados), lo cual dará un aire lujoso y premium además de ser 100% accesible.
- `[ ]` **Unificación de Geometría de Tarjetas (Radios de Borde consistentes)**
  - Asegurar que todas las tarjetas (`cards`) de información en las páginas del SaaS (Dashboard, Analíticas, Campañas, Clientes, Ideas, Planner) utilicen un radio de borde consistente de `rounded-xl` (12px / 0.75rem).
  - Reemplazar los radios desiguales o excesivamente pequeños (`rounded-sm` de 4px o bordes rectos toscos) para lograr una estética uniforme y premium.
- `[ ]` **Armonización de Bordes y Contraste**
  - Suavizar y unificar todos los bordes grises ordinarios a bordes sofisticados y sutiles translúcidos (`border-border` o `border-accent/10`).

---

## 🏷️ Fase 3: Estilización y Contraste del Logotipo
- `[x]` **Resplandor reactivo del Logotipo**
  - Modificado `components/layout/logo.tsx` para aplicar un fino borde reactivo (filtro `drop-shadow`) blanco cuando se muestre en fondos oscuros (`onDark={true}`), asegurando que el nombre del logo marino profundo sea perfectamente visible y legible.
  - Añadido un padding estratégico de `p-1.5` y clase `overflow-visible` para garantizar que la silueta no se recorte en ningún navegador.
- `[ ]` **Sidebar Contrast Integration**
  - Configurar el componente `Logo` dentro de `components/layout/app-sidebar.tsx` para que pase el parámetro `onDark={true}`, permitiendo el correcto contraste sobre la barra lateral oscura del SaaS.

---

## 🚀 Fase 4: Preparación y Validación del Despliegue en Vercel
- `[ ]` **Validación de Compilación en Producción (Local Build)**
  - Correr localmente `pnpm run build` para garantizar de que el compilador de Next.js y TypeScript no lancen ningún error de tipado o imports que pueda suspender el despliegue en la tubería de Vercel.
- `[ ]` **Auditoría de Secrets y Variables de Entorno en el Panel de Vercel**
  - Registrar en el panel de Vercel todas las claves requeridas:
    - `NEXT_PUBLIC_SUPABASE_URL` (URL de API de Supabase)
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Clave pública de cliente)
    - `SUPABASE_SERVICE_ROLE_KEY` (Clave de rol administrativo para saltar RLS en Server Actions)
    - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` y `STRIPE_SECRET_KEY` (Claves de pasarela de pago para facturación)
    - `STRIPE_WEBHOOK_SECRET` (Firma de webhooks para actualizar planes de forma automática)
- `[ ]` **Validación de la Ruta Keepalive para el Cron Job**
  - Comprobar que la ruta `/api/cron/keepalive` mapeada en `vercel.json` esté correctamente implementada o crear un endpoint básico que devuelva un código HTTP `200 OK` de respuesta rápida para evitar llamadas con error `404` por parte del planificador de Vercel.
- `[ ]` **Sincronización del Redirect Callback en Supabase**
  - Asegurar que una vez que se obtenga el dominio definitivo de producción de Vercel (`https://midominio.vercel.app`), este se añada a la sección de "Redirect URLs" en Supabase Auth (Authentication > URL Configuration) para que el inicio de sesión con correo de bienvenida y links mágicos redirija correctamente fuera de `localhost:3000`.