# Esquema de Base de Datos - Coordinadora

Este directorio contiene los scripts necesarios para crear e inicializar la base de datos PostgreSQL del sistema de gestión de envíos.

## Archivo `init.sql`

El archivo `init.sql` contiene todo lo necesario para:

1. **Crear las tablas** del modelo relacional de la base de datos
2. **Configurar las restricciones** (claves primarias, foráneas, restricciones CHECK, etc.)
3. **Cargar datos iniciales** para el funcionamiento del sistema

### Tablas creadas

- `roles` - Roles de usuarios (admin, user)
- `users` - Usuarios del sistema (administradores y clientes)
- `locations` - Ciudades y ubicaciones
- `transporters` - Transportistas disponibles para realizar envíos
- `product_types` - Tipos de productos para envíos
- `routes` - Rutas predefinidas entre ubicaciones
- `shipments` - Envíos registrados
- `shipment_status_history` - Historial de estados de los envíos
- `shipment_assignments` - Asignaciones de envíos a rutas y transportistas

### Datos cargados

El script inicializa la base de datos con:

- **Roles**: admin y user
- **Tipos de producto**: sobre, paquete y paquete pesado con sus límites de peso
- **Ciudades**: Las 20 principales ciudades de Colombia con información geográfica
- **Rutas**: Rutas entre las 5 ciudades principales (Bogotá, Medellín, Cali, Barranquilla, Cartagena)
- **Transportistas**: 7 transportistas ficticios para pruebas
- **Usuarios de prueba**: Un administrador y un usuario regular (cliente)

## Cómo ejecutar el script

### Opción 1: Usando psql (cliente de línea de comandos)

```bash
# Conectar a la base de datos y ejecutar el script
psql -U [usuario] -d [nombre_bd] -f init.sql

# Ejemplo
psql -U postgres -d cleanarchdb -f init.sql
```

### Opción 2: Usando un cliente GUI (pgAdmin, DBeaver, etc.)

1. Abrir el cliente PostgreSQL
2. Conectar a la base de datos deseada
3. Abrir el archivo `init.sql`
4. Ejecutar el script

### Opción 3: Usando Docker

Si estás utilizando Docker con PostgreSQL:

```bash
# Copiar el script al contenedor
docker cp init.sql [nombre_contenedor]:/init.sql

# Ejecutar el script dentro del contenedor
docker exec -it [nombre_contenedor] psql -U [usuario] -d [nombre_bd] -f /init.sql
```

## Notas importantes

- El script utiliza `IF NOT EXISTS` para la creación de tablas y `ON CONFLICT DO NOTHING` para las inserciones, lo que permite ejecutarlo múltiples veces sin errores.
- Las contraseñas de los usuarios de prueba están hasheadas, pero NO deben usarse en producción.
- Para entornos de producción, se recomienda revisar y ajustar las restricciones y datos según sea necesario.
