# Backend TypeScript Clean Architecture

Proyecto backend utilizando TypeScript, Express y PostgreSQL, siguiendo los principios de Clean Architecture.

## Estructura del Proyecto

```
src/
  ├── domain/             # Entidades y contratos de repositorios
  │   ├── entities/       
  │   └── repositories/   
  │
  ├── application/        # Casos de uso 
  │   └── usecases/       
  │
  ├── infrastructure/     # Implementaciones concretas
  │   ├── db/
  │   │   └── postgres/   # Repositorios para PostgreSQL
  │   └── redis/          # Implementaciones para Redis
  │
  ├── interfaces/         # Adaptadores de entrada
  │   └── http/
  │       ├── controllers/  # Controladores HTTP
  │       ├── routes/       # Definición de rutas
  │       ├── validators/   # Validaciones con express-validator
  │       └── middlewares/  # Middleware de autenticación, errores, etc.
  │
  ├── shared/             # Código compartido
  │   ├── dtos/           # Objetos de transferencia de datos
  │   └── helpers/        # Utilidades
  │
  ├── config/             # Configuración
  │
  ├── app.ts              # Aplicación Express
  └── server.ts           # Punto de entrada
```

## Requisitos

- Node.js (v14+)
- PostgreSQL
- Redis (opcional para futuras implementaciones)

## Instalación

```bash
# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar en producción
npm start
```
