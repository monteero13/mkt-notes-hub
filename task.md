# Tareas Activas: Centro de Soporte, Acceso a Guía, Créditos del Desarrollador y Stripe Real

Este documento es nuestra lista de tareas activa para el desarrollo de la Fase de Centro de Soporte, Re-acceso a Onboarding, Créditos del Desarrollador y la Conexión de Facturación Real con Stripe.

---

## 🛠️ Lista de Tareas (TODO)

### 1. Espacio de Trabajo Zen (Eliminación de Ruido Visual)
- `[x]` **Estilos de Enfoque y Zen en `app/globals.css`**
- `[x]` **Menú Lateral Colapsable (`components/layout/app-sidebar.tsx`)**
- `[x]` **Control de Enfoque en `components/layout/app-topbar.tsx`**

### 2. Sincronización del Planificador Unificado
- `[x]` **Consultas Globales `useTasks` en `hooks/use-features-data.ts`**
- `[x]` **Planificador Unificado (`app/[locale]/(app)/planner/page.tsx`)**
- `[x]` **Checklist Interactivo & Entrada Rápida en Panel Lateral**

### 3. Hub de Distribución Social Inmediata
- `[x]` **Componente `SocialDistributionModal`**
- `[x]` **Integrar Distribución en Matriz de Contenido (`app/[locale]/(app)/content/page.tsx`)**

### 4. Suscripción Profesional y Facturación Real de Stripe (Producción & Sandbox)
- `[x]` **Server Actions Administrativas Reales (`lib/stripe-actions.ts`)**
- `[x]` **Adaptación Core de Stripe (`lib/stripe.ts`)**
- `[x]` **Vista de Facturación de Alto Impacto (`app/[locale]/(app)/billing/page.tsx`)**
- `[x]` **Eliminación Total de Simulaciones Sandbox (Pasarela de Pago Virtual Modals)**
- `[x]` **Eliminación del Historial de Facturación Simulado (`mockInvoices`)**
- `[x]` **Botón de Upgrade Enlazado a Pasarela de Stripe Real**
- `[x]` **Botón de Gestión de Suscripción Enlazado al Customer Billing Portal de Stripe**

### 5. Sistema de Presencia en Tiempo Real (Online Status)
- `[x]` **Garantizar y Verificar el Sistema de Notificaciones en Tiempo Real**
- `[x]` **Sincronización Global de Presencia (`hooks/use-workspace.ts`)**
- `[x]` **Visualización de Estado Conectado (`components/ui/avatar-group.tsx`)**
- `[x]` **Indicador Dinámico en Cabecera (`components/layout/app-topbar.tsx`)**

### 6. Optimización y Rediseño del Onboarding (Flujo Progresivo y Side-by-Side)
- `[x]` **Sincronización de Base de Datos para Onboarding Tour (`components/features/onboarding/onboarding-tour.tsx`)**
- `[x]` **Corrección de Joyride Tutorial (`components/OnboardingTutorial.tsx`)**
- `[x]` **Rediseño del Onboarding en 2 Pasos (`app/[locale]/onboarding/page.tsx`)**

### 7. Centro de Soporte, Re-acceso a Onboarding y Créditos del Desarrollador
- `[x]` **Resolver Bug de Re-ingreso al Onboarding (Creación de Workspace)**
  - `[x]` Pasar el parámetro `force=true` en los enlaces de creación de workspace en `team/page.tsx`.
  - `[x]` Soportar parámetro `force=true` en `app/[locale]/onboarding/page.tsx` para evitar redirecciones automáticas a `/dashboard`.
- `[x]` **Sincronización Global de Tour Interactivo en Ajustes**
  - `[x]` Escuchar el evento global `open-onboarding-tour` en `components/features/onboarding/onboarding-tour.tsx` para iniciar el tour en el dashboard.
- `[x]` **Centro de Soporte, Ayuda y Sección de Escucha en Ajustes (`settings/page.tsx`)**
  - `[x]` Agregar las localizaciones en `es.json` y `en.json`.
  - `[x]` Crear una tarjeta premium de diseño fluido "Centro de Soporte y Sugerencias" en la columna derecha de Ajustes.
  - `[x]` Botón 1: "Iniciar Recorrido" que redirige al dashboard y activa el tour interactivo.
- `[x]` **Créditos del Desarrollador en Landing Page Footer**
  - `[x]` Agregar `@albeertomontero_` con enlace de Instagram en `components/features/landing/footer.tsx`.

### 8. Formularios de Contacto Seguros y Conmutador de Temas Avanzado
- `[x]` **Ruta de API Segura de Contacto (`app/api/contact/route.ts`)**
- `[x]` **Diálogo de Soporte Dinámico Integrado (`app/[locale]/(app)/settings/page.tsx`)**
- `[x]` **Conmutador de Tema Deslizable Premium (`components/layout/app-sidebar.tsx`)**
- `[x]` **Adaptar Sidebar Colapsado para Mantener Logo Oficial en Miniatura**
  - `[x]` Modificar `components/layout/logo.tsx` para usar `/mktlogocerrado.png` con un tamaño equilibrado de 36px cuando el sidebar esté plegado.

---

## 📅 Historial y Próximo Paso
- **Estado Actual:** ¡Fase 9 completada con éxito rotundo! La integración real con Stripe (Checkout y Portal de Clientes), la eliminación de simulaciones sandbox y el logo oficial del sidebar colapsado han sido completamente implementados y validados con un build 100% exitoso.
- **Siguiente Acción:** Entregar el informe de cambios al usuario y ofrecer la creación de un Knowledge Item para futuras sesiones.