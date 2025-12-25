# K-Board

Este es un proyecto Front-End sobre un tablero Kanban minimalista y eficiente.

## Funcionalidades destacadas

- **Gestión de Tareas (CRUD):** Creación, edición de contenido en tiempo real y eliminación de tareas.
- **Drag & Drop:** Experiencia fluida para reordenar tareas utilizando sensores de puntero optimizados.
- **Validación de Flujo Estricta:** Implementación de lógica de negocio que solo permite mover tareas a columnas adyacentes (ej. de _Pendiente_ → _En Progreso_), bloqueando saltos de estado inválidos para asegurar la integridad del proceso y el flujo correcto de las tareas.
- **Persistencia de Datos:** Integración de Middleware en Zustand para sincronizar el estado automáticamente con `localStorage`, manteniendo tus tareas seguras al recargar.
- **UI/UX Moderna:** Interfaz oscura, tarjetas reactivas y feedback visual inmediato.

## Stack tecnológico

- **Core:** React + TypeScript
- **Estilos:** Tailwind CSS
- **Gestión de Estado:** Zustand
- **Interactividad:** @dnd-kit
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
