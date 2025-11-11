-- TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmation_token VARCHAR(255)
);

-- TABLA DE LOS TABLEROS
-- MODIFICACIÓN DE LA TABLA TABLERO PARA IMPLEMENTAR SUSCRIPCION FREEMIUM
CREATE TABLE IF NOT EXISTS tablero (
    id_tablero BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    background VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Columna para el creador (usada en la lógica Freemium)
    id_usuario_creador BIGINT NOT NULL,

    -- Columna que apunta al Workspace padre
    id_workspace BIGINT NOT NULL,

    -- Clave Foránea al Creador
    FOREIGN KEY (id_usuario_creador)
        REFERENCES usuario (id_usuario)
        ON DELETE NO ACTION,

    -- Clave Foránea al Workspace
    FOREIGN KEY (id_workspace)
        REFERENCES workspace (id)
        ON DELETE CASCADE -- Si el Workspace se borra, los Tableros se borran
);

-- TABLA INTERMEDIA PARA USUARIOS-TABLERO
CREATE TABLE IF NOT EXISTS miembro_tablero (
    id_usuario BIGINT NOT NULL,
    id_tablero BIGINT NOT NULL,
    rol VARCHAR(20) DEFAULT 'lector',
    PRIMARY KEY (id_usuario, id_tablero),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_tablero) REFERENCES tablero(id_tablero)
);


-- TABLA DE LISTAS
CREATE TABLE IF NOT EXISTS lista (
    id_lista BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    orden INT NOT NULL,
    id_tablero BIGINT NOT NULL,
    FOREIGN KEY (id_tablero) REFERENCES tablero(id_tablero)
);


-- TABLA DE TARJETAS
CREATE TABLE IF NOT EXISTS tarjeta (
    id_tarjeta BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expira_en DATETIME,
    card_order INT NOT NULL,
    id_lista BIGINT NOT NULL,
    FOREIGN KEY (id_lista) REFERENCES lista(id_lista)
);


-- TABLA DE COMENTARIOS
CREATE TABLE IF NOT EXISTS comentario (
    id_comentario BIGINT AUTO_INCREMENT PRIMARY KEY,
    contenido TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario BIGINT NOT NULL,
    id_tarjeta BIGINT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_tarjeta) REFERENCES tarjeta(id_tarjeta)
);


-- TABLA DE ETIQUETAS
CREATE TABLE IF NOT EXISTS etiqueta (
    id_etiqueta BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    color VARCHAR(20),
    id_tablero BIGINT NOT NULL,
    FOREIGN KEY (id_tablero) REFERENCES tablero(id_tablero)
);


-- TABLA INTERMEDIA PARA TARJETAS-ETIQUETAS
CREATE TABLE IF NOT EXISTS tarjeta_etiqueta (
    id_tarjeta BIGINT NOT NULL,
    id_etiqueta BIGINT NOT NULL,
    PRIMARY KEY (id_tarjeta, id_etiqueta),
    FOREIGN KEY (id_tarjeta) REFERENCES tarjeta(id_tarjeta),
    FOREIGN KEY (id_etiqueta) REFERENCES etiqueta(id_etiqueta)
);


-- TABLA DE ARCHIVOS (OPCIONAL)
CREATE TABLE IF NOT EXISTS archivo (
    id_archivo BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    id_tarjeta BIGINT NOT NULL,
    FOREIGN KEY (id_tarjeta) REFERENCES tarjeta(id_tarjeta)
);

-- TABLA DE HISTORIAL DE MOVIMIENTOS DE TARJETAS
CREATE TABLE IF NOT EXISTS historial_movimiento (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_tarjeta BIGINT NOT NULL,
    id_lista_origen BIGINT NULL,
    id_lista_destino BIGINT NOT NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tarjeta) REFERENCES tarjeta(id_tarjeta),
    FOREIGN KEY (id_lista_origen) REFERENCES lista(id_lista),
    FOREIGN KEY (id_lista_destino) REFERENCES lista(id_lista)
);

-- TABLA DE TOKENS DE REFRESCO
CREATE TABLE IF NOT EXISTS tokens_refresco (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(100) NOT NULL UNIQUE,
    fecha_expiracion TIMESTAMP NOT NULL,
    id_duenio BIGINT NOT NULL,
    FOREIGN KEY (id_duenio) REFERENCES usuario(id_usuario)
);

--------------TABLA DE INVITACIONES ------------------
CREATE TABLE invitacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    invitee_email VARCHAR(255) NOT NULL,
    id_tablero BIGINT NOT NULL,
    id_usuario_invitador BIGINT NOT NULL,
    expires_at DATETIME,
    fecha_creacion DATETIME NOT NULL,

    -- Restricción para asegurar que el tablero exista
    FOREIGN KEY (id_tablero) REFERENCES tablero(id_tablero),

    -- Restricción para asegurar que el usuario invitador exista
    FOREIGN KEY (id_usuario_invitador) REFERENCES usuario(id_usuario)
);

---------------TABLA WORKSPACE----------------
CREATE TABLE IF NOT EXISTS WORKSPACE (
  id BIGINT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,

  owner_id BIGINT NOT NULL,

  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  CONSTRAINT fk_workspace_owner_user
    FOREIGN KEY (owner_id)
    REFERENCES usuario (id_usuario)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;


-------------TABLA WORKSPACE_MIEMBROS (INTERMEDIA)------------------
CREATE TABLE IF NOT EXISTS workspace_miembros (
  workspace_id BIGINT NOT NULL,
  miembro_id BIGINT NOT NULL,

  -- Rol del usuario dentro del workspace (ej: 'MEMBER', 'ADMIN')
  rol VARCHAR(50) NOT NULL DEFAULT 'MEMBER',

  PRIMARY KEY (workspace_id, miembro_id),

  CONSTRAINT fk_ws_miembros_workspace
    FOREIGN KEY (workspace_id)
    REFERENCES WORKSPACE (id)
    ON DELETE CASCADE  -- Si se borra el Workspace, se borran las membresías
    ON UPDATE NO ACTION,

  CONSTRAINT fk_ws_miembros_user
    FOREIGN KEY (miembro_id)
    REFERENCES usuario (id_usuario)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- TABLA DE SUSCRIPCIONES
CREATE TABLE IF NOT EXISTS suscripcion (
    id_usuario BIGINT NOT NULL PRIMARY KEY, -- Clave primaria es el ID del usuario (1 a 1)

    -- ID del cliente en Stripe (o cualquier PSP)
    stripe_customer_id VARCHAR(255) UNIQUE NULL,

    -- ID del objeto de suscripción en Stripe
    stripe_subscription_id VARCHAR(255) UNIQUE NULL,

    -- Estado: 'FREE', 'ACTIVE', 'PAST_DUE', 'CANCELED'
    estado VARCHAR(50) NOT NULL DEFAULT 'FREE',

    -- Fecha del próximo cargo o expiración
    fecha_expiracion DATETIME NULL,

    -- FK al usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
) ENGINE = InnoDB;