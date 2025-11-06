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
CREATE TABLE IF NOT EXISTS tablero (
    id_tablero BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    background VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario_creador BIGINT NOT NULL,
    FOREIGN KEY (id_usuario_creador) REFERENCES usuario (id_usuario)
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
    comienza_en DATETIME,
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