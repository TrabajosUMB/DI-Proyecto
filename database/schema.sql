-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS civicalert;
USE civicalert;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('pie', 'carro', 'moto', 'transporte_publico') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de tokens inválidos (para logout y seguridad)
CREATE TABLE IF NOT EXISTS invalid_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_expires_at (expires_at)
);

-- Tabla de denuncias
CREATE TABLE IF NOT EXISTS denuncias (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo ENUM('bache', 'alumbrado') NOT NULL,
    descripcion TEXT NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    imagen VARCHAR(255),
    audio_url VARCHAR(255),
    es_anonima BOOLEAN DEFAULT FALSE,
    es_colectiva BOOLEAN DEFAULT FALSE,
    tipo_via VARCHAR(50),
    estado ENUM('pendiente', 'en_proceso', 'resuelta') DEFAULT 'pendiente',
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_tipo (tipo),
    INDEX idx_estado (estado),
    INDEX idx_fechas (fecha_reporte, fecha_resolucion)
);

CREATE TABLE IF NOT EXISTS calificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    denuncia_id INT NOT NULL,
    usuario_id INT NOT NULL,
    puntuacion INT CHECK (puntuacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (denuncia_id) REFERENCES denuncias(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS alertas_seguridad (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    fecha_expiracion TIMESTAMP,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_ubicacion (latitud, longitud),
    INDEX idx_activa (activa)
);

CREATE TABLE IF NOT EXISTS denuncias_colectivas (
    denuncia_id INT,
    usuario_id INT,
    fecha_apoyo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comentario TEXT,
    PRIMARY KEY (denuncia_id, usuario_id),
    FOREIGN KEY (denuncia_id) REFERENCES denuncias(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Procedimiento para limpiar tokens inválidos expirados
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS cleanup_invalid_tokens()
BEGIN
    DELETE FROM invalid_tokens WHERE expires_at < NOW();
END //
DELIMITER ;

-- Evento para ejecutar la limpieza automáticamente
CREATE EVENT IF NOT EXISTS cleanup_tokens_event
ON SCHEDULE EVERY 1 DAY
DO CALL cleanup_invalid_tokens();

-- Insertar datos de prueba
INSERT INTO usuarios (nombre, email, password, tipo_usuario) VALUES
('Usuario a Pie', 'pie@example.com', '$2a$10$YourHashedPasswordHere', 'pie'),
('Usuario en Carro', 'carro@example.com', '$2a$10$YourHashedPasswordHere', 'carro'),
('Usuario en Moto', 'moto@example.com', '$2a$10$YourHashedPasswordHere', 'moto'),
('Usuario en Bus', 'bus@example.com', '$2a$10$YourHashedPasswordHere', 'transporte_publico');

-- Insertar algunas denuncias de prueba
INSERT INTO denuncias (usuario_id, tipo, descripcion, latitud, longitud, estado) VALUES
(1, 'bache', 'Bache profundo en la acera', 4.6097, -74.0817, 'pendiente'),
(2, 'bache', 'Bache grande en vía principal', 4.6098, -74.0818, 'en_proceso'),
(3, 'alumbrado', 'Poste sin luz en la esquina', 4.6099, -74.0819, 'pendiente'),
(4, 'alumbrado', 'Falla en alumbrado de paradero', 4.6100, -74.0820, 'pendiente');
