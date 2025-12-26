# K-Board

[![Demo](https://img.shields.io/badge/Live_Demo-Ver_Aplicación-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://k-board-project.vercel.app/)

Este es un proyecto Front-End de un tablero Kanban profesional, minimalista y altamente interactivo, diseñado para ofrecer una experiencia de usuario fluida y robusta.

**Pruébalo ahora mismo sin instalar nada:**  https://k-board-project.vercel.app/

## Funcionalidades destacadas

### Gestión de tareas

- **Sistema de prioridades:** Clasificación visual (Baja, Media, Alta) con colores dinámicos.
- **Fechas:** Definición de fecha de inicio y entrega con validación lógica (impide fechas incoherentes).
- **Contadores:** Indicadores visuales automáticos:
  - _Gris:_ Días previstos (planificación).
  - _Azul/Naranja:_ Cuenta atrás en tiempo real.
  - _Rojo:_ Alerta de tareas vencidas.

### Tablero Dinámico

- **Columnas personalizables:** Crea, elimina y reordena columnas según tu flujo de trabajo.
- **Edición inline:** Renombra columnas haciendo doble clic sobre el título.
- **Drag & Drop:** Reordena tanto tareas como columnas completas con una experiencia física y fluida.

### Reglas de Negocio y Seguridad

- **Validación de Flujo Estricta:** Solo permite mover tareas a columnas adyacentes (ej. de _Pendiente_ → _En Progreso_), bloqueando saltos inválidos.
- **Modales de confirmación:** Protección contra borrados accidentales de tareas o columnas.
- **Feedback visual:** Notificaciones tipo "Toast" para errores o confirmaciones de acciones.

### Experiencia de Usuario (UX)

- **Diseño responsive:** Adaptado a móviles con _Scroll Snap_ para una navegación nativa entre columnas.
- **Buscador en tiempo real:** Filtrado instantáneo de tareas por título o descripción.
- **Persistencia de datos:** Sincronización automática con `localStorage` mediante middleware de Zustand.

## Stack tecnológico

- **Core:** React + TypeScript
- **Estilos:** Tailwind CSS
- **Gestión de Estado:** Zustand
- **Interactividad:** @dnd-kit (Core, Sortable, Utilities)
- **Notificaciones:** Sonner
- **Iconos:** Lucide React

## Instalación y ejecución

Para ejecutar este proyecto en local, necesitas tener instalado **Node.js**. Sigue estos pasos:

### 1. Clonar el repositorio

```bash
git clone https://github.com/Manzano99/k-board.git
cd k-board
```

### 2. Instalar dependencias

Este comando descargará e instalará automáticamente todos los paquetes necesarios (Zustand, Tailwind, dnd-kit, etc.) definidos en el `package.json`.

```bash
npm install
```

### 3. Ejecución

Este comando iniciará el entorno local:

```bash
npm run dev
```

### 4. Visualización

Para visualizar la aplicación entra en la siguiente dirección:

http://localhost:5173
