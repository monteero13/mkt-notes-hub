# Especificaciones del Proyecto: mkt-notes-hub

## Visión General
**mkt-notes-hub** es una plataforma Enterprise SaaS diseñada para agencias y departamentos de marketing. Su objetivo es centralizar la gestión de clientes, campañas, contenido y estrategia creativa en un entorno colaborativo de alta fidelidad. `[ACTUALIZADO]`

## Usuarios y Roles
- **Workspace Owner:** Dueño de la cuenta y suscripción.
- **Admin/Manager:** Gestión de miembros, clientes y configuración global.
- **Editor/Viewer:** Colaboradores de equipo con acceso a campañas y tareas.
- **Client Guest:** Acceso restringido para revisión de clientes. `[NUEVO]`

## Funcionalidades Principales

### 1. Sistema de Workspaces (Multi-tenancy)
- Aislamiento completo de datos por espacio de trabajo.
- Sistema de invitaciones con tokens expirables.
- Gestión de suscripciones (Free, Pro, Enterprise) integrada con Stripe. `[NUEVO]`

### 2. CRM de Clientes
- Directorio de clientes con detalles de contacto, nicho y notas de marca.
- Seguimiento de "Monthly Retainers" y estado del cliente (Prospect, Active, Churned). `[NUEVO]`

### 3. Gestión de Campañas y Tareas
- Campañas vinculadas a clientes específicos.
- Tareas con estados avanzados (Backlog, Todo, In Progress, In Review, Done).
- Sistema de comentarios en tareas y jerarquía de subtareas. `[NUEVO]`

### 4. Ciclo de Vida de Contenido
- Gestión de piezas de contenido desde la idea hasta la publicación.
- Canales específicos (Instagram, TikTok, LinkedIn, etc.) con previsualización. `[NUEVO]`

### 5. Estrategia y Brainstorming
- Pizarras interactivas de notas adhesivas.
- Sistema de votación para priorizar ideas creativas. `[NUEVO]`

### 6. Analítica y Reportes
- Snapshots diarios de métricas de rendimiento.
- Exportación de reportes en PDF y CSV. `[ACTUALIZADO]`

### 7. Centro de Notificaciones y Actividad
- Feed de notificaciones en tiempo real (Realtime).
- Registro de actividad (Audit Log) para todas las entidades del sistema. `[NUEVO]`

## Requisitos No Funcionales
- **Escalabilidad:** Arquitectura preparada para múltiples clientes y grandes volúmenes de datos.
- **Seguridad:** RLS (Row Level Security) estricto en Supabase por `workspace_id`.
- **Aesthetics:** Estilo "Ultra Dark Minimalist" con tipografía premium (Clash Grotesk, Switzer, Satoshi).

## Estado del Proyecto
- **Fase 1 (Completada):** Rediseño visual inicial y sistema de fuentes locales.
- **Fase 2 (En curso):** Migración a arquitectura Enterprise (Workspaces + CRM).
- **Pendiente:** Implementación de Brainstorming y sistema de notificaciones.