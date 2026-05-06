# Plan de Reparación y Unificación de UX/Funcionalidad (Actualizado)

Este plan aborda las últimas solicitudes visuales y funcionales detectadas, incluyendo la eliminación del pliegue de la barra lateral, corrección de inputs en modo claro, problemas de traducciones y enlaces rotos del Dashboard.

## User Review Required

> [!WARNING]
> **Edición de Contenido:** Para habilitar la modificación de tarjetas de contenido, se debe implementar/verificar el `UpdateContentDialog`. Si estás de acuerdo, implementaremos un menú rápido (dropdown `...`) en cada fila/tarjeta del Gestor de Contenido para poder cambiar el estado de manera ágil (Draft -> In Progress -> Published) sin tener que abrir el modal completo.

## Open Questions

1. **Dashboard Click Events:** Cuando haces click en las campañas desde el Dashboard, las conectaré directamente hacia su respectiva página de detalle (`/campaigns/[id]`). ¿El botón de *Auditar estrategia* debe redirigir a `/analytics`? ¿Confirmas?

## Proposed Changes

### 1. Ajustes Geométricos (Sidebar y Modales)
#### [MODIFY] [components/layout/app-sidebar.tsx](file:///home/alberto/Documentos/Proyectos/mkt-notes-hub/components/layout/app-sidebar.tsx)
- Eliminar el estado local `collapsed`.
- Retirar los botones de `ChevronLeft` que permitían el "pliegue" y dejar la sidebar anclada de manera permanente en el layout completo (`w-64`).
- Ajustar el espaciado (padding) para alinear el logotipo principal estéticamente con el Selector de Workspaces inferior.

#### [MODIFY] Modales del Planner (Inputs)
- Ajustar el componente `<Input>` o el Tailwind en los modales de creación (como el Gestor de *Tipos de Tarea* en el Planner) para corregir el contraste del relleno. El texto actual no se lee porque choca el texto oscuro con el placeholder o fondo oscuro (aplicar `bg-background text-foreground`).

### 2. Dashboard Visuals y Eventos (Remoción de Verde y Links Rotos)
#### [MODIFY] [components/features/analytics/dashboard-stats.tsx](file:///home/alberto/Documentos/Proyectos/mkt-notes-hub/components/features/analytics/dashboard-stats.tsx)
- Eliminar el fondo verde (`bg-success/5`) y utilizar los tokens `bg-brand/10 text-brand` en tarjetas de métricas.
#### [MODIFY] [app/[locale]/(app)/dashboard/page.tsx](file:///home/alberto/Documentos/Proyectos/mkt-notes-hub/app/[locale]/(app)/dashboard/page.tsx)
- Proveer funcionalidad de enlace a los botones "Auditar estrategia" y activar el onClick en las tarjetas de campaña hacia `/campaigns/[id]`.

### 3. Traducciones Modulares (Ideation)
#### [MODIFY] [components/CreateIdeaDialog.tsx](file:///home/alberto/Documentos/Proyectos/mkt-notes-hub/components/CreateIdeaDialog.tsx)
- Reemplazar textos estáticos ("NUEVA IDEA CREATIVA", "Título de la idea") por soporte internacional mediante `next-intl`.
#### [MODIFY] [i18n/locales/es.json](file:///home/alberto/Documentos/Proyectos/mkt-notes-hub/i18n/locales/es.json)
- Completar la sección de traducciones en español para el Sandbox y los Modales.

### 4. Edición de Estado de Contenido
#### [MODIFY] Gestor de Contenido (`app/[locale]/(app)/content/page.tsx`)
- Sincronizar y habilitar el cambio de estado (Draft -> In Progress -> Published) mediante la UI actualizando el enums en tiempo real.

## Verification Plan
1. Acceder al dashboard y comprobar que la barra no puede colapsarse.
2. Abrir el modal del planner y verificar que el fondo de los inputs de texto permita leer lo escrito.
3. Hacer click en las campañas del dashboard para validar navegación.
4. Cambiar el estado de un contenido sin causar un error de base de datos de enum.
