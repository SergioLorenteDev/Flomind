-- Migrations to align legacy schema with new entity field names
SET @schemaName := DATABASE();

-- Rename fecha_creacion -> creada_en (if column exists)
SET @has_fecha_creacion :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'tarjeta'
          AND COLUMN_NAME = 'fecha_creacion');
SET @sql := IF(@has_fecha_creacion = 1,
    'ALTER TABLE tarjeta RENAME COLUMN fecha_creacion TO creada_en;',
    'SELECT ''fecha_creacion already migrated'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure historial_movimiento table exists (idempotent)
SET @has_historial :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'historial_movimiento');
SET @sql := IF(@has_historial = 0,
    'CREATE TABLE historial_movimiento (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_tarjeta INT NOT NULL,
        id_lista_origen INT NULL,
        id_lista_destino INT NOT NULL,
        fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_tarjeta) REFERENCES tarjeta(id_tarjeta),
        FOREIGN KEY (id_lista_origen) REFERENCES lista(id_lista),
        FOREIGN KEY (id_lista_destino) REFERENCES lista(id_lista)
    );',
    'SELECT ''historial_movimiento already exists'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename fecha_vencimiento -> expira_en
SET @has_fecha_vencimiento :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'tarjeta'
          AND COLUMN_NAME = 'fecha_vencimiento');
SET @sql := IF(@has_fecha_vencimiento = 1,
    'ALTER TABLE tarjeta RENAME COLUMN fecha_vencimiento TO expira_en;',
    'SELECT ''fecha_vencimiento already migrated'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add comienza_en column if missing
SET @has_comienza_en :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'tarjeta'
          AND COLUMN_NAME = 'comienza_en');
SET @sql := IF(@has_comienza_en = 0,
    'ALTER TABLE tarjeta ADD COLUMN comienza_en DATETIME;',
    'SELECT ''comienza_en already exists'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename orden -> card_order
SET @has_orden :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'tarjeta'
          AND COLUMN_NAME = 'orden');
SET @sql := IF(@has_orden = 1,
    'ALTER TABLE tarjeta RENAME COLUMN orden TO card_order;',
    'SELECT ''orden already migrated'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add descripcion column if missing
SET @has_descripcion :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'tarjeta'
          AND COLUMN_NAME = 'descripcion');
SET @sql := IF(@has_descripcion = 0,
    'ALTER TABLE tarjeta ADD COLUMN descripcion TEXT;',
    'SELECT ''descripcion already exists'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add background column to tablero if missing
SET @has_background :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'tablero'
          AND COLUMN_NAME = 'background');
SET @sql := IF(@has_background = 0,
    'ALTER TABLE tablero ADD COLUMN background VARCHAR(255);',
    'SELECT ''background already exists'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add is_verified column to usuario if missing
SET @has_is_verified :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'usuario'
          AND COLUMN_NAME = 'is_verified');
SET @sql := IF(@has_background = 0,
    'ALTER TABLE usuario ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false;',
    'SELECT ''is_verified already exists'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add is_verified column to usuario if missing
SET @has_fecha_creacion :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'usuario'
          AND COLUMN_NAME = 'fecha_creacion');
SET @sql := IF(@has_background = 0,
    'ALTER TABLE usuario ADD COLUMN fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;',
    'SELECT ''fecha_creacion already exists'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add confirmation_token column to usuario if missing
SET @has_confirmation_token :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'usuario'
          AND COLUMN_NAME = 'confirmation_token');
SET @sql := IF(@has_background = 0,
    'ALTER TABLE usuario ADD COLUMN confirmation_token VARCHAR(255);',
    'SELECT ''confirmation_token already exists'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure etiqueta table exists
SET @has_etiqueta_table :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'etiqueta');
SET @sql := IF(@has_etiqueta_table = 0,
    'CREATE TABLE etiqueta (
        id_etiqueta BIGINT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        color VARCHAR(20),
        id_tablero BIGINT NOT NULL,
        CONSTRAINT fk_etiqueta_tablero FOREIGN KEY (id_tablero) REFERENCES tablero(id_tablero)
     );',
    'SELECT ''etiqueta already exists'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure tarjeta_etiqueta join table exists
SET @has_tarjeta_etiqueta :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'tarjeta_etiqueta');
SET @sql := IF(@has_tarjeta_etiqueta = 0,
    'CREATE TABLE tarjeta_etiqueta (
        id_tarjeta BIGINT NOT NULL,
        id_etiqueta BIGINT NOT NULL,
        PRIMARY KEY (id_tarjeta, id_etiqueta),
        CONSTRAINT fk_tarjeta_etiqueta_tarjeta FOREIGN KEY (id_tarjeta) REFERENCES tarjeta(id_tarjeta) ON DELETE CASCADE,
        CONSTRAINT fk_tarjeta_etiqueta_etiqueta FOREIGN KEY (id_etiqueta) REFERENCES etiqueta(id_etiqueta) ON DELETE CASCADE
     );',
    'SELECT ''tarjeta_etiqueta already exists'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
