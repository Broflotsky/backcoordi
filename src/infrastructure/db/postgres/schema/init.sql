-- ===================================================================
-- Coordinadora - Sistema de Gestión de Envíos
-- Script de inicialización de base de datos PostgreSQL
-- ===================================================================

-- ===================================================================
-- CREACIÓN DE TABLAS
-- ===================================================================

-- Tabla de roles de usuario
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE roles IS 'Roles de acceso al sistema (admin, usuario)';

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE users IS 'Usuarios del sistema, tanto administradores como clientes';

-- Tabla de ubicaciones
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_location_name_department UNIQUE (name, department)
);

COMMENT ON TABLE locations IS 'Ciudades y ubicaciones para orígenes y destinos de envíos';

-- Tabla de transportistas
CREATE TABLE IF NOT EXISTS transporters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  available_capacity INTEGER NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_available_capacity CHECK (available_capacity >= 0),
  CONSTRAINT check_max_available_capacity CHECK (available_capacity <= capacity)
);

COMMENT ON TABLE transporters IS 'Transportistas disponibles para realizar envíos';

-- Tabla de tipos de productos
CREATE TABLE IF NOT EXISTS product_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  min_weight_grams INTEGER NOT NULL CHECK (min_weight_grams >= 0),
  max_weight_grams INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_weight_range CHECK (min_weight_grams < max_weight_grams OR max_weight_grams IS NULL)
);

COMMENT ON TABLE product_types IS 'Categorías de productos para envíos (sobres, paquetes, etc.)';

-- Tabla de rutas
CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  origin_id INTEGER NOT NULL REFERENCES locations(id),
  destination_id INTEGER NOT NULL REFERENCES locations(id),
  estimated_time INTERVAL NOT NULL,
  distance DECIMAL(10, 2) CHECK (distance > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_different_locations CHECK (origin_id != destination_id),
  CONSTRAINT unique_route UNIQUE (origin_id, destination_id)
);

COMMENT ON TABLE routes IS 'Rutas predefinidas entre ubicaciones con tiempo estimado';

-- Tabla de envíos
CREATE TABLE IF NOT EXISTS shipments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  origin_id INTEGER NOT NULL REFERENCES locations(id),
  destination_id INTEGER NOT NULL REFERENCES locations(id),
  destination_detail TEXT,
  product_type_id INTEGER NOT NULL REFERENCES product_types(id),
  weight_grams INTEGER NOT NULL CHECK (weight_grams > 0),
  dimensions TEXT NOT NULL,
  recipient_name VARCHAR(200) NOT NULL,
  recipient_address TEXT NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  recipient_document VARCHAR(30) NOT NULL,
  tracking_code VARCHAR(30) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE shipments IS 'Envíos registrados en el sistema';

-- Tabla de historial de estado de envíos
CREATE TABLE IF NOT EXISTS shipment_status_history (
  id SERIAL PRIMARY KEY,
  shipment_id INTEGER NOT NULL REFERENCES shipments(id),
  status VARCHAR(50) NOT NULL,
  comment TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  CONSTRAINT check_valid_status CHECK (status IN ('En espera', 'En transito', 'Entregado'))
);

COMMENT ON TABLE shipment_status_history IS 'Historial de cambios de estado de los envíos';

-- Tabla de asignaciones de envíos
CREATE TABLE IF NOT EXISTS shipment_assignments (
  id SERIAL PRIMARY KEY,
  shipment_id INTEGER NOT NULL REFERENCES shipments(id),
  route_id INTEGER NOT NULL REFERENCES routes(id),
  transporter_id INTEGER REFERENCES transporters(id),
  admin_id INTEGER NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT,
  CONSTRAINT unique_shipment_assignment UNIQUE (shipment_id, route_id)
);

COMMENT ON TABLE shipment_assignments IS 'Asignaciones de envíos a rutas y transportistas';

-- ===================================================================
-- INSERCIÓN DE DATOS INICIALES
-- ===================================================================

-- Datos de roles
INSERT INTO roles (name) VALUES
  ('admin'),
  ('user')
ON CONFLICT (name) DO NOTHING;

-- Datos iniciales de tipos de producto
INSERT INTO product_types (name, min_weight_grams, max_weight_grams, description) VALUES
  ('sobre', 0, 1000, 'Documentos y sobres pequeños de 0 a 1000 gramos'),
  ('paquete', 1001, 20000, 'Paquetes estándar de 1001 a 20000 gramos'),
  ('paquete pesado', 20001, NULL, 'Paquetes grandes o pesados de 20001 gramos en adelante')
ON CONFLICT (name) DO NOTHING;

-- Datos de ciudades principales de Colombia
INSERT INTO locations (name, department, address, lat, lng) VALUES
  ('Bogotá', 'Cundinamarca', 'Centro Administrativo', 4.6097, -74.0817),
  ('Medellín', 'Antioquia', 'Centro de la ciudad', 6.2476, -75.5658),
  ('Cali', 'Valle del Cauca', 'Centro de la ciudad', 3.4516, -76.5320),
  ('Barranquilla', 'Atlántico', 'Centro de la ciudad', 10.9639, -74.7964),
  ('Cartagena', 'Bolívar', 'Centro Histórico', 10.3910, -75.4794),
  ('Cúcuta', 'Norte de Santander', 'Centro de la ciudad', 7.8939, -72.5078),
  ('Bucaramanga', 'Santander', 'Centro de la ciudad', 7.1254, -73.1198),
  ('Pereira', 'Risaralda', 'Centro de la ciudad', 4.8133, -75.6961),
  ('Santa Marta', 'Magdalena', 'Centro Histórico', 11.2404, -74.1990),
  ('Ibagué', 'Tolima', 'Centro de la ciudad', 4.4318, -75.2322),
  ('Pasto', 'Nariño', 'Centro de la ciudad', 1.2136, -77.2811),
  ('Manizales', 'Caldas', 'Centro de la ciudad', 5.0689, -75.5174),
  ('Neiva', 'Huila', 'Centro de la ciudad', 2.9273, -75.2820),
  ('Villavicencio', 'Meta', 'Centro de la ciudad', 4.1533, -73.6351),
  ('Armenia', 'Quindío', 'Centro de la ciudad', 4.5343, -75.6738),
  ('Valledupar', 'Cesar', 'Centro de la ciudad', 10.4631, -73.2532),
  ('Montería', 'Córdoba', 'Centro de la ciudad', 8.7575, -75.8853),
  ('Popayán', 'Cauca', 'Centro Histórico', 2.4448, -76.6147),
  ('Sincelejo', 'Sucre', 'Centro de la ciudad', 9.3047, -75.3978),
  ('Tunja', 'Boyacá', 'Centro Histórico', 5.5446, -73.3557)
ON CONFLICT (name, department) DO NOTHING;

-- Rutas entre las principales ciudades
INSERT INTO routes (origin_id, destination_id, estimated_time, distance)
SELECT o.id, d.id, 
       -- Tiempo estimado (intervalo)
       CASE 
           WHEN o.name = 'Bogotá' AND d.name = 'Medellín' THEN INTERVAL '8 hours'
           WHEN o.name = 'Bogotá' AND d.name = 'Cali' THEN INTERVAL '10 hours'
           WHEN o.name = 'Bogotá' AND d.name = 'Barranquilla' THEN INTERVAL '20 hours'
           WHEN o.name = 'Bogotá' AND d.name = 'Cartagena' THEN INTERVAL '22 hours'
           WHEN o.name = 'Medellín' AND d.name = 'Bogotá' THEN INTERVAL '8 hours'
           WHEN o.name = 'Medellín' AND d.name = 'Cali' THEN INTERVAL '9 hours'
           WHEN o.name = 'Medellín' AND d.name = 'Barranquilla' THEN INTERVAL '14 hours'
           WHEN o.name = 'Medellín' AND d.name = 'Cartagena' THEN INTERVAL '13 hours'
           WHEN o.name = 'Cali' AND d.name = 'Bogotá' THEN INTERVAL '10 hours'
           WHEN o.name = 'Cali' AND d.name = 'Medellín' THEN INTERVAL '9 hours'
           WHEN o.name = 'Cali' AND d.name = 'Barranquilla' THEN INTERVAL '22 hours'
           WHEN o.name = 'Cali' AND d.name = 'Cartagena' THEN INTERVAL '20 hours'
           WHEN o.name = 'Barranquilla' AND d.name = 'Bogotá' THEN INTERVAL '20 hours'
           WHEN o.name = 'Barranquilla' AND d.name = 'Medellín' THEN INTERVAL '14 hours'
           WHEN o.name = 'Barranquilla' AND d.name = 'Cali' THEN INTERVAL '22 hours'
           WHEN o.name = 'Barranquilla' AND d.name = 'Cartagena' THEN INTERVAL '2 hours'
           WHEN o.name = 'Cartagena' AND d.name = 'Bogotá' THEN INTERVAL '22 hours'
           WHEN o.name = 'Cartagena' AND d.name = 'Medellín' THEN INTERVAL '13 hours'
           WHEN o.name = 'Cartagena' AND d.name = 'Cali' THEN INTERVAL '20 hours'
           WHEN o.name = 'Cartagena' AND d.name = 'Barranquilla' THEN INTERVAL '2 hours'
           ELSE INTERVAL '12 hours' -- Valor por defecto
       END,
       -- Distancia en km
       CASE 
           WHEN o.name = 'Bogotá' AND d.name = 'Medellín' THEN 414
           WHEN o.name = 'Bogotá' AND d.name = 'Cali' THEN 461
           WHEN o.name = 'Bogotá' AND d.name = 'Barranquilla' THEN 1002
           WHEN o.name = 'Bogotá' AND d.name = 'Cartagena' THEN 1050
           WHEN o.name = 'Medellín' AND d.name = 'Bogotá' THEN 414
           WHEN o.name = 'Medellín' AND d.name = 'Cali' THEN 419
           WHEN o.name = 'Medellín' AND d.name = 'Barranquilla' THEN 701
           WHEN o.name = 'Medellín' AND d.name = 'Cartagena' THEN 637
           WHEN o.name = 'Cali' AND d.name = 'Bogotá' THEN 461
           WHEN o.name = 'Cali' AND d.name = 'Medellín' THEN 419
           WHEN o.name = 'Cali' AND d.name = 'Barranquilla' THEN 1122
           WHEN o.name = 'Cali' AND d.name = 'Cartagena' THEN 1061
           WHEN o.name = 'Barranquilla' AND d.name = 'Bogotá' THEN 1002
           WHEN o.name = 'Barranquilla' AND d.name = 'Medellín' THEN 701
           WHEN o.name = 'Barranquilla' AND d.name = 'Cali' THEN 1122
           WHEN o.name = 'Barranquilla' AND d.name = 'Cartagena' THEN 120
           WHEN o.name = 'Cartagena' AND d.name = 'Bogotá' THEN 1050
           WHEN o.name = 'Cartagena' AND d.name = 'Medellín' THEN 637
           WHEN o.name = 'Cartagena' AND d.name = 'Cali' THEN 1061
           WHEN o.name = 'Cartagena' AND d.name = 'Barranquilla' THEN 120
           ELSE 500 -- Valor por defecto
       END
FROM locations o, locations d
WHERE o.id != d.id
AND o.name IN ('Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena')
AND d.name IN ('Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena')
ON CONFLICT (origin_id, destination_id) DO NOTHING;

-- Transportistas de prueba
INSERT INTO transporters (name, vehicle_type, capacity, available_capacity, available) VALUES
  ('TransExpress', 'Camión', 5000000, 5000000, true),
  ('RapidShip', 'Furgoneta', 1000000, 1000000, true),
  ('MegaTransport', 'Camión Grande', 10000000, 10000000, true),
  ('CityDelivery', 'Moto', 50000, 50000, true),
  ('FastConnect', 'Furgoneta', 800000, 0, false),
  ('HeavyLoad', 'Camión', 7500000, 7500000, true),
  ('ExpressDelivery', 'Moto', 30000, 30000, true)
ON CONFLICT DO NOTHING;

-- Usuario administrador por defecto (password_hash corresponde a 'admin123' - en producción usar hash real)
INSERT INTO users (first_name, last_name, email, password_hash, role_id, address)
VALUES (
  'Admin', 
  'Sistema', 
  'admin@coordinadora.com', 
  '$2a$10$XgNUv.vxNCDjnH4OKY2DneeIY1zyPGT/p8XO.9fP.RzQFxmvmPeYi', -- hash para 'admin123'
  (SELECT id FROM roles WHERE name = 'admin'),
  'Oficina Central'
)
ON CONFLICT (email) DO NOTHING;

-- Usuario cliente de prueba (password_hash corresponde a 'user123' - en producción usar hash real)
INSERT INTO users (first_name, last_name, email, password_hash, role_id, address)
VALUES (
  'Usuario', 
  'Prueba', 
  'usuario@ejemplo.com', 
  '$2a$10$iWPsUmVxAgw7kDk/hZOzWehIq0k6NHxVjZKXAScbFZGVe7pOH3k1.', -- hash para 'user123'
  (SELECT id FROM roles WHERE name = 'user'),
  'Calle 78 Sur # 35-100, Medellín'
)
ON CONFLICT (email) DO NOTHING;
