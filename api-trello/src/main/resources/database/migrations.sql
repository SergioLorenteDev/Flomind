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

-- Ensure espacio_trabajo table exists (legacy databases might miss it)
SET @has_workspace_table :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'espacio_trabajo');
SET @sql := IF(@has_workspace_table = 0,
    'CREATE TABLE espacio_trabajo (
        id_espacio BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        id_usuario_duenio BIGINT NOT NULL,
        CONSTRAINT fk_espacio_usuario_duenio FOREIGN KEY (id_usuario_duenio) REFERENCES usuario(id_usuario) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    'SELECT ''espacio_trabajo already exists'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure workspace_board_link table exists
SET @has_workspace_link_table :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'workspace_board_link');
SET @sql := IF(@has_workspace_link_table = 0,
    'CREATE TABLE workspace_board_link (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        workspace_id BIGINT NOT NULL,
        board_id BIGINT NOT NULL,
        UNIQUE KEY uq_workspace_board (workspace_id, board_id),
        CONSTRAINT fk_wb_workspace FOREIGN KEY (workspace_id) REFERENCES espacio_trabajo(id_espacio) ON DELETE CASCADE,
        CONSTRAINT fk_wb_board FOREIGN KEY (board_id) REFERENCES tablero(id_tablero) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;',
    'SELECT ''workspace_board_link already exists'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add id_espacio column to tablero if missing (required for workspace linkage)
SET @has_tablero_workspace :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'tablero'
          AND COLUMN_NAME = 'id_espacio');
SET @sql := IF(@has_tablero_workspace = 0,
    'ALTER TABLE tablero
        ADD COLUMN id_espacio BIGINT NULL AFTER id_usuario_creador,
        ADD CONSTRAINT fk_tablero_espacio FOREIGN KEY (id_espacio) REFERENCES espacio_trabajo(id_espacio) ON DELETE SET NULL;',
    'SELECT ''tablero.id_espacio already exists'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add is_verified column to usuario if missing
SET @has_is_verified :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'usuario'
          AND COLUMN_NAME = 'is_verified');
SET @sql := IF(@has_is_verified = 0,
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
SET @sql := IF(@has_fecha_creacion = 0,
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
SET @sql := IF(@has_confirmation_token = 0,
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

-- Add comienza_en column to tarjeta if missing
SET @has_comienza_en :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'tarjeta'
          AND COLUMN_NAME = 'comienza_en');
SET @sql := IF(@has_comienza_en = 0,
    'ALTER TABLE tarjeta ADD COLUMN comienza_en TIMESTAMP;',
    'SELECT ''comienza_en already exists'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add comienza_en column to invitacion if missing
SET @has_estado :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'invitacion'
          AND COLUMN_NAME = 'estado');
SET @sql := IF(@has_estado = 0,
    'ALTER TABLE invitacion ADD COLUMN estado ENUM(\'PENDIENTE\', \'ACEPTADA\', \'RECHAZADA\');',
    'SELECT ''estado already exists'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure invitacion.rol column exists
SET @has_invitacion_role :=
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schemaName
          AND TABLE_NAME = 'invitacion'
          AND COLUMN_NAME = 'rol');
SET @sql := IF(@has_invitacion_role = 0,
    'ALTER TABLE invitacion ADD COLUMN rol VARCHAR(20) NOT NULL DEFAULT ''lector'';',
    'SELECT ''invitacion.rol already exists'';');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
