-- ============================================
-- MEJORAS PARA LA BASE DE DATOS - SUPABASE
-- ============================================
-- Ejecuta estos comandos en el SQL Editor de Supabase

-- 1. AGREGAR NUEVOS ESTADOS AL ENUM estado_reserva
-- ============================================

-- Primero, verifica qué estados existen actualmente
-- SELECT unnest(enum_range(NULL::estado_reserva));

-- Agregar 'en_entrega' al enum
ALTER TYPE estado_reserva ADD VALUE IF NOT EXISTS 'en_entrega';

-- Agregar 'entregado' al enum (para cuando se complete la entrega)
ALTER TYPE estado_reserva ADD VALUE IF NOT EXISTS 'entregado';

-- 2. AGREGAR COLUMNAS OPCIONALES PARA LOGÍSTICA
-- ============================================

-- Columna para registrar qué operador de logística reclamó la reserva
ALTER TABLE reservas 
ADD COLUMN IF NOT EXISTS operador_logistica_id VARCHAR(50);

-- Columna para observaciones de logística
ALTER TABLE reservas 
ADD COLUMN IF NOT EXISTS observaciones_logistica TEXT;

-- 3. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

-- Índice para buscar reservas expiradas rápidamente
CREATE INDEX IF NOT EXISTS idx_reservas_expires_at 
ON reservas(expires_at) 
WHERE estado NOT IN ('cancelado', 'en_entrega', 'entregado');

-- Índice para buscar reservas por usuario y estado
CREATE INDEX IF NOT EXISTS idx_reservas_usuario_estado 
ON reservas(usuario_id, estado);

-- 4. FUNCIÓN PARA DECREMENTAR STOCK (opcional pero recomendado)
-- ============================================

CREATE OR REPLACE FUNCTION decrementar_stock(
  id_producto_in INTEGER,
  cantidad_in INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE productos
  SET stock_disponible = stock_disponible - cantidad_in
  WHERE id = id_producto_in;
  
  -- Verificar que no quedó en negativo
  IF (SELECT stock_disponible FROM productos WHERE id = id_producto_in) < 0 THEN
    RAISE EXCEPTION 'Stock insuficiente para producto ID %', id_producto_in;
  END IF;
END;
$$;

-- 5. FUNCIÓN PARA INCREMENTAR STOCK
-- ============================================

CREATE OR REPLACE FUNCTION incrementar_stock(
  id_producto_in INTEGER,
  cantidad_in INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE productos
  SET stock_disponible = stock_disponible + cantidad_in
  WHERE id = id_producto_in;
END;
$$;

-- 6. FUNCIÓN RPC PARA CREAR RESERVA CON TRANSACCIÓN ATÓMICA
-- ============================================

CREATE OR REPLACE FUNCTION crear_reserva_y_descontar_stock(
  id_compra_in VARCHAR(100),
  usuario_id_in INTEGER,
  productos_in JSONB
)
RETURNS TABLE(
  id INTEGER,
  id_compra VARCHAR(100),
  usuario_id INTEGER,
  estado estado_reserva,
  expires_at TIMESTAMPTZ,
  fecha_creacion TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  nueva_reserva_id INTEGER;
  producto JSONB;
  producto_id INTEGER;
  cantidad INTEGER;
  stock_actual INTEGER;
BEGIN
  -- 1. Verificar stock de todos los productos ANTES de crear la reserva
  FOR producto IN SELECT * FROM jsonb_array_elements(productos_in)
  LOOP
    producto_id := (producto->>'producto_id')::INTEGER;
    cantidad := (producto->>'cantidad')::INTEGER;
    
    SELECT stock_disponible INTO stock_actual
    FROM productos
    WHERE id = producto_id;
    
    IF stock_actual IS NULL THEN
      RAISE EXCEPTION 'Producto con ID % no existe.', producto_id;
    END IF;
    
    IF stock_actual < cantidad THEN
      RAISE EXCEPTION 'Stock insuficiente para producto ID %. Disponible: %, Solicitado: %', 
        producto_id, stock_actual, cantidad;
    END IF;
  END LOOP;
  
  -- 2. Crear la reserva
  INSERT INTO reservas (id_compra, usuario_id, estado, expires_at, fecha_creacion)
  VALUES (
    id_compra_in,
    usuario_id_in,
    'pendiente',
    NOW() + INTERVAL '30 minutes',
    NOW()
  )
  RETURNING id INTO nueva_reserva_id;
  
  -- 3. Insertar productos de la reserva Y descontar stock
  FOR producto IN SELECT * FROM jsonb_array_elements(productos_in)
  LOOP
    producto_id := (producto->>'producto_id')::INTEGER;
    cantidad := (producto->>'cantidad')::INTEGER;
    
    -- Insertar en reservas_productos
    INSERT INTO reservas_productos (reserva_id, producto_id, cantidad)
    VALUES (nueva_reserva_id, producto_id, cantidad);
    
    -- Descontar stock
    UPDATE productos
    SET stock_disponible = stock_disponible - cantidad
    WHERE id = producto_id;
  END LOOP;
  
  -- 4. Retornar la reserva creada
  RETURN QUERY
  SELECT 
    r.id,
    r.id_compra,
    r.usuario_id,
    r.estado,
    r.expires_at,
    r.fecha_creacion
  FROM reservas r
  WHERE r.id = nueva_reserva_id;
END;
$$;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Verifica que los nuevos estados existen
SELECT unnest(enum_range(NULL::estado_reserva));

-- Verifica las columnas nuevas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reservas' 
  AND column_name IN ('operador_logistica_id', 'observaciones_logistica');

-- Verifica los índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'reservas';
