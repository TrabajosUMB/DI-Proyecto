// Colección de usuarios
db.createCollection('usuarios', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['nombre', 'email', 'password', 'tipo_usuario'],
            properties: {
                nombre: {
                    bsonType: 'string',
                    description: 'Nombre del usuario'
                },
                email: {
                    bsonType: 'string',
                    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
                    description: 'Email válido requerido'
                },
                password: {
                    bsonType: 'string',
                    description: 'Contraseña hasheada'
                },
                tipo_usuario: {
                    enum: ['pie', 'carro', 'moto', 'transporte_publico'],
                    description: 'Tipo de usuario'
                },
                createdAt: {
                    bsonType: 'date',
                    description: 'Fecha de creación'
                },
                updatedAt: {
                    bsonType: 'date',
                    description: 'Fecha de última actualización'
                }
            }
        }
    }
});

// Índice único para email
db.usuarios.createIndex({ "email": 1 }, { unique: true });

// Colección de denuncias
db.createCollection('denuncias', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['usuario_id', 'tipo', 'descripcion', 'ubicacion'],
            properties: {
                usuario_id: {
                    bsonType: 'objectId',
                    description: 'ID del usuario que reporta'
                },
                tipo: {
                    enum: ['bache', 'alumbrado'],
                    description: 'Tipo de denuncia'
                },
                descripcion: {
                    bsonType: 'string',
                    description: 'Descripción de la denuncia'
                },
                ubicacion: {
                    bsonType: 'object',
                    required: ['type', 'coordinates'],
                    properties: {
                        type: {
                            enum: ['Point'],
                            description: 'Tipo de geometría'
                        },
                        coordinates: {
                            bsonType: 'array',
                            minItems: 2,
                            maxItems: 2,
                            items: {
                                bsonType: 'double'
                            },
                            description: '[longitud, latitud]'
                        }
                    }
                },
                imagen: {
                    bsonType: 'string',
                    description: 'URL de la imagen'
                },
                audio_url: {
                    bsonType: 'string',
                    description: 'URL del audio'
                },
                es_anonima: {
                    bsonType: 'bool',
                    default: false
                },
                es_colectiva: {
                    bsonType: 'bool',
                    default: false
                },
                tipo_via: {
                    bsonType: 'string'
                },
                estado: {
                    enum: ['pendiente', 'en_proceso', 'resuelta'],
                    default: 'pendiente'
                },
                fecha_reporte: {
                    bsonType: 'date',
                    description: 'Fecha del reporte'
                },
                fecha_resolucion: {
                    bsonType: 'date',
                    description: 'Fecha de resolución'
                }
            }
        }
    }
});

// Índices para denuncias
db.denuncias.createIndex({ "ubicacion": "2dsphere" }); // Índice geoespacial
db.denuncias.createIndex({ "usuario_id": 1 });
db.denuncias.createIndex({ "tipo": 1 });
db.denuncias.createIndex({ "estado": 1 });
db.denuncias.createIndex({ "fecha_reporte": 1, "fecha_resolucion": 1 });

// Colección de calificaciones
db.createCollection('calificaciones', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['denuncia_id', 'usuario_id', 'puntuacion'],
            properties: {
                denuncia_id: {
                    bsonType: 'objectId'
                },
                usuario_id: {
                    bsonType: 'objectId'
                },
                puntuacion: {
                    bsonType: 'int',
                    minimum: 1,
                    maximum: 5
                },
                comentario: {
                    bsonType: 'string'
                },
                fecha: {
                    bsonType: 'date'
                }
            }
        }
    }
});

// Índices para calificaciones
db.calificaciones.createIndex({ "denuncia_id": 1, "usuario_id": 1 }, { unique: true });

// Datos de prueba
db.usuarios.insertMany([
    {
        nombre: 'Usuario a Pie',
        email: 'pie@example.com',
        password: '$2a$10$YourHashedPasswordHere',
        tipo_usuario: 'pie',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        nombre: 'Usuario en Carro',
        email: 'carro@example.com',
        password: '$2a$10$YourHashedPasswordHere',
        tipo_usuario: 'carro',
        createdAt: new Date(),
        updatedAt: new Date()
    }
]);
