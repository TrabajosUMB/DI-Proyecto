const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const mysql = require('mysql2/promise');
const { testConnection } = require('./config/db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(xss());
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 solicitudes por ventana
});
app.use('/api/', limiter);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../templates')));

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '../uploads');
if (!require('fs').existsSync(uploadDir)) {
    require('fs').mkdirSync(uploadDir, { recursive: true });
}

// Servir archivos estáticos de uploads
app.use('/uploads', express.static(uploadDir));

// Probar conexión a la base de datos
testConnection()
    .then(() => {
        console.log('Base de datos conectada exitosamente');
    })
    .catch((error) => {
        console.error('Error al conectar la base de datos:', error);
        process.exit(1);
    });

// Base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware para agregar la conexión a la base de datos a cada request
app.use((req, res, next) => {
    req.app.locals.db = pool;
    next();
});

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/denuncias', require('./routes/denuncias'));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../templates/index.html'));
});

// Ruta de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../templates/login.html'));
});

// Ruta de registro
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../templates/register.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
